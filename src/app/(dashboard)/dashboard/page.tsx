"use client";

import { Wallet, Users, BookOpen, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useProgress } from "@/components/providers/progress-provider";
import { PlayCircle } from "lucide-react";

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { progress, getLastAccessedLesson } = useProgress();
    const supabase = createClient();
    const [stats, setStats] = useState({
        courses: 0,
        progress: 0,
        xp: 0,
        wallet: 0,
    });
    const [loading, setLoading] = useState(true);
    const [lastAccessData, setLastAccessData] = useState<{ courseTitle: string, lessonTitle: string, progressSec: number } | null>(null);

    const lastAccess = getLastAccessedLesson();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                // 1. Get Wallet Balance
                const { data: userData } = await supabase
                    .from("users")
                    .select("wallet_balance")
                    .eq("id", user!.id)
                    .maybeSingle();

                // 2. Get Gamification XP
                const { data: gameData } = await supabase
                    .from("gamification_profiles")
                    .select("total_xp")
                    .eq("user_id", user!.id)
                    .maybeSingle();

                setStats({
                    courses: 0,
                    progress: 0,
                    xp: gameData?.total_xp || 0,
                    wallet: userData?.wallet_balance || 0,
                });
            } catch (error) {
                console.error("Dashboard loading error:", error);
            } finally {
                setLoading(false);
            }
        }

        async function fetchLastAccessDetails() {
            if (!lastAccess) return;
            try {
                const { data } = await supabase
                    .from('lessons')
                    .select('title, course:courses(title)')
                    .eq('id', lastAccess.lesson_id)
                    .single();

                if (data) {
                    setLastAccessData({
                        lessonTitle: data.title,
                        courseTitle: (data.course as any)?.title || 'Kurs',
                        progressSec: lastAccess.progress_seconds
                    });
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchData();
        fetchLastAccessDetails();
    }, [user, authLoading, supabase, lastAccess]);

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white glow-text">
                    Xush kelibsiz, {user?.phone || "Student"}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    Bugungi o&apos;qish jarayoningiz va statistikangiz.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: "O'zlashtirilgan", value: progress.filter((p: any) => p.completed).length.toString(), icon: BookOpen, color: "text-blue-400" },
                    { label: "Boshlangan", value: progress.length.toString(), icon: TrendingUp, color: "text-green-400" },
                    { label: "Hamjamiyat XP", value: stats.xp.toLocaleString(), icon: Users, color: "text-purple-400" },
                    { label: "Hamyon", value: `${stats.wallet.toLocaleString()} UZS`, icon: Wallet, color: "text-primary" },
                ].map((stat, i) => {
                    const isWallet = stat.label === "Hamyon";
                    const Content = (
                        <div key={i} className={`glass-card p-6 flex flex-col justify-between hover:bg-white/10 transition-colors ${isWallet ? "cursor-pointer ring-1 ring-primary/50" : ""}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div className="mt-4 text-2xl font-bold text-white">{stat.value}</div>
                        </div>
                    );

                    return isWallet ? (
                        <Link href="/dashboard/wallet" key={i}>
                            {Content}
                        </Link>
                    ) : (
                        Content
                    );
                })}
            </div>

            {/* Recent Activity / Content Placeholder */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="glass-card p-6 lg:col-span-2 flex flex-col items-start min-h-[220px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Davom etish</h3>

                    {lastAccess && lastAccessData ? (
                        <div className="w-full flex-1 rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden group">
                            <Link href={`/dashboard/courses/${lastAccess.course_id}/lessons/${lastAccess.lesson_id}`} className="absolute inset-0 z-10" />
                            <div>
                                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">{lastAccessData.courseTitle}</div>
                                <h4 className="text-xl font-bold text-white max-w-[80%]">{lastAccessData.lessonTitle}</h4>
                            </div>

                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-green-400 flex items-center gap-2">
                                    <PlayCircle className="h-5 w-5" />
                                    Davom etish
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {Math.floor(lastAccessData.progressSec / 60)} daqiqa o'qildi
                                </div>
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <PlayCircle className="h-40 w-40" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full min-h-[140px] rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground border border-dashed border-white/10">
                            Hozircha faol kurslar yo'q
                        </div>
                    )}
                </div>
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
                    <div className="space-y-4">
                        {/* Mock Leaderboard - Real query would be: select * from gamification_profiles order by total_xp desc limit 3 */}
                        {[1, 2, 3].map((pos) => (
                            <div key={pos} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-xs font-bold">
                                        U{pos}
                                    </div>
                                    <span className="text-sm font-medium">User {pos}</span>
                                </div>
                                <span className="text-xs font-bold text-primary">{(1000 - pos * 50)} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
