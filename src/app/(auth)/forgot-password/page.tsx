"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const supabase = createClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message);
                return;
            }

            setSuccess("Parolni tiklash havolasi elektron pochtangizga yuborildi. Iltimos pochta qutingizni tekshiring.");
        } catch (err: any) {
            setError(err.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Ortga
            </Link>

            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center flex flex-col items-center">
                    <Logo variant="white" size="lg" showText={false} className="mb-6 scale-125" />
                    <h1 className="text-3xl font-bold text-white">Parolni Tiklash</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Elektron pochtangizni kiriting va biz sizga parolni tiklash havolasini yuboramiz
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

                <form className="space-y-4" onSubmit={handleReset}>
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

                    <button disabled={loading} className="w-full flex items-center justify-center rounded-xl bg-primary py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Havola yuborish"}
                    </button>

                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Parolingiz yodingizga tushdimi?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Kirish
                    </Link>
                </div>
            </div>
        </div>
    );
}
