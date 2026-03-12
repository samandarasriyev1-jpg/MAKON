import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export type ZukkoEmotion = "idle" | "listening" | "thinking" | "speaking" | "happy" | "confused" | "excited" | "sad" | "surprised" | "sleeping";

interface UseZukkoProps {
    userName: string;
}

export function useZukko({ userName }: UseZukkoProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [emotion, setEmotion] = useState<ZukkoEmotion>("idle");
    const [message, setMessage] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);

    // Gamification state
    const [stats, setStats] = useState({ level: 1, xp: 0, energy: 100 });
    const [gainedXp, setGainedXp] = useState<number | null>(null);
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis | null>(null);
    const sleepTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const proactiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Web Speech APIs
    useEffect(() => {
        if (typeof window !== "undefined") {
            synthesisRef.current = window.speechSynthesis;

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                const rec = new SpeechRecognition();
                rec.continuous = false;
                rec.lang = "uz-UZ"; // O'zbek tili - brauzerlarda yaxshi ishlaydi
                rec.interimResults = false;
                rec.maxAlternatives = 3; // Bir nechta variantdan eng yaxshisini oladi

                rec.onstart = () => {
                    setEmotion("listening");
                    setMessage("Sizni eshityapman...");
                };

                rec.onend = () => {
                    if (emotion === "listening") {
                        setEmotion("idle");
                        setMessage(null);
                    }
                };

                rec.onerror = (event: any) => {
                    console.error("Speech error", event.error);
                    if (event.error === 'no-speech') {
                        speakText("Hech narsa eshitmadim. Iltimos, qayta urining.", "confused");
                    } else {
                        setEmotion("idle");
                        setMessage(null);
                    }
                };

                rec.onresult = async (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    console.log("Eshitdim:", transcript);
                    await processCommand(transcript);
                };

                recognitionRef.current = rec;
            }
        }

        // Setup sleep & proactive timers
        resetSleepTimer();
        const handleActivity = () => resetSleepTimer();
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);

        return () => {
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
            if (proactiveTimeoutRef.current) clearTimeout(proactiveTimeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    const resetSleepTimer = () => {
        if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
        if (proactiveTimeoutRef.current) clearTimeout(proactiveTimeoutRef.current);
        
        if (emotion === "sleeping") setEmotion("idle");

        // Proactive intervention after 45 seconds
        proactiveTimeoutRef.current = setTimeout(() => {
             // Only intervene if not already busy
             if (!["listening", "thinking", "speaking", "sleeping"].includes(emotion)) {
                 triggerProactiveAssistance();
             }
        }, 45000);

        // Sleep after 120s of true inactivity (if they ignore the proactive message)
        sleepTimeoutRef.current = setTimeout(() => {
            if (!["listening", "thinking", "speaking"].includes(emotion)) {
                setEmotion("sleeping");
            }
        }, 120000); 
    };

    const triggerProactiveAssistance = async () => {
        await processCommand("", true);
    };

    const speakText = (text: string, newEmotion: ZukkoEmotion = "speaking") => {
        if (!synthesisRef.current) return;

        synthesisRef.current.cancel();

        setMessage(text);
        setEmotion(newEmotion);
        setIsVisible(true);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "uz-UZ";
        // Customize voice if needed, here just adjusting pitch
        utterance.pitch = 1.1;
        utterance.rate = 1.05;

        utterance.onstart = () => {
            setEmotion("speaking");
        };

        utterance.onend = () => {
            setEmotion("idle");
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout(() => setMessage(null), 5000);
        };

        synthesisRef.current.speak(utterance);
    };

    const processCommand = async (transcript: string, isProactive: boolean = false) => {
        if (!isProactive) {
            setEmotion("thinking");
            setMessage("O'ylayapman...");
        }

        try {
            const res = await fetch("/api/zukko/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: transcript,
                    isProactive,
                    context: {
                        userName,
                        currentPath: pathname
                    }
                })
            });

            const data = await res.json();

            if (data.success) {
                // Determine emotion
                let finalEmotion: ZukkoEmotion = "speaking";
                if (data.emotion && ["happy", "sad", "surprised", "confused", "excited", "sleeping"].includes(data.emotion)) {
                    finalEmotion = data.emotion as ZukkoEmotion;
                }

                // Handle Gamification XP
                if (data.xp_awarded > 0) {
                    setGainedXp(data.xp_awarded);
                    setStats(prev => ({ ...prev, xp: prev.xp + data.xp_awarded }));
                    setTimeout(() => setGainedXp(null), 3000); // hide "+10 XP" message after 3s
                }

                // Execute action if any
                if (data.action?.type === "navigate") {
                    setTimeout(() => {
                        router.push(data.action.path);
                    }, 1000);
                }

                // Speak reply
                speakText(data.reply, finalEmotion);
            } else {
                speakText("Kechirasiz, miyamda kichik xatolik yuz berdi.", "confused");
            }

        } catch (err) {
            console.error(err);
            speakText("Server bilan ulanish uzildi. Tarmoqni tekshiring.", "sad");
        }
    };

    const startListening = () => {
        if (recognitionRef.current) {
            resetSleepTimer();
            if (synthesisRef.current) synthesisRef.current.cancel();
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        } else {
            speakText("Brauzeringiz ovozli buyruqlarni qo'llab-quvvatlamaydi. Iltimos Chrome orqali kiring.", "sad");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && emotion === "listening") {
            recognitionRef.current.stop();
        }
    };

    return {
        emotion,
        message,
        isVisible,
        setIsVisible,
        startListening,
        stopListening,
        speakText,
        stats,
        gainedXp
    };
}
