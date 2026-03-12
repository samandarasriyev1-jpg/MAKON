"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import {
    Loader2, Camera, Save, User, Mail, Lock, Bell,
    Palette, Globe, Shield, Trash2, ChevronRight,
    Eye, EyeOff, CheckCircle2, AlertTriangle, X,
    Smartphone, Monitor, Moon, Sun, Volume2, VolumeX,
    MessageSquare, Award, Zap, Key, LogOut, Info
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
type TabId = "profile" | "security" | "notifications" | "appearance" | "language" | "privacy" | "danger";

interface Tab {
    id: TabId;
    label: string;
    icon: React.ElementType;
    description: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const TABS: Tab[] = [
    { id: "profile", label: "Profil", icon: User, description: "Shaxsiy ma'lumotlar" },
    { id: "security", label: "Xavfsizlik", icon: Shield, description: "Parol va autentifikatsiya" },
    { id: "notifications", label: "Bildirishnomalar", icon: Bell, description: "Xabarnoma sozlamalari" },
    { id: "appearance", label: "Ko'rinish", icon: Palette, description: "Mavzu va dizayn" },
    { id: "language", label: "Til va Mintaqa", icon: Globe, description: "Til, vaqt mintaqasi" },
    { id: "privacy", label: "Maxfiylik", icon: Lock, description: "Maxfiylik va ma'lumotlar" },
    { id: "danger", label: "Xavfli Zona", icon: AlertTriangle, description: "Hisob o'chirish" },
];

// ─── Reusable UI pieces ─────────────────────────────────────────────────────
function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <div className="glass-card p-6 md:p-8 rounded-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function InputField({
    label, hint, icon: Icon, ...rest
}: { label: string; hint?: string; icon?: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />}
                <input
                    {...rest}
                    className={`w-full rounded-xl bg-black/20 border border-white/10 p-3 ${Icon ? "pl-11" : ""} text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed ${rest.className ?? ""}`}
                />
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <div>
                <p className="text-sm font-medium text-white">{label}</p>
                {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? "bg-primary" : "bg-white/10"}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
            </button>
        </div>
    );
}

