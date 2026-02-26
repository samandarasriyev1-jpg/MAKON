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

        // 1. Get user wallet balance
        const { data: userData } = await supabase
            .from("users")
            .select("wallet_balance")
            .eq("id", user.id)
            .single();

        if (!userData || userData.wallet_balance < price) {
            return NextResponse.json({ error: "Mablag' yetarli emas" }, { status: 400 });
        }

        // 2. Deduct balance
        const newBalance = userData.wallet_balance - price;
        const { error: updateError } = await supabase
            .from("users")
            .update({ wallet_balance: newBalance })
            .eq("id", user.id);

        if (updateError) {
            return NextResponse.json({ error: "To'lovda xatolik yuz berdi" }, { status: 500 });
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

        return NextResponse.json({ success: true, newBalance });
    } catch (err) {
        console.error("Shop error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
