"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, BookOpen, Bot, Users, Trophy, Wallet,
    ChevronRight, ChevronLeft, CheckCircle2, X,
    Zap, Brain, Star, Shield
} from "lucide-react";

const features = [
    {
        id: "welcome",
        badge: "🎉 Xush Kelibsiz!",
        title: "O'zbekistonning eng zamonaviy ta'lim platformasi",
        description: "MAKON — bu faqat kurslar emas. Bu sizning kasbiy o'sishingiz uchun yaratilgan to'liq ekosistema. Bir necha daqiqada platforma bilan tanishing.",
        image: "/onboarding-courses.png",
        accent: "from-cyan-500 to-blue-600",
        iconBg: "bg-cyan-500/20",
        icon: <Sparkles className="w-6 h-6 text-cyan-400" />,
        stats: [
            { label: "Kurslar", value: "50+" },
            { label: "O'quvchilar", value: "1200+" },
            { label: "O'qituvchilar", value: "30+" },
        ],
        highlights: [
            { icon: <BookOpen className="w-4 h-4" />, text: "Amaliy darslar va real loyihalar" },
            { icon: <Shield className="w-4 h-4" />, text: "Sertifikatli platformada o'qing" },
            { icon: <Star className="w-4 h-4" />, text: "Sifatli va tezkor o'quv tizimi" },
        ]
    },
    {
        id: "ai",
        badge: "🤖 AI Texnologiyasi",
        title: "Shaxsiy AI Ustoz — Zukko sizga 24/7 yordam beradi",
        description: "MAKON'ning sirli qorqoploni Zukko — bu oddiy chatbot emas. U sizni eslab qoladi, sahifadagi harakatlaringizni kuzatadi va kerak bo'lsa o'zi yordamga keladi.",
        image: "/onboarding-ai.png",
        accent: "from-purple-500 to-pink-600",
        iconBg: "bg-purple-500/20",
        icon: <Bot className="w-6 h-6 text-purple-400" />,
        stats: [
            { label: "Til modeli", value: "AI 3.0" },
            { label: "Javob vaqti", value: "<2s" },
            { label: "Xotira", value: "Cheksiz" },
        ],
        highlights: [
            { icon: <Brain className="w-4 h-4" />, text: "Sizni eslab qoluvchi xotira tizimi" },
            { icon: <Zap className="w-4 h-4" />, text: "45 soniya harakatsiz qolsangiz o'zi gapiradi" },
            { icon: <Bot className="w-4 h-4" />, text: "Ovozli buyruqlar (O'zbek tilida)" },
        ]
    },
    {
        id: "gamification",
        badge: "🏆 Tamagotchi Tizimi",
        title: "O'rganish — bu o'yin! XP yig'ing, darajalang, yuting!",
        description: "Har bir dars va Zukko bilan muloqot sizga XP ball beradi. Darajangiz oshgan sari Zukko kuchayadi va maxsus mukofotlarga ega bo'lasiz.",
        image: "/onboarding-gamification.png",
        accent: "from-yellow-500 to-orange-500",
        iconBg: "bg-yellow-500/20",
        icon: <Trophy className="w-6 h-6 text-yellow-400" />,
        stats: [
            { label: "Ligalar", value: "5 ta" },
            { label: "Yutuqlar", value: "40+" },
            { label: "XP toifalari", value: "10+" },
        ],
        highlights: [
            { icon: <Trophy className="w-4 h-4" />, text: "Oltin, Kumush, Olmos ligalari" },
            { icon: <Zap className="w-4 h-4" />, text: "Streak — ketma-ket kunlik o'qish bonusi" },
            { icon: <Star className="w-4 h-4" />, text: "Liderlar jadvali va raqobat" },
        ]
    },
    {
        id: "community",
        badge: "👥 Hamjamiyat",
        title: "Yolg'iz o'qimang — kuchli hamjamiyat bilan birgalikda o'sing",
        description: "MAKON'da boshqa o'quvchilar bilan muloqot qiling, savollaringizga javob toping, o'z bilimlaringizni ulashing va professional aloqalar o'rnating.",
        image: "/onboarding-community.png",
        accent: "from-green-500 to-teal-600",
        iconBg: "bg-green-500/20",
        icon: <Users className="w-6 h-6 text-green-400" />,
        stats: [
            { label: "Postlar", value: "3000+" },
            { label: "Muloqotlar", value: "8000+" },
            { label: "Guruhlar", value: "20+" },
        ],
        highlights: [
            { icon: <Users className="w-4 h-4" />, text: "Kurs bo'yicha guruhlar va forum" },
            { icon: <Star className="w-4 h-4" />, text: "O'qituvchilar bilan to'g'ridan muloqot" },
            { icon: <Wallet className="w-4 h-4" />, text: "Makon Hamyon — pullaringizni boshqaring" },
        ]
    }
];

