import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        // In real world, we verify the token from Payme/Click
        // Here we just accept amount from our mock Add Card modal
        const { amount, cardNumber } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Noto'g'ri summa kiritildi" }, { status: 400 });
        }

        // 1. Record completed transaction
        const { error: txError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                amount: amount,
                type: 'credit',
                description: `Hisob to'ldirildi (Karta: **** ${String(cardNumber).slice(-4)})`,
                status: 'completed'
            });

        if (txError) {
            throw txError;
        }

        // 2. Get current balance and add to it
        const { data: userData } = await supabase
            .from("users")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();

        const newBalance = (userData?.wallet_balance || 0) + Number(amount);

        const { error: updateError } = await supabase
            .from("users")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, newBalance, message: "Hisob muvaffaqiyatli to'ldirildi!" });
    } catch (err) {
        console.error("TopUp endpoint error:", err);
        return NextResponse.json({ error: "Dastur xatosi yuz berdi" }, { status: 500 });
    }
}
