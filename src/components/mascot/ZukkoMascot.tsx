"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Play } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import "./styles/zukko.css";

// Speech Recognition types
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export function ZukkoMascot() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [message, setMessage] = useState("Salom! Men Zukkomam.");
    const [recognition, setRecognition] = useState<any>(null);
    const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
    const router = useRouter();
    const pathname = usePathname();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    // Initialize Recognition and User Name
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const rec = new SpeechRecognition();
                rec.continuous = false; // Stop after one command
                rec.lang = "uz-UZ";
                rec.interimResults = false;
                rec.maxAlternatives = 1;

                rec.onstart = () => {
                    setIsListening(true);
                    console.log("Speech recognition started");
                };
                
                rec.onend = () => {
                    setIsListening(false);
                    console.log("Speech recognition ended");
                };

                rec.onerror = (event: any) => {
                    console.error("Speech error", event.error);
                    setIsListening(false);
                    if (event.error === 'no-speech') {
                        speak("Hech narsa eshitmadim. Iltimos, balandroq gapiring.");
                    } else if (event.error === 'not-allowed') {
                        speak("Mikrofonga ruxsat bering.");
                    } else {
                        speak("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
                    }
                };
                
                rec.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    console.log("Transcript:", transcript);
                    handleCommand(transcript);
                };

                setRecognition(rec);
            } else {
                console.warn("Speech Recognition API not supported in this browser.");
            }
        }
    }, []);

    // Effect for greeting on page change or user load
    useEffect(() => {
        if (user) {
            const name = user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.first_name || null;
            setUserName(name);
            
            // Only greet if just loaded (simple check)
            // Ideally we check a session flag, but for now:
            const hasGreeted = sessionStorage.getItem('zukko_greeted');
            if (!hasGreeted && name) {
                setTimeout(() => {
                    speak(`Salom, ${name}! Xush kelibsiz.`);
                    sessionStorage.setItem('zukko_greeted', 'true');
                }, 1000);
            }
        } else {
            // If no user, maybe ask for name? But we usually require login.
            // If on public page:
            if (!sessionStorage.getItem('zukko_greeted')) {
                 setTimeout(() => {
                    speak("Salom! Ismingiz nima?");
                    sessionStorage.setItem('zukko_greeted', 'true');
                }, 1000);
            }
        }
    }, [user, pathname]);

    const speak = (text: string) => {
        if (!synth) return;
        
        synth.cancel(); // Stop previous

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "uz-UZ"; 
        utterance.pitch = 1.3; // Cute high pitch
        utterance.rate = 1.1;  // Slightly faster

        utterance.onstart = () => {
            setIsSpeaking(true);
            setMessage(text);
            setIsVisible(true);
        };
        utterance.onend = () => {
            setIsSpeaking(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setMessage(""), 6000);
        };

        synth.speak(utterance);
    };

    const handleCommand = (command: string) => {
        setIsThinking(true);
        
        setTimeout(() => {
            setIsThinking(false);
            
            // Name setting logic
            if (!userName && (command.includes("ismim") || command.includes("men"))) {
                const nameParts = command.split(" ");
                const newName = nameParts[nameParts.length - 1]; // Simple heuristic
                setUserName(newName);
                speak(`Tanishganimdan xursandman, ${newName}! Endi sizga qanday yordam bera olaman?`);
                return;
            }

            if (command.includes("salom") || command.includes("qalay")) {
                speak(`Assalomu alaykum ${userName || 'do\'stim'}! Kayfiyatlar zo'rmi?`);
            } 
            else if (command.includes("hamyon") || command.includes("pul")) {
                speak("Hamyoningizni ochyapman...");
                router.push("/dashboard/wallet");
            }
            else if (command.includes("kurs") || command.includes("dars")) {
                speak("Bilim olishga ketdik!");
                router.push("/dashboard/courses");
            }
            else if (command.includes("dashboard") || command.includes("bosh sahifa")) {
                speak("Bosh sahifaga qaytamiz.");
                router.push("/dashboard");
            }
            else if (command.includes("yordam") || command.includes("help")) {
                speak("Men platformani boshqarishda yordam beraman. 'Hamyonni och' yoki 'Kurslarim' deb ayting.");
            }
            else if (command.includes("rahmat")) {
                speak("Arzimaydi! Xizmatdamiz.");
            }
            else {
                speak("Uzr, tushunmadim. Aniqroq ayta olasizmi?");
            }
        }, 800);
    };

    const startListening = () => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                speak("Eshitaman...");
            } catch (e) {
                console.error("Start error", e);
            }
        }
    };

    const stopListening = () => {
        if (recognition && isListening) {
            recognition.stop();
        }
    };

    if (!isVisible) return (
        <button 
            onClick={() => setIsVisible(true)}
            className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-50 hover:scale-110 transition-transform border-2 border-white"
        >
            <Play className="h-6 w-6 fill-white" />
        </button>
    );

    return (
        <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`zukko-container ${isSpeaking ? 'speaking' : ''} ${isListening ? 'listening' : ''} ${isThinking ? 'thinking' : ''}`}
        >
            {/* Speech Bubble */}
            <AnimatePresence>
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-[130%] right-0 bg-white text-gray-900 p-4 rounded-2xl rounded-br-none shadow-xl w-64 text-sm font-medium border-2 border-blue-500 z-50"
                    >
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mascot Head */}
            <div className="relative group">
                {/* Listening Waves */}
                <div className="listening-waves"></div>

                <div className="zukko-head">
                    {/* Do'ppi added here */}
                    <div className="zukko-doppi"></div>
                    
                    <div className="zukko-ear-left"></div>
                    <div className="zukko-ear-right"></div>
                    
                    <div className="zukko-face">
                        <div className="zukko-eye-left">
                            <div className="zukko-pupil"></div>
                        </div>
                        <div className="zukko-eye-right">
                            <div className="zukko-pupil"></div>
                        </div>
                        
                        <div className="zukko-nose"></div>
                        <div className="zukko-mouth"></div>
                        
                        <div className="zukko-whiskers-left">
                            <div className="whisker"></div>
                            <div className="whisker"></div>
                        </div>
                        <div className="zukko-whiskers-right">
                            <div className="whisker"></div>
                            <div className="whisker"></div>
                        </div>
                    </div>
                </div>

                {/* Mic Button - Hold to Talk */}
                <button 
                    className={`zukko-mic-btn ${isListening ? 'active' : ''}`}
                    onMouseDown={startListening}
                    onMouseUp={stopListening}
                    onTouchStart={startListening}
                    onTouchEnd={stopListening}
                    title="Gapirish uchun bosib turing"
                >
                    <Mic className={`h-6 w-6 ${isListening ? 'text-white' : 'text-white'}`} />
                </button>
            </div>

            {/* Close Control */}
            <div className="absolute top-0 -left-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => setIsVisible(false)}
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </motion.div>
    );
}