export function OnboardingModal() {
    const { user, isLoading } = useAuth();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [finishing, setFinishing] = useState(false);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        if (isLoading || !user) return;
        async function checkOnboarding() {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("onboarding_completed")
                    .eq("id", user!.id)
                    .single();
                if (error) {
                    if (!user?.user_metadata?.onboarding_completed) setIsOpen(true);
                } else if (!data?.onboarding_completed) {
                    setIsOpen(true);
                }
            } catch (err) {
                console.error("Onboarding check error:", err);
            }
        }
        checkOnboarding();
    }, [user, isLoading, supabase]);

    const handleComplete = async () => {
        setFinishing(true);
        try {
            await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user?.id);
            await supabase.auth.updateUser({ data: { onboarding_completed: true } });
            setIsOpen(false);
        } catch (error) {
            console.error("Onboarding complete error:", error);
            setIsOpen(false);
        } finally {
            setFinishing(false);
        }
    };

    const goNext = () => { setDirection(1); setStep(s => s + 1); };
    const goPrev = () => { setDirection(-1); setStep(s => s - 1); };

    const current = features[step];
    const isLast = step === features.length - 1;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-2xl bg-[#070F1E] border border-white/10 rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)]"
                >
                    {/* Gradient top bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${current.accent}`} />

                    {/* Skip button */}
                    <button
                        onClick={handleComplete}
                        className="absolute top-4 right-4 z-10 text-white/30 hover:text-white/70 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left: Illustration */}
                        <div className="relative h-64 md:h-auto bg-[#0A192F] overflow-hidden">
                            {/* BG glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${current.accent} opacity-10`} />
                            
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={step}
                                    src={current.image}
                                    alt={current.title}
                                    initial={{ opacity: 0, x: direction * 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction * -40 }}
                                    transition={{ duration: 0.35 }}
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Stats overlay at bottom of image */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#070F1E] to-transparent p-4">
                                <div className="flex gap-4 justify-center">
                                    {current.stats.map((s, i) => (
                                        <div key={i} className="text-center">
                                            <div className={`text-lg font-bold bg-gradient-to-r ${current.accent} bg-clip-text text-transparent`}>{s.value}</div>
                                            <div className="text-[10px] text-white/40 uppercase tracking-wide">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="p-7 flex flex-col justify-between min-h-[380px]">
                            <div>
                                {/* Badge */}
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-xs font-bold border border-white/10 ${current.iconBg}`}>
                                    {current.icon}
                                    <span className="text-white/80">{current.badge}</span>
                                </div>

                                {/* Title + Description */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -12 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-xl font-bold text-white mb-3 leading-snug">{current.title}</h2>
                                        <p className="text-sm text-white/50 leading-relaxed mb-5">{current.description}</p>

                                        {/* Feature highlights */}
                                        <ul className="space-y-2.5 mb-6">
                                            {current.highlights.map((h, i) => (
                                                <motion.li
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + i * 0.08 }}
                                                    className="flex items-center gap-3 text-sm text-white/70"
                                                >
                                                    <span className={`flex-shrink-0 p-1.5 rounded-lg ${current.iconBg} text-white/80`}>
                                                        {h.icon}
                                                    </span>
                                                    {h.text}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Progress dots + Navigation */}
                            <div className="flex flex-col gap-4">
                                {/* Progress dots */}
                                <div className="flex items-center justify-center gap-2">
                                    {features.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                                            className={`transition-all duration-300 rounded-full ${
                                                i === step
                                                    ? `w-6 h-2 bg-gradient-to-r ${current.accent}`
                                                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Nav buttons */}
                                <div className="flex gap-3">
                                    {step > 0 && (
                                        <button
                                            onClick={goPrev}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm transition-all"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Oldingi
                                        </button>
                                    )}
                                    {!isLast ? (
                                        <button
                                            onClick={goNext}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${current.accent} hover:opacity-90 transition-all shadow-lg`}
                                        >
                                            Keyingisi <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleComplete}
                                            disabled={finishing}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                                        >
                                            {finishing ? "Bajarilmoqda..." : "🚀 Boshladik!"}
                                            <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
