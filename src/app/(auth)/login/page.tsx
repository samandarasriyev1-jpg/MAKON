"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Mail, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                setError(authError.message);
                return;
            }

            // Successfully logged in
            router.push("/dashboard");
            router.refresh();
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.message && err.message.includes("Failed to fetch")) {
                setError("Tarmoq xatosi: MAKON serveri (Supabase) hozir oflayn yoki 'Uxlash' (Paused) rejimida. Iltimos, Supabase paneliga kirib loyihani faollashtiring.");
            } else {
                setError(err.message || "Xatolik yuz berdi");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
        } catch (err: any) {
            console.error("OAuth xatosi:", err);
            if (err.message && err.message.includes("Failed to fetch")) {
                setError("Tarmoq xatosi: MAKON serveri hozir oflayn. Iltimos tekshiring.");
            } else {
                setError(err.message || "Google orqali kirishda xatolik yuz berdi");
            }
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Ortga
            </Link>

            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center flex flex-col items-center">
                    <Logo variant="white" size="lg" showText={false} className="mb-6 scale-125" />
                    <h1 className="text-3xl font-bold text-white">Xush Kelibsiz</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Akkauntingizga kirish uchun ma&apos;lumotlarni kiriting
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-lg bg-green-500/10 p-3 text-center text-sm text-green-500 border border-green-500/20">
                        {success}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">Elektron pochta</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-12 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between pl-1">
                            <label className="text-sm font-medium text-muted-foreground">Parol</label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                                Parolni unutdingizmi?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-12 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full flex items-center justify-center rounded-xl bg-primary py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Kirish"}
                    </button>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0A192F] px-2 text-muted-foreground">
                                Yoki
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-3 font-medium text-white hover:bg-white/10 transition-all"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                            <path d="M1 1h22v22H1z" fill="none" />
                        </svg>
                        Google orqali kirish
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Akkauntingiz yo&apos;qmi?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                        Ro&apos;yxatdan o&apos;ting
                    </Link>
                </div>
            </div>
        </div>
    );
}
