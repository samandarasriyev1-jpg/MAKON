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

        // Use RPC for secure transaction
        const { data: rpcData, error: rpcError } = await supabase.rpc('process_wallet_transaction', {
            p_user_id: user.id,
            p_amount: amount,
            p_type: 'debit',
            p_description: "Karta orqali pul yechib olish so'rovi"
        });

        if (rpcError) {
            console.error("RPC Error:", rpcError);
            return NextResponse.json({ error: rpcError.message || "Tranzaksiya xatosi" }, { status: 400 });
        }

        return NextResponse.json({ success: true, newBalance: rpcData.new_balance, message: "So'rov muvaffaqiyatli qabul qilindi. 24 soat ichida ko'rib chiqiladi." });
    } catch (err) {
        console.error("Withdraw endpoint error:", err);
        return NextResponse.json({ error: "Dastur xatosi yuz berdi" }, { status: 500 });
    }
}
