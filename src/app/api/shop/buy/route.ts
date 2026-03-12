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
        const { item_id, price } = body;

        if (item_id !== "streak_freeze") {
            return NextResponse.json({ error: "Noma'lum mahsulot" }, { status: 400 });
        }

        // Use RPC for secure transaction
        const { data: rpcData, error: rpcError } = await supabase.rpc('process_wallet_transaction', {
            p_user_id: user.id,
            p_amount: price,
            p_type: 'debit',
            p_description: "Do'kon xaridi: Streak Freeze"
        });

        if (rpcError) {
            return NextResponse.json({ error: rpcError.message || "Xaridda xatolik yuz berdi" }, { status: 500 });
        }

        // 3. Add freeze_count to user_streaks
        const { data: streakData } = await supabase
            .from("user_streaks")
            .select("freeze_count")
            .eq("user_id", user.id)
            .single();

        const currentFreeze = streakData?.freeze_count || 0;
        await supabase
            .from("user_streaks")
            .upsert({ user_id: user.id, freeze_count: currentFreeze + 1 }, { onConflict: "user_id" });

        return NextResponse.json({ success: true, newBalance: rpcData.new_balance });
    } catch (err) {
        console.error("Shop error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
