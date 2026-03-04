"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import { Loader2, Camera, Save, User, Mail } from "lucide-react";

export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        async function loadProfile() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("id", user!.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setFullName(data.full_name || "");
                    setAvatarUrl(data.avatar_url || "");
                }
            } catch (err) {
                console.error("Profilni yuklashda xatolik:", err);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user, authLoading, supabase]);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("Iltimos bitta rasm tanlang.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            // Yuklash - avval 'avatars' deb nomlangan pablik paqir (bucket) yaratish kerak
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Ochiq URL ni olish
            const { data } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            setAvatarUrl(data.publicUrl);

            // Profilni darhol yangilash
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() })
                .eq("id", user?.id);

            if (updateError) throw updateError;

            setMessage({ type: "success", text: "Rasm muvaffaqiyatli yuklandi!" });
        } catch (error: any) {
            console.error("Upload error:", error);
            if (error.message.includes("The resource was not found")) {
                setMessage({ type: "error", text: "Xatolik: Supabase Storage da 'avatars' nomli public bucket topilmadi. Avval yaratishingiz kerak." });
            } else {
                setMessage({ type: "error", text: error.message || "Rasm yuklashda xatolik yuz berdi" });
            }
        } finally {
            setSaving(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user?.id);

            if (error) throw error;

            // Shuningdek, auth metadata ni yangilaymiz (agar zarur bo'lsa)
            await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            setMessage({ type: "success", text: "Profil muvaffaqiyatli saqlandi!" });
        } catch (error: any) {
            console.error("O'zgartirishni saqlashda xatolik:", error);
            setMessage({ type: "error", text: error.message || "Xatolik yuz berdi" });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white glow-text">
                    Sozlamalar
                </h1>
                <p className="text-muted-foreground mt-2">
                    Shaxsiy ma&apos;lumotlaringizni va tizim sozlamalarini boshqaring.
                </p>
            </div>

            <div className="glass-card p-6 md:p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Profil Ma&apos;lumotlari</h2>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-center ${message.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Qismi */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-black/40 border-2 border-primary/50 flex items-center justify-center">
                                {avatarUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>

                            <label className="absolute bottom-0 right-0 p-2 bg-primary text-black rounded-full cursor-pointer hover:bg-primary/80 transition-all shadow-lg">
                                <Camera className="w-5 h-5" />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={saving}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Fayl formati: JPG, PNG<br />Max hajm: 2MB
                        </p>
                    </div>

                    {/* Forma Qismi */}
                    <form className="flex-1 space-y-6" onSubmit={handleSaveProfile}>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground pl-1">Ism va familiya</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-11 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Ismingizni kiriting"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground pl-1">Elektron pochta</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full rounded-xl bg-black/40 border border-white/5 p-3 pl-11 text-muted-foreground cursor-not-allowed outline-none"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground pl-1">Pochta manzilini o&apos;zgartirib bo&apos;lmaydi</p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Saqlash
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
