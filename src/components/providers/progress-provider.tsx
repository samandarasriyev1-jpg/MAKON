"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export type UserProgress = {
    id: string;
    user_id: string;
    course_id: string;
    lesson_id: string;
    completed: boolean;
    progress_seconds: number;
    last_accessed: string;
};

type ProgressContextType = {
    progress: UserProgress[];
    loading: boolean;
    refreshProgress: () => Promise<void>;
    updateProgress: (courseId: string, lessonId: string, seconds: number, completed?: boolean) => Promise<void>;
    getLastAccessedLesson: () => UserProgress | null;
    getCourseProgressPercentage: (courseId: string, totalLessons: number) => number;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshProgress = useCallback(async () => {
        if (!user) {
            setProgress([]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/progress");
            const data = await res.json();
            if (data.success) {
                setProgress(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch progress", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const updateProgress = async (courseId: string, lessonId: string, seconds: number, completed = false) => {
        try {
            // Optimistic UI update
            setProgress((prev) => {
                const existing = prev.find((p) => p.lesson_id === lessonId);
                if (existing) {
                    return prev.map((p) =>
                        p.lesson_id === lessonId
                            ? { ...p, progress_seconds: seconds, completed, last_accessed: new Date().toISOString() }
                            : p
                    );
                }
                return [
                    {
                        id: 'temp-' + Date.now(),
                        user_id: user?.id || '',
                        course_id: courseId,
                        lesson_id: lessonId,
                        completed,
                        progress_seconds: seconds,
                        last_accessed: new Date().toISOString()
                    },
                    ...prev
                ];
            });

            const res = await fetch("/api/progress/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    course_id: courseId,
                    lesson_id: lessonId,
                    progress_seconds: seconds,
                    completed,
                }),
            });
            // Optionally re-fetch after real save
            // if (res.ok) await refreshProgress();
        } catch (error) {
            console.error("Failed to save progress", error);
            await refreshProgress(); // Revert on failure
        }
    };

    const getLastAccessedLesson = () => {
        if (!progress.length) return null;
        // The API sorts descending by last_accessed
        return progress[0];
    };

    const getCourseProgressPercentage = (courseId: string, totalLessons: number) => {
        if (totalLessons === 0) return 0;
        const courseProgress = progress.filter((p) => p.course_id === courseId && p.completed);
        return Math.round((courseProgress.length / totalLessons) * 100);
    };

    useEffect(() => {
        refreshProgress();
    }, [refreshProgress]);

    return (
        <ProgressContext.Provider
            value={{
                progress,
                loading,
                refreshProgress,
                updateProgress,
                getLastAccessedLesson,
                getCourseProgressPercentage,
            }}
        >
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error("useProgress must be used within a ProgressProvider");
    }
    return context;
}