function Toast({ type, text, onClose }: { type: "success" | "error"; text: string; onClose: () => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
            <div className={`glass-card flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-medium shadow-xl ${type === "success" ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
                {type === "success" ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" /> : <X className="h-5 w-5 flex-shrink-0" />}
                {text}
                <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
            </div>
        </div>
    );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function SettingsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();

    const [activeTab, setActiveTab] = useState<TabId>("profile");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Profile
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Security
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState({ current: false, next: false, confirm: false });

    // Notifications
    const [notifs, setNotifs] = useState({
        email_courses: true,
        email_community: false,
        email_promotions: false,
        push_lessons: true,
        push_achievements: true,
        push_streak: true,
        push_messages: false,
    });

    // Appearance
    const [appearance, setAppearance] = useState({ theme: "dark", accentColor: "cyan", compactMode: false, animations: true });

    // Language
    const [lang, setLang] = useState({ language: "uz", timezone: "Asia/Tashkent", dateFormat: "DD/MM/YYYY" });

    // Privacy
    const [privacy, setPrivacy] = useState({
        profile_public: true,
        show_progress: true,
        show_on_leaderboard: true,
        data_analytics: true,
    });

    // Danger
    const [deleteConfirm, setDeleteConfirm] = useState("");

    // ── Load profile ──────────────────────────────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }

        async function load() {
            setLoading(true);
            try {
                const { data } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url, username, bio")
                    .eq("id", user!.id)
                    .single();
                if (data) {
                    setFullName(data.full_name || "");
                    setAvatarUrl(data.avatar_url || "");
                    setUsername(data.username || "");
                    setBio(data.bio || "");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user, authLoading, supabase]);

    const showToast = (type: "success" | "error", text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast(null), 4000);
    };

    // ── Handlers ──────────────────────────────────────────────────────────
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setSaving(true);
        try {
            const file = e.target.files[0];
            const ext = file.name.split(".").pop();
            const path = `${user?.id}-${Date.now()}.${ext}`;
            const { error: upErr } = await supabase.storage.from("avatars").upload(path, file);
            if (upErr) throw upErr;
            const { data } = supabase.storage.from("avatars").getPublicUrl(path);
            setAvatarUrl(data.publicUrl);
            await supabase.from("profiles").update({ avatar_url: data.publicUrl, updated_at: new Date().toISOString() }).eq("id", user?.id);
            showToast("success", "Profil rasmi yangilandi!");
        } catch (err: any) {
            showToast("error", err.message || "Rasm yuklanmadi");
        } finally {
            setSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase.from("profiles").update({
                full_name: fullName,
                username,
                bio,
                updated_at: new Date().toISOString(),
            }).eq("id", user?.id);
            if (error) throw error;
            await supabase.auth.updateUser({ data: { full_name: fullName } });
            showToast("success", "Profil muvaffaqiyatli saqlandi!");
        } catch (err: any) {
            showToast("error", err.message || "Xatolik yuz berdi");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { showToast("error", "Yangi parollar mos kelmadi"); return; }
        if (newPassword.length < 8) { showToast("error", "Parol kamida 8 ta belgidan iborat bo'lishi kerak"); return; }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            showToast("success", "Parol muvaffaqiyatli o'zgartirildi!");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err: any) {
            showToast("error", err.message || "Parol o'zgartirilmadi");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotifs = () => showToast("success", "Bildirishnoma sozlamalari saqlandi!");
    const handleSaveAppearance = () => showToast("success", "Ko'rinish sozlamalari saqlandi!");
    const handleSaveLang = () => showToast("success", "Til sozlamalari saqlandi!");
    const handleSavePrivacy = () => showToast("success", "Maxfiylik sozlamalari saqlandi!");

    if (authLoading || loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {toast && <Toast type={toast.type} text={toast.text} onClose={() => setToast(null)} />}

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white glow-text">Sozlamalar</h1>
                <p className="text-muted-foreground mt-2">Hisobingizni va platformani o&apos;z xohishingizga moslashtiring.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Nav */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <nav className="glass-card rounded-2xl p-2 space-y-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                                            ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,180,216,0.15)]"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-white"
                                        } ${tab.id === "danger" ? "hover:bg-red-500/10 hover:text-red-400" : ""}`}
                                >
                                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : ""} ${tab.id === "danger" && !isActive ? "text-red-500/60" : ""}`} />
                                    <span className="flex-1 text-left">{tab.label}</span>
                                    <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all ${isActive ? "opacity-100 text-primary" : ""}`} />
                                </button>
                            );
                        })}
                    </nav>

                    {/* User quick card */}
                    <div className="glass-card rounded-2xl p-4 mt-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-sm font-bold text-black overflow-hidden flex-shrink-0">
                            {avatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{fullName || "Foydalanuvchi"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* ── PROFILE TAB ── */}
                    {activeTab === "profile" && (
                        <SectionCard title="Profil Ma'lumotlari" description="Boshqa foydalanuvchilar ko'radigan ma'lumotlaringiz.">
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                {/* Avatar */}
                                <div className="flex items-center gap-6">
                                    <div className="relative group">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-black/40 border-2 border-primary/40 flex items-center justify-center text-xl font-bold text-primary">
                                            {avatarUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : initials}
                                        </div>
                                        <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <Camera className="h-6 w-6 text-white" />
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                                        </label>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Profil rasmi</p>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG · Max 2 MB</p>
                                        <label className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary cursor-pointer hover:underline">
                                            <Camera className="h-3.5 w-3.5" />
                                            Rasm o&apos;zgartirish
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <InputField label="Ism va Familiya" icon={User} type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="To'liq ismingiz" required />
                                    <InputField label="Foydalanuvchi nomi" icon={Key} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="@username" />
                                </div>

                                <InputField label="Elektron pochta" icon={Mail} type="email" value={user?.email || ""} disabled hint="Elektron pochta manzilini o'zgartirib bo'lmaydi." />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                                    <textarea
                                        rows={3}
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="O'zingiz haqingizda qisqacha..."
                                        className="w-full rounded-xl bg-black/20 border border-white/10 p-3 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">{bio.length}/160</p>
                                </div>

                                <div className="flex justify-end">
                                    <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </SectionCard>
                    )}

                    {/* ── SECURITY TAB ── */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <SectionCard title="Parolni O'zgartirish" description="Xavfsizlik uchun kuchli parol tanlang.">
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {/* current password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Joriy parol</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <input type={showPasswords.current ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-11 pr-11 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                            <button type="button" onClick={() => setShowPasswords(s => ({ ...s, current: !s.current }))} className="absolute right-4 top-3.5 text-muted-foreground hover:text-white transition-colors">
                                                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    {/* new password */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Yangi parol</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <input type={showPasswords.next ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Kamida 8 belgi" className="w-full rounded-xl bg-black/20 border border-white/10 p-3 pl-11 pr-11 text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                            <button type="button" onClick={() => setShowPasswords(s => ({ ...s, next: !s.next }))} className="absolute right-4 top-3.5 text-muted-foreground hover:text-white transition-colors">
                                                {showPasswords.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {/* Password strength */}
                                        {newPassword && (
                                            <div className="flex gap-1 mt-2">
                                                {["weak", "fair", "good", "strong"].map((level, i) => {
                                                    const score = Math.min(Math.floor(newPassword.length / 3), 4);
                                                    const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-400", "bg-green-400"];
                                                    return <div key={level} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-white/10"}`} />;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    {/* confirm */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Parolni tasdiqlang</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                                            <input type={showPasswords.confirm ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Yangi parolni takrorlang" className={`w-full rounded-xl bg-black/20 border p-3 pl-11 pr-11 text-white placeholder:text-muted-foreground/50 focus:ring-1 outline-none transition-all ${confirmPassword && confirmPassword !== newPassword ? "border-red-500/60 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"}`} />
                                            <button type="button" onClick={() => setShowPasswords(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-4 top-3.5 text-muted-foreground hover:text-white transition-colors">
                                                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {confirmPassword && confirmPassword !== newPassword && (
                                            <p className="text-xs text-red-400">Parollar mos kelmadi</p>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)] disabled:opacity-50">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                            Parolni O&apos;zgartirish
                                        </button>
                                    </div>
                                </form>
                            </SectionCard>

                            <SectionCard title="Ikki Bosqichli Autentifikatsiya" description="Hisobingizga qo'shimcha himoya qo'shing.">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <Smartphone className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">Autentifikator ilovasi</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Google Authenticator yoki Authy</p>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full font-medium">Tez kunda</span>
                                </div>

                                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mt-2">
                                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-muted-foreground">2FA yoqilganda, tizimga kirishda parolingizdan tashqari tasdiqlash kodi ham talab qilinadi.</p>
                                </div>
                            </SectionCard>

                            <SectionCard title="Faol Seanslar" description="Hisobingizga kirilgan qurilmalar.">
                                {[
                                    { device: "Windows PC · Chrome", location: "Toshkent, O'zbekiston", time: "Hozir faol", current: true },
                                    { device: "Android · MAKON App", location: "Samarqand, O'zbekiston", time: "2 soat oldin", current: false },
                                ].map((s, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${s.current ? "bg-primary/20" : "bg-white/5"}`}>
                                                <Monitor className={`h-4 w-4 ${s.current ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{s.device}</p>
                                                <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                                            </div>
                                        </div>
                                        {s.current ? (
                                            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-medium">Joriy</span>
                                        ) : (
                                            <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                                                <LogOut className="h-3.5 w-3.5" /> Chiqarish
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </SectionCard>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS TAB ── */}
                    {activeTab === "notifications" && (
                        <div className="space-y-6">
                            <SectionCard title="Email Bildirishnomalar" description="Elektron pochta orqali qabul qilinuvchi xabarlar.">
                                <div className="divide-y divide-white/5">
                                    <Toggle checked={notifs.email_courses} onChange={v => setNotifs(n => ({ ...n, email_courses: v }))} label="Kurs yangiliklari" description="Yangi darslar va materiallar haqida xabar" />
                                    <Toggle checked={notifs.email_community} onChange={v => setNotifs(n => ({ ...n, email_community: v }))} label="Hamjamiyat faoliyati" description="Izohlar va javoblar haqida xabar" />
                                    <Toggle checked={notifs.email_promotions} onChange={v => setNotifs(n => ({ ...n, email_promotions: v }))} label="Aksiyalar va takliflar" description="Maxsus chegirmalar va yangiliklar" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Push Bildirishnomalar" description="Ilova ichida ko'rinadigan bildirishnomalar.">
                                <div className="divide-y divide-white/5">
                                    <Toggle checked={notifs.push_lessons} onChange={v => setNotifs(n => ({ ...n, push_lessons: v }))} label="Dars eslatmalari" description="Kunlik o'qish vaqti eslatmasi" />
                                    <Toggle checked={notifs.push_achievements} onChange={v => setNotifs(n => ({ ...n, push_achievements: v }))} label="Yutuqlar" description="Yangi nishon va mukofotlar" />
                                    <Toggle checked={notifs.push_streak} onChange={v => setNotifs(n => ({ ...n, push_streak: v }))} label="Streak eslatmasi" description="Kunlik faollik zanjirini saqlab qolish" />
                                    <Toggle checked={notifs.push_messages} onChange={v => setNotifs(n => ({ ...n, push_messages: v }))} label="Xabarlar" description="Hamjamiyatdan yangi xabarlar" />
                                </div>
                            </SectionCard>

                            <div className="flex justify-end">
                                <button onClick={handleSaveNotifs} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                                    <Save className="w-4 h-4" /> Saqlash
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── APPEARANCE TAB ── */}
                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <SectionCard title="Mavzu" description="Interfeys rangini tanlang.">
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: "dark", label: "Qorong'u", icon: Moon },
                                        { id: "light", label: "Yorug'", icon: Sun },
                                        { id: "system", label: "Tizim", icon: Monitor },
                                    ].map(t => {
                                        const Icon = t.icon;
                                        const active = appearance.theme === t.id;
                                        return (
                                            <button key={t.id} onClick={() => setAppearance(a => ({ ...a, theme: t.id }))} className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${active ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,180,216,0.15)]" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                                                <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                                                <span className={`text-sm font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </SectionCard>

                            <SectionCard title="Aksent Rangi" description="Asosiy rang sxemasini sozlang.">
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { id: "cyan", color: "bg-cyan-400", label: "Moviy (Standart)" },
                                        { id: "purple", color: "bg-purple-500", label: "Binafsha" },
                                        { id: "green", color: "bg-emerald-400", label: "Yashil" },
                                        { id: "orange", color: "bg-orange-400", label: "To'q sariq" },
                                        { id: "pink", color: "bg-pink-500", label: "Pushti" },
                                    ].map(c => (
                                        <button key={c.id} onClick={() => setAppearance(a => ({ ...a, accentColor: c.id }))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                                            <span className={`h-4 w-4 rounded-full ${c.color} ${appearance.accentColor === c.id ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""}`} />
                                            <span className="text-sm text-white">{c.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard title="Boshqa Sozlamalar">
                                <div className="divide-y divide-white/5">
                                    <Toggle checked={appearance.compactMode} onChange={v => setAppearance(a => ({ ...a, compactMode: v }))} label="Ixcham rejim" description="Elementlar orasidagi bo'shliqni kamaytirish" />
                                    <Toggle checked={appearance.animations} onChange={v => setAppearance(a => ({ ...a, animations: v }))} label="Animatsiyalar" description="Harakat va o'tish effektlari" />
                                </div>
                            </SectionCard>

                            <div className="flex justify-end">
                                <button onClick={handleSaveAppearance} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                                    <Save className="w-4 h-4" /> Saqlash
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── LANGUAGE TAB ── */}
                    {activeTab === "language" && (
                        <div className="space-y-6">
                            <SectionCard title="Interfeys Tili" description="Platformada ko'rsatiladigan til.">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {[
                                        { id: "uz", label: "O'zbek", flag: "🇺🇿" },
                                        { id: "ru", label: "Русский", flag: "🇷🇺" },
                                        { id: "en", label: "English", flag: "🇬🇧" },
                                        { id: "kk", label: "Qazaqша", flag: "🇰🇿" },
                                    ].map(l => (
                                        <button key={l.id} onClick={() => setLang(s => ({ ...s, language: l.id }))} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${lang.language === l.id ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
                                            <span className="text-2xl">{l.flag}</span>
                                            <span className={`font-medium ${lang.language === l.id ? "text-primary" : "text-white"}`}>{l.label}</span>
                                            {lang.language === l.id && <CheckCircle2 className="h-4 w-4 text-primary ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </SectionCard>

                            <SectionCard title="Vaqt Mintaqasi va Format">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Vaqt mintaqasi</label>
                                        <select value={lang.timezone} onChange={e => setLang(s => ({ ...s, timezone: e.target.value }))} className="w-full rounded-xl bg-black/20 border border-white/10 p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                            <option value="Asia/Tashkent">Asia/Tashkent — UTC+5</option>
                                            <option value="Europe/Moscow">Europe/Moscow — UTC+3</option>
                                            <option value="Asia/Almaty">Asia/Almaty — UTC+6</option>
                                            <option value="Europe/London">Europe/London — UTC+0</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Sana formati</label>
                                        <select value={lang.dateFormat} onChange={e => setLang(s => ({ ...s, dateFormat: e.target.value }))} className="w-full rounded-xl bg-black/20 border border-white/10 p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                                            <option value="DD/MM/YYYY">DD/MM/YYYY — 06/03/2026</option>
                                            <option value="MM/DD/YYYY">MM/DD/YYYY — 03/06/2026</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD — 2026-03-06</option>
                                        </select>
                                    </div>
                                </div>
                            </SectionCard>

                            <div className="flex justify-end">
                                <button onClick={handleSaveLang} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                                    <Save className="w-4 h-4" /> Saqlash
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── PRIVACY TAB ── */}
                    {activeTab === "privacy" && (
                        <div className="space-y-6">
                            <SectionCard title="Profil Ko'rinishi" description="Boshqa foydalanuvchilar nimani ko'ra olishi.">
                                <div className="divide-y divide-white/5">
                                    <Toggle checked={privacy.profile_public} onChange={v => setPrivacy(p => ({ ...p, profile_public: v }))} label="Profilni ommaviy qilish" description="Platformadagi barcha foydalanuvchilar ko'ra oladi" />
                                    <Toggle checked={privacy.show_progress} onChange={v => setPrivacy(p => ({ ...p, show_progress: v }))} label="O'qish jarayonini ko'rsatish" description="Kurs progressingizni boshqalarga ko'rsatish" />
                                    <Toggle checked={privacy.show_on_leaderboard} onChange={v => setPrivacy(p => ({ ...p, show_on_leaderboard: v }))} label="Liderlar taxtasida ko'rsatish" description="Reytinglarda ismingiz chiqishiga ruxsat berish" />
                                </div>
                            </SectionCard>

                            <SectionCard title="Ma'lumotlar va Tahlil">
                                <div className="divide-y divide-white/5">
                                    <Toggle checked={privacy.data_analytics} onChange={v => setPrivacy(p => ({ ...p, data_analytics: v }))} label="Tahlil ma'lumotlariga ruxsat" description="Platformani yaxshilash uchun anonim foydalanish statistikasi" />
                                </div>
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 mt-4">
                                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Ma&apos;lumotlaringiz himoyada</p>
                                        <p className="text-xs text-muted-foreground mt-1">Barcha ma&apos;lumotlar shifrlangan holda saqlanadi va uchinchi tomonlarga berilmaydi.</p>
                                    </div>
                                </div>
                            </SectionCard>

                            <SectionCard title="Ma'lumotlarni Eksport Qilish">
                                <p className="text-sm text-muted-foreground mb-4">Platformadagi barcha ma&apos;lumotlaringizni ZIP arxivida yuklab olishingiz mumkin.</p>
                                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-all">
                                    <Award className="h-4 w-4 text-primary" /> Ma&apos;lumotlarni yuklab olish
                                </button>
                            </SectionCard>

                            <div className="flex justify-end">
                                <button onClick={handleSavePrivacy} className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-[#0A192F] hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,180,216,0.3)]">
                                    <Save className="w-4 h-4" /> Saqlash
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── DANGER TAB ── */}
                    {activeTab === "danger" && (
                        <div className="space-y-6">
                            <SectionCard title="Hisobni Vaqtincha To'xtatish" description="Bekor qilishingiz mumkin bo'lgan harakatlar.">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-sm font-medium text-white">Hisobni to&apos;xtatib qo&apos;yish</p>
                                        <p className="text-xs text-muted-foreground mt-1">Ma&apos;lumotlaringiz saqlanib qoladi. Istalgan vaqtda qayta faollashtirish mumkin.</p>
                                    </div>
                                    <button className="px-4 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 text-sm font-medium hover:bg-yellow-500/20 transition-all">
                                        To&apos;xtatish
                                    </button>
                                </div>
                            </SectionCard>

                            <div className="glass-card p-6 md:p-8 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-6">
                                <div className="flex items-center gap-3 pb-4 border-b border-red-500/20">
                                    <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-red-400">Xavfli Zona</h2>
                                        <p className="text-xs text-muted-foreground">Qaytarib bo&apos;lmaydigan harakatlar</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
                                    <p className="text-sm font-medium text-red-300 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" /> Ogohlantirish
                                    </p>
                                    <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                                        <li>Barcha kurs progressingiz o&apos;chib ketadi</li>
                                        <li>Hamyon mablag&apos;ingiz qaytarilmaydi</li>
                                        <li>Hamjamiyatdagi postlaringiz o&apos;chiriladi</li>
                                        <li>Bu amalni bekor qilib bo&apos;lmaydi</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Tasdiqlash uchun{" "}
                                        <span className="text-red-400 font-mono font-bold">
                                            &quot;hisobni-o&apos;chir&quot;
                                        </span>{" "}
                                        deb yozing:
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirm}
                                        onChange={e => setDeleteConfirm(e.target.value)}
                                        placeholder="hisobni-o'chir"
                                        className="w-full rounded-xl bg-black/40 border border-red-500/30 p-3 text-white placeholder:text-muted-foreground/40 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all font-mono"
                                    />
                                    <button
                                        disabled={deleteConfirm !== "hisobni-o'chir"}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 font-bold text-white hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hisobni Butunlay O&apos;chirish
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
