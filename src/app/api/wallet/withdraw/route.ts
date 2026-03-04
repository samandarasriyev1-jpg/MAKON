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
        const { amount } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Noto'g'ri summa kiritildi" }, { status: 400 });
        }

        // 1. Get current balance
        const { data: userData } = await supabase
            .from("users")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();

        if (!userData || userData.wallet_balance < amount) {
            return NextResponse.json({ error: "Hisobingizda yetarli mablag&apos; mavjud emas" }, { status: 400 });
        }

        // 2. Insert pending transaction
        const { error: txError } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                amount: amount,
                type: 'debit',
                description: 'Karta orqali pul yechib olish so&apos;rovi',
                status: 'pending'
            });

        if (txError) {
            throw txError;
        }

        // 3. Deduct from wallet balance
        const newBalance = userData.wallet_balance - amount;
        await supabase
            .from("users")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        return NextResponse.json({ success: true, newBalance, message: "So'rov muvaffaqiyatli qabul qilindi. 24 soat ichida ko'rib chiqiladi." });
    } catch (err) {
        console.error("Withdraw endpoint error:", err);
        return NextResponse.json({ error: "Dastur xatosi yuz berdi" }, { status: 500 });
    }
}
