"use client";

import { useState, useRef, useEffect } from "react";
import {
    Send,
    Bot,
    User,
    Sparkles,
    Loader2,
    RotateCcw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Message {
    id: string | number;
    role: 'user' | 'ai';
    content: string;
    timestamp: string;
}

export default function AIMentorPage() {
    // Initial state matching server and client to prevent hydration mismatch
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        setMounted(true);

        async function fetchHistory() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('ai_chat_history')
                .select('*')
                .order('created_at', { ascending: true });

            if (!error && data && data.length > 0) {
                const history: Message[] = data.map((d: any) => ({
                    id: d.id,
                    role: d.role as 'user' | 'ai',
                    content: d.content,
                    timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                setMessages(history);
            } else {
                // Set initial message only after mount if there is no history
                setMessages([{
                    id: "init",
                    role: 'ai',
                    content: "Assalomu alaykum! Men MAKON AI Ustoziman. \n\nDasturlash bo'yicha har qanday savolingizga javob berishga tayyorman. \n\nBugun nimani o'rganamiz? 🚀",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        }

        fetchHistory();

        // Subscribe to AI chat updates
        const channel = supabase
            .channel('ai-chat')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_chat_history',
                    filter: 'role=eq.ai' // Only listen for AI responses to avoid double adding user message
                },
                (payload) => {
                    const newMessage = payload.new;
                    // Check if we already have this message (optimistic UI might have added it, but likely not with same ID)
                    // Actually, for AI mentor, we usually wait for response. 
                    // But if we use a background job later, this is useful.
                    // For now, let's just log it or handle if we want real-time across devices.
                    // Since the current implementation awaits fetch('/api/chat'), we might duplicate if we add here.
                    // BUT, if we want to support multi-device sync:
                    setMessages(current => {
                        const exists = current.some(m => m.content === newMessage.content && Math.abs(new Date(m.timestamp).getTime() - new Date(newMessage.created_at).getTime()) < 5000);
                        if (exists) return current;
                        
                        // If it's a new message from another device or background process
                        const newMsg = {
                            id: newMessage.id,
                            role: 'ai' as const,
                            content: newMessage.content,
                            timestamp: new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        return [...current, newMsg];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            // Streaming fetch
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Server xatosi");
            }

            if (!response.body) throw new Error("No response body");

            // Initial empty AI message
            const aiMsgId = Date.now() + 1;
            const aiMessage: Message = {
                id: aiMsgId,
                role: 'ai',
                content: "",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiMessage]);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedText = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunkValue = decoder.decode(value, { stream: true });
                streamedText += chunkValue;

                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId 
                        ? { ...msg, content: streamedText } 
                        : msg
                ));
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'ai',
                content: `⚠️ Xatolik: ${error.message || "Serverga ulanishda xatolik"}`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!mounted) return null; // Avoid hydration mismatch

    return (
        <div className="flex h-[calc(100vh-2rem)] flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-white glow-text flex items-center gap-2">
                        <Sparkles className="h-6 w-6 text-primary" />
                        AI Ustoz
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        24/7 shaxsiy yordamchingiz
                    </p>
                </div>
                <button
                    onClick={() => setMessages([{
                        id: Date.now(),
                        role: 'ai',
                        content: "Assalomu alaykum! Yana nimalarni o'rganamiz?",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }])}
                    className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-white transition-colors"
                >
                    <RotateCcw className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        {/* Avatar */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'ai'
                            ? 'bg-gradient-to-tr from-primary to-blue-600 shadow-lg shadow-primary/20'
                            : 'bg-white/10'
                            }`}>
                            {msg.role === 'ai' ? <Bot className="h-6 w-6 text-white" /> : <User className="h-6 w-6 text-white" />}
                        </div>

                        {/* Content */}
                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-4 rounded-2xl text-sm md:text-base leading-relaxed whitespace-pre-wrap ${msg.role === 'ai'
                                ? 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
                                : 'bg-primary text-[#0A192F] font-medium rounded-tr-none'
                                }`}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {msg.timestamp}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-6 w-6 text-white" />
                        </div>
                        <div className="bg-white/5 px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Savolingizni yozing..."
                    className="w-full bg-black/30 border border-white/10 rounded-2xl pl-4 pr-14 py-4 text-white focus:border-primary focus:outline-none resize-none h-14 max-h-32 shadow-lg"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-2 bg-primary rounded-xl text-[#0A192F] hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );
}
