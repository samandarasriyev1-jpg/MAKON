import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: transactions, error } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Transactions fetch error:", error);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        return NextResponse.json({ success: true, transactions });
    } catch (err) {
        console.error("Transactions endpoint error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
