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
        const { course_id, lesson_id, progress_seconds, completed } = body;

        if (!course_id || !lesson_id) {
            return NextResponse.json({ error: "Missing course_id or lesson_id" }, { status: 400 });
        }

        // Upsert the progress
        const { data, error } = await supabase
            .from('user_progress')
            .upsert(
                {
                    user_id: user.id,
                    course_id,
                    lesson_id,
                    progress_seconds: progress_seconds || 0,
                    completed: completed || false,
                    last_accessed: new Date().toISOString()
                },
                { onConflict: 'user_id,lesson_id' }
            )
            .select()
            .single();

        if (error) {
            console.error("Error saving progress:", error);
            return NextResponse.json({ error: "Failed to save progress" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Unexpected error saving progress:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
