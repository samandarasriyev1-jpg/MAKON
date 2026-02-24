"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Parollar mos kelmadi");
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
                return;
            }

            setSuccess("Parolingiz muvaffaqiyatli yangilandi. Yo'naltirilmoqda...");

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center flex flex-col items-center">
                    <Logo variant="white" size="lg" showText={false} className="mb-6 scale-125" />
                    <h1 className="text-3xl font-bold text-white">Yangi Parol</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Akkauntingiz uchun yangi parolni kiriting
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

                <form className="space-y-4" onSubmit={handleUpdatePassword}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">Yangi Parol</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-12 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">Parolni Tasdiqlang</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-12 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full flex items-center justify-center rounded-xl bg-primary py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Parolni saqlash"}
                    </button>

                </form>
            </div>
        </div>
    );
}
