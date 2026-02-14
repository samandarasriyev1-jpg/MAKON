"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of Registration Flow
        // In a real app, we would:
        // 1. Sign up with Supabase Auth (Phone OTP)
        // 2. Create a profile in 'users' table via trigger or manual insert

        // For Demo: Redirect to Login
        setTimeout(() => {
            setLoading(false);
            router.push("/login");
        }, 1000);
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Ortga
            </Link>


            <div className="glass-card w-full max-w-md p-8 animate-in fade-in zoom-in duration-500">
                <div className="mb-8 text-center flex flex-col items-center">
                    <Image
                        src="/logo.jpg"
                        alt="MAKON"
                        width={64}
                        height={64}
                        className="h-16 w-16 mb-4 rounded-2xl object-cover shadow-lg shadow-primary/20"
                    />
                    <h1 className="text-3xl font-bold text-white">Ro&apos;yxatdan o&apos;tish</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        MAKON platformasiga qo&apos;shiling
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">Telefon Raqam</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-muted-foreground">+998</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-14 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="90 123 45 67"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground pl-1">Siz kimsiz?</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`rounded-xl p-3 text-sm font-bold transition-all border ${role === "student"
                                    ? "bg-primary text-[#0A192F] border-primary"
                                    : "bg-black/20 text-muted-foreground border-white/10 hover:bg-white/5"
                                    }`}
                            >
                                O&apos;quvchi
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("teacher")}
                                className={`rounded-xl p-3 text-sm font-bold transition-all border ${role === "teacher"
                                    ? "bg-primary text-[#0A192F] border-primary"
                                    : "bg-black/20 text-muted-foreground border-white/10 hover:bg-white/5"
                                    }`}
                            >
                                O&apos;qituvchi
                            </button>
                        </div>
                    </div>

                    <button disabled={loading} className="w-full flex items-center justify-center rounded-xl bg-primary py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,180,216,0.3)] hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Davom etish"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                    Akkauntingiz bormi?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Kirish
                    </Link>
                </div>
            </div>
        </div>
    );
}
