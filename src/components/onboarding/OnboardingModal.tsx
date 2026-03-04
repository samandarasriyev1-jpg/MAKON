"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, Sparkles, BookOpen, Bot, Users } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function OnboardingModal() {
    const { user, isLoading } = useAuth();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [finishing, setFinishing] = useState(false);

    useEffect(() => {
        if (isLoading || !user) return;

        async function checkOnboarding() {
            try {
                // 'onboarding_completed' ustunini profiles jadvalidan tekshiramiz
                // (Eslatma: Bu ishlashi uchun profiles jadvalida `onboarding_completed boolean default false` ustuni bo'lishi kerak. 
                // Agar yo'q bo'lsa, xatolik beradi va biz user.user_metadata orqali tekshiramiz)

                const { data, error } = await supabase
                    .from("profiles")
                    .select("onboarding_completed")
                    .eq("id", user!.id)
                    .single();

                if (error) {
                    // Fallback to user metadata if column doesn't exist yet
                    if (!user?.user_metadata?.onboarding_completed) {
                        setIsOpen(true);
                    }
                } else if (!data?.onboarding_completed) {
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Onboarding tekshirishda xatolik:", err);
            }
        }

        checkOnboarding();
    }, [user, isLoading, supabase]);

    const handleComplete = async () => {
        setFinishing(true);
        try {
            // Update profile
            await supabase
                .from("profiles")
                .update({ onboarding_completed: true })
                .eq("id", user?.id);

            // Update auth metadata
            await supabase.auth.updateUser({
                data: { onboarding_completed: true }
            });

            setIsOpen(false);
        } catch (error) {
            console.error("Onboardingni yakunlashda xatolik:", error);
            setIsOpen(false); // Xato bo'lsa ham yopamiz, keyingi safar chiqadi
        } finally {
            setFinishing(false);
        }
    };

    const steps = [
        {
            title: "MAKON ga xush kelibsiz!",
            description: "O'zbekistonning eng zamonaviy o'quv platformasiga muvaffaqiyatli qo'shildingiz.",
            icon: <Sparkles className="w-16 h-16 text-yellow-400 mb-6" />,
        },
        {
            title: "Yuqori sifatli kurslar",
            description: "Dasturlash, dizayn va boshqa zamonaviy kasblarni amaliyot orqali o'rganing.",
            icon: <BookOpen className="w-16 h-16 text-blue-400 mb-6" />,
        },
        {
            title: "Shaxsiy AI Ustoz",
            description: "Darslar davomida tushunmagan savollaringizga sun'iy intellekt darhol javob beradi.",
            icon: <Bot className="w-16 h-16 text-primary mb-6" />,
        },
        {
            title: "Kuchli Hamjamiyat",
            description: "Boshqa o'quvchilar bilan tajriba almashing va birgalikda o'sing. Boshlashga tayyormisiz?",
            icon: <Users className="w-16 h-16 text-purple-400 mb-6" />,
        }
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0A192F] border border-white/10 shadow-2xl"
                >
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-white/5">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: `${(step / steps.length) * 100}%` }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    <div className="p-8 text-center flex flex-col items-center">
                        <Logo variant="white" size="sm" showText={true} className="mb-8 opacity-50" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col items-center"
                            >
                                {steps[step].icon}
                                <h2 className="text-2xl font-bold text-white mb-3 glow-text">{steps[step].title}</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    {steps[step].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-10 w-full flex gap-3">
                            {step < steps.length - 1 ? (
                                <button
                                    onClick={() => setStep(s => s + 1)}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)]"
                                >
                                    Keyingisi <ChevronRight className="w-5 h-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    disabled={finishing}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3 font-bold text-white hover:bg-green-600 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                >
                                    {finishing ? "Bajarilmoqda..." : "Boshladik!"} <CheckCircle2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
