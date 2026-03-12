"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, MessageSquare, Play } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useZukko, ZukkoEmotion } from "./useZukko";
import "./styles/zukko-ilbars.css";

export function ZukkoIlbars() {
    const { user } = useAuth();
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.first_name || "Do'stim";

    const {
        emotion,
        message,
        isVisible,
        setIsVisible,
        startListening,
        stopListening,
        speakText,
        stats,
        gainedXp
    } = useZukko({ userName });

    const [isKeyboardMode, setIsKeyboardMode] = useState(false);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        const hasGreeted = sessionStorage.getItem('zukko_ilbars_greeted');
        if (!hasGreeted && user) {
            setTimeout(() => {
                speakText(`Salom, ${userName}! MAKONga xush kelibsiz. Men Zukko — sizning shaxsiy mentor va do'stingizman!`, "happy");
                sessionStorage.setItem('zukko_ilbars_greeted', 'true');
            }, 1500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const txt = inputText;
        setInputText("");
        setIsKeyboardMode(false);

        speakText("O'ylayapman...", "thinking");

        try {
            const res = await fetch("/api/zukko/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: txt, context: { userName, currentPath: window.location.pathname } })
            });
            const data = await res.json();
            if (data.success) {
                if (data.action?.type === "navigate") {
                    setTimeout(() => window.location.href = data.action.path, 1000);
                }
                const em = ["happy", "sad", "surprised", "confused", "excited"].includes(data.emotion) ? data.emotion : "speaking";
                speakText(data.reply, em as ZukkoEmotion);
            } else {
                speakText("Xatolik yuz berdi.", "confused");
            }
        } catch (err) {
            speakText("Tarmoqda ulanish yo'q. Tarmoqni tekshiring.", "sad");
        }
    };

    // -- Minimized bubble button --
    if (!isVisible) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => setIsVisible(true)}
                className="fixed bottom-6 right-6 z-50 bg-[#0A192F] text-primary border-2 border-primary/50 shadow-[0_0_20px_rgba(0,180,216,0.3)] p-4 rounded-2xl flex items-center justify-center overflow-hidden group"
            >
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                <div className="relative font-bold text-sm tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    ZUKKO
                </div>
            </motion.button>
        );
    }

    const imageVariants = {
        idle: { scaleY: [1, 0.98, 1], y: [0, 2, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
        speaking: { scaleY: [1, 1.05, 0.95, 1], scaleX: [1, 0.98, 1.02, 1], y: [0, -5, 0], transition: { repeat: Infinity, duration: 0.4 } },
        thinking: { rotate: [0, 5, 0, -2, 0], y: -5, transition: { repeat: Infinity, duration: 2 } },
        listening: { scale: 1.05, rotate: 2, transition: { type: "spring", stiffness: 300 } },
        happy: { y: [0, -15, 0], scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.6 } },
        sad: { scale: 0.9, y: 10, filter: "brightness(0.8)", transition: { duration: 0.5 } },
        sleeping: { scaleY: [1, 0.95, 1], rotate: 10, y: 10, filter: "brightness(0.7)", transition: { repeat: Infinity, duration: 4 } },
        confused: { rotate: [0, -5, 5, 0], transition: { repeat: Infinity, duration: 1.5 } },
        excited: { y: [0, -20, 0], scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 0.5 } },
    };

    const auraClass = emotion === 'listening'
        ? 'bg-cyan-400/40 animate-pulse'
        : emotion === 'thinking'
        ? 'bg-purple-500/30 animate-pulse'
        : emotion === 'happy' || emotion === 'excited'
        ? 'bg-yellow-400/20 animate-pulse'
        : emotion === 'speaking'
        ? 'bg-primary/30'
        : 'bg-primary/5 opacity-40';

    return (
        <motion.div
            drag
            dragConstraints={{ left: -1000, right: 0, top: -1000, bottom: 0 }}
            dragElastic={0.1}
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className={`fixed bottom-6 right-6 z-[999] flex flex-col items-end zukko-wrapper state-${emotion}`}
        >
            {/* Close button */}
            <button
                onClick={() => setIsVisible(false)}
                className="absolute -top-4 -right-4 bg-red-500/20 text-red-400 p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity border border-red-500/30 backdrop-blur-md z-10"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Speech bubble */}
            <AnimatePresence>
                {message && !isKeyboardMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="mb-3 bg-white text-gray-800 p-4 rounded-3xl rounded-br-none shadow-[0_10px_40px_rgba(0,0,0,0.3)] max-w-[260px] text-sm font-medium border-2 border-primary relative z-20 leading-relaxed"
                    >
                        <p>{message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keyboard input */}
            <AnimatePresence>
                {isKeyboardMode && (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onSubmit={handleTextSubmit}
                        className="mb-3 bg-[#0A192F] p-2 rounded-2xl shadow-xl w-64 border border-primary/30 flex gap-2 z-20"
                    >
                        <input
                            type="text"
                            autoFocus
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ilbarsga yozing..."
                            className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none placeholder:text-white/30"
                        />
                        <button type="submit" className="bg-primary text-[#0A192F] p-2 rounded-xl hover:bg-primary/80 transition-colors">
                            <Play className="w-4 h-4" />
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Gamification HUD - Always visible */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 bg-[#0A192F]/90 backdrop-blur-md border border-primary/30 px-3 py-2 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(0,180,216,0.2)]"
            >
                <div className="flex flex-col items-center justify-center bg-primary/20 rounded-lg px-2 py-1 min-w-[36px]">
                    <span className="text-[9px] text-primary/70 uppercase font-bold tracking-wider">LvL</span>
                    <span className="text-primary font-bold text-sm leading-none">{stats.level}</span>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-white/60">XP {stats.xp}</span>
                        <span className="text-yellow-400">⚡ {stats.energy}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                            initial={{ width: "5%" }}
                            animate={{ width: `${Math.max((stats.xp % 100), 5)}%` }}
                            transition={{ ease: "easeOut", duration: 1 }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* XP popup */}
            <AnimatePresence>
                {gainedXp && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -60, scale: 1.2 }}
                        exit={{ opacity: 0, y: -80 }}
                        transition={{ duration: 1 }}
                        className="absolute top-0 right-10 text-yellow-400 font-bold text-xl drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] z-50 pointer-events-none"
                    >
                        +{gainedXp} XP!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ilbars Image */}
            <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Glow Aura */}
                <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 ${auraClass}`} />

                <motion.div
                    variants={imageVariants as any}
                    animate={emotion in imageVariants ? emotion : "idle"}
                    className="relative w-full h-full drop-shadow-[0_25px_25px_rgba(0,0,0,0.6)]"
                >
                    {/* Zzz for sleeping */}
                    <AnimatePresence>
                        {emotion === "sleeping" && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: -20, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-4 right-8 font-mono text-xl text-primary font-bold z-10 select-none"
                            >
                                Zzz
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <img
                        src="/ilbars.png"
                        alt="Zukko Ilbars Mascot"
                        className="w-full h-full object-contain pointer-events-none select-none"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Zukko&background=0A192F&color=00b4d8&size=256";
                        }}
                    />
                </motion.div>
            </div>

            {/* Control buttons */}
            <div className="flex gap-3 mt-3 bg-[#0A192F]/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 shadow-lg">
                <button
                    onClick={() => emotion === "listening" ? stopListening() : startListening()}
                    title="Bosib gapiring (O'zbek / Rus / Ingliz tilida)"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        emotion === "listening"
                            ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-110 animate-pulse"
                            : "bg-primary/20 text-primary hover:bg-primary/40 hover:scale-105"
                    }`}
                >
                    <Mic className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                    title="Klaviaturadan yozing"
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isKeyboardMode
                            ? "bg-primary text-[#0A192F] scale-105 shadow-[0_0_15px_rgba(0,180,216,0.4)]"
                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:scale-105"
                    }`}
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
            </div>
        </motion.div>
    );
}
