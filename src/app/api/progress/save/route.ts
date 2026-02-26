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

        // --- Geymifikatsiya va Streak Logikasi ---
        try {
            const today = new Date().toISOString().split('T')[0];

            // 1. Streak yangilash
            const { data: streakData } = await supabase
                .from('user_streaks')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (streakData) {
                const lastDate = streakData.last_activity_date;
                let newStreak = streakData.current_streak;
                let longest = streakData.longest_streak;
                let userKeptStreak = false;

                if (lastDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (lastDate === yesterdayStr) {
                        newStreak += 1;
                        userKeptStreak = true;
                    } else if (lastDate && lastDate < yesterdayStr) {
                        if (streakData.freeze_count > 0) {
                            // Muzlatkich (Freeze) ishlatamiz
                            await supabase.from('user_streaks').update({ freeze_count: streakData.freeze_count - 1 }).eq('user_id', user.id);
                            newStreak += 1;
                            userKeptStreak = true;
                        } else {
                            // Streak uzildi
                            newStreak = 1;
                        }
                    } else if (!lastDate) {
                        // Birinchi kirish
                        newStreak = 1;
                    }

                    if (newStreak > longest) longest = newStreak;

                    await supabase.from('user_streaks').update({
                        current_streak: newStreak,
                        longest_streak: longest,
                        last_activity_date: today
                    }).eq('user_id', user.id);
                }
            }

            // 2. Gamification XP (Agar dars tugatilsa, masalan +20 XP)
            if (completed) {
                const { data: gameData } = await supabase
                    .from('gamification_profiles')
                    .select('total_xp')
                    .eq('user_id', user.id)
                    .single();

                if (gameData) {
                    await supabase.from('gamification_profiles').update({
                        total_xp: gameData.total_xp + 20,
                        updated_at: new Date().toISOString()
                    }).eq('user_id', user.id);
                }
            }
        } catch (e) {
            console.error("Streak/XP logikasida xatolik:", e);
        }
        // ------------------------------------------

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error("Unexpected error saving progress:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
