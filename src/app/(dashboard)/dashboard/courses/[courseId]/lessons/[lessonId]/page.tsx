"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";

interface Lesson {
    id: string;
    video_url: string;
    content: string;
    order: number;
    course_id: string;
}

import { useAuth } from "@/components/providers/auth-provider";
import { useProgress } from "@/components/providers/progress-provider";
import { useRef } from "react";

export default function LessonPage() {
    const params = useParams();
    const { user } = useAuth();
    const { updateProgress, progress } = useProgress();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const lastSavedRef = useRef(0);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    const lessonProgress = progress.find(p => p.lesson_id === params.lessonId);

    useEffect(() => {
        async function fetchLesson() {
            if (!params.lessonId) return;

            const { data } = await supabase
                .from("lessons")
                .select("*")
                .eq("id", params.lessonId)
                .single();

            setLesson(data);
            setLoading(false);
        }
        fetchLesson();
    }, [params.lessonId, supabase]);

    const handleComplete = async () => {
        if (!user || !lesson) return;

        await updateProgress(params.courseId as string, lesson.id, lastSavedRef.current, true);
        alert("Dars tugatildi!");
    };

    const handleTimeUpdate = (e: any) => {
        if (!lesson) return;

        // e.detail.currentTime contains the current playback position
        const currentTime = e?.detail?.currentTime || 0;

        // Save progress every 15 seconds
        if (Math.abs(currentTime - lastSavedRef.current) > 15) {
            lastSavedRef.current = currentTime;
            updateProgress(params.courseId as string, lesson.id, Math.floor(currentTime), lessonProgress?.completed || false);
        }
    };

    const handleProviderSetup = (provider: any) => {
        // Automatically start from last saved position if any
        if (lessonProgress && lessonProgress.progress_seconds > 0 && !isPlayerReady) {
            provider.currentTime = lessonProgress.progress_seconds;
            lastSavedRef.current = lessonProgress.progress_seconds;
            setIsPlayerReady(true);
        }
    };

    if (loading) return <div className="p-8 text-white">Yuklanmoqda...</div>;
    if (!lesson) return <div className="p-8 text-white">Dars topilmadi.</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Link
                href={`/dashboard/courses/${params.courseId}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Kursga qaytish
            </Link>

            {/* Video Player */}
            <div className="glass-card overflow-hidden rounded-2xl aspect-video bg-black">
                {lesson.video_url ? (
                    <MediaPlayer
                        title={`Dars ${lesson.order}`}
                        src={lesson.video_url}
                        onTimeUpdate={handleTimeUpdate}
                        onProviderSetup={handleProviderSetup}
                    >
                        <MediaProvider />
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                    </MediaPlayer>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Video manzil topilmadi.
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-white">
                        {lesson.content ? lesson.content.split('\n')[0].replace('# ', '') : `Dars ${lesson.order}`}
                    </h1>
                    <button
                        onClick={handleComplete}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium border ${lessonProgress?.completed
                            ? 'bg-green-500/20 text-green-500 border-green-500/50'
                            : 'bg-green-500/10 text-green-500/70 border-green-500/20 hover:bg-green-500/20 hover:text-green-500'
                            }`}
                    >
                        <CheckCircle className="h-4 w-4" />
                        {lessonProgress?.completed ? "Tugatilgan" : "Tugatdim"}
                    </button>
                </div>

                <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
                        {lesson.content}
                    </pre>
                </div>
            </div>
        </div>
    );
}
