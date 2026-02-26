"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Bot, Loader2 } from "lucide-react";

interface QuizProps {
    question: string;
    options: string[];
    correctAnswerIndex: number;
}

export function InteractiveQuiz({ question, options, correctAnswerIndex }: QuizProps) {
    const [selected, setSelected] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);

    const handleSelect = async (idx: number) => {
        if (selected !== null) return; // prevents multiple clicks
        setSelected(idx);

        if (idx === correctAnswerIndex) {
            setIsCorrect(true);
            setAiFeedback("Barakalla! To'g'ri javobni topdingiz.");
        } else {
            setIsCorrect(false);
            setIsAiThinking(true);

            // Simulate/Call AI to get feedback based on the wrong answer
            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: [{
                            role: "user",
                            content: `Men ushbu testda xato qildim. Savol: "${question}". Men tanlagan xato javob: "${options[idx]}". To'g'ri javob esa: "${options[correctAnswerIndex]}". Iltimos, menga qisqa va tushunarli qilib (2-3 gap) nima uchun xato qilganimni va to'g'ri javob qanday ishlashini ustoz sifatida o'zbek tilida tushuntirib bering.`
                        }]
                    })
                });

                const data = await res.json();
                setAiFeedback(data.reply || "Afsuski, bu xato javob. Iltimos, mavzuni qaytadan ko'rib chiqing.");
            } catch (err) {
                setAiFeedback("Kechirasiz, ustoz tarmog'ida xatolik bor.");
            } finally {
                setIsAiThinking(false);
            }
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/10 my-8">
            <div className="flex items-center gap-3 mb-6">
                <Bot className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-bold text-white">Bilimni tekshiramiz</h3>
            </div>

            <p className="text-lg text-white mb-6 font-medium">{question}</p>

            <div className="space-y-3">
                {options.map((opt, idx) => {
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-white";

                    if (selected !== null) {
                        if (idx === correctAnswerIndex) {
                            btnClass = "bg-green-500/20 border-green-500/50 text-green-400";
                        } else if (idx === selected) {
                            btnClass = "bg-red-500/20 border-red-500/50 text-red-400";
                        } else {
                            btnClass = "bg-white/5 border-white/10 opacity-50 text-muted-foreground";
                        }
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            disabled={selected !== null}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${btnClass}`}
                        >
                            <span>{opt}</span>
                            {selected !== null && idx === correctAnswerIndex && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                            {selected === idx && idx !== correctAnswerIndex && <XCircle className="h-5 w-5 text-red-500" />}
                        </button>
                    )
                })}
            </div>

            {/* AI Feedback Section */}
            {(isAiThinking || aiFeedback) && (
                <div className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-primary/10 border-primary/20'}`}>
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full mt-1 ${isCorrect ? 'bg-green-500/20' : 'bg-primary/20'}`}>
                            <Bot className={`h-4 w-4 ${isCorrect ? 'text-green-500' : 'text-primary'}`} />
                        </div>
                        <div>
                            <h4 className={`text-sm font-bold mb-1 ${isCorrect ? 'text-green-500' : 'text-primary'}`}>
                                AI Ustoz
                            </h4>
                            {isAiThinking ? (
                                <div className="flex items-center gap-2 text-primary/70 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    O&apos;ylamoqda...
                                </div>
                            ) : (
                                <p className="text-white/80 text-sm leading-relaxed">
                                    {aiFeedback}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
