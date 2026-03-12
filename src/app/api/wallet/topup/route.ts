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

        // 2. Use RPC for secure transaction
        const { data: rpcData, error: rpcError } = await supabase.rpc('process_wallet_transaction', {
            p_user_id: user.id,
            p_amount: amount,
            p_type: 'credit',
            p_description: `Hisob to'ldirildi (Karta: **** ${String(cardNumber).slice(-4)})`
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: "Tranzaksiya xatosi" }, { status: 500 });
        }

        return NextResponse.json({ success: true, newBalance: rpcData.new_balance, message: "Hisob muvaffaqiyatli to'ldirildi!" });
    } catch (err) {
        console.error("TopUp endpoint error:", err);
        return NextResponse.json({ error: "Dastur xatosi yuz berdi" }, { status: 500 });
    }
}
