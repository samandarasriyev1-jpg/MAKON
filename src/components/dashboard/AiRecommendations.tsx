"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Loader2, Bot, BookOpen } from "lucide-react";
import Link from "next/link";
import { useProgress } from "@/components/providers/progress-provider";

export function AiRecommendations() {
    const { progress } = useProgress();
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRecommendation() {
            try {
                // Determine user learning context based on progress
                const completedCount = progress.filter(p => p.completed).length;
                let userState = "Yangi boshlovchi";
                if (completedCount > 10) userState = "Faol o'quvchi";
                if (completedCount > 50) userState = "Ilg'or o'quvchi";

                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [{
                            role: "user",
                            content: `Men platformada hozirgacha ${completedCount} ta darsni tugatdim. Holatim: ${userState}. Menga qisqa, ruxlantiruvchi o'zbek tilida 2 gapdan iborat shaxsiy tavsiya bering. Bugun nimalarga e'tibor qaratishim kerakligini maslahat bering.`
                        }]
                    })
                });

                const data = await res.json();
                setRecommendation(data.content || "Bugun ham yangi narsalarni o'rganishda davom eting! Omad.");
            } catch (err) {
                console.error(err);
                setRecommendation("Bugun darslarni davom ettirish uchun eng yaxshi kun!");
            } finally {
                setLoading(false);
            }
        }

        // Only fetch if progress is loaded
        if (progress) {
            fetchRecommendation();
        }
    }, [progress]);

    if (loading) {
        return (
            <div className="glass-card p-6 flex items-center justify-center min-h-[160px] animate-pulse">
                <div className="flex flex-col items-center gap-2 text-primary/70">
                    <Bot className="h-6 w-6 animate-bounce" />
                    <span className="text-sm font-medium">AI tahlil qilmoqda...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group border border-primary/20 bg-gradient-to-br from-white/5 to-primary/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <Sparkles className="h-6 w-6 text-[#0A192F]" />
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        Maxsus Tavsiya
                        <span className="text-[10px] uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/10">AI</span>
                    </h3>
                    <p className="text-sm text-white/80 leading-relaxed min-h-[60px]">
                        {recommendation}
                    </p>

                    <div className="mt-4 flex gap-3">
                        <Link href="/dashboard/ai-mentor" className="text-sm font-bold text-[#0A192F] bg-primary px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors inline-block text-center flex-1">
                            Savol berish
                        </Link>
                        <Link href="/dashboard/courses" className="text-sm font-bold text-white bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 flex-1">
                            Darslar <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
