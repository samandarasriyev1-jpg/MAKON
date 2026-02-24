import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        let query = supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .order('last_accessed', { ascending: false });

        if (courseId) {
            query = query.eq('course_id', courseId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching progress:", error);
            return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Unexpected error fetching progress:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
