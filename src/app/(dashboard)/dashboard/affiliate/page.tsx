"use client";

import { useState } from "react";
import {
    Users,
    Copy,
    CheckCircle2,
    TrendingUp,
    DollarSign,
    MousePointer2,
    Share2
} from "lucide-react";

export default function AffiliatePage() {
    const [copied, setCopied] = useState(false);
    const referralLink = "https://makon.uz/register?ref=user123";

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white glow-text">Hamkorlik Dasturi</h1>
                <p className="text-muted-foreground mt-2">
                    Do'stlaringizni taklif qiling va har bir xarid uchun 20% komissiya oling.
                </p>
            </div>

            {/* Referral Link Card */}
            <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Share2 className="h-64 w-64 text-primary" />
                </div>

                <div className="relative z-10 max-w-2xl">
                    <label className="text-sm font-bold text-white uppercase tracking-wider mb-3 block">
                        Sizning Referral Havolangiz
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-lg flex items-center overflow-hidden">
                            <span className="truncate">{referralLink}</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${copied
                                    ? "bg-green-500/20 text-green-400 border border-green-500/50"
                                    : "bg-primary text-[#0A192F] hover:bg-primary/90 shadow-lg shadow-primary/20"
                                }`}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    Nusxalandi
                                </>
                            ) : (
                                <>
                                    <Copy className="h-5 w-5" />
                                    Nusxalash
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                        Bu havolani do'stlaringizga yuboring. Ular ro'yxatdan o'tib, kurs sotib olganda siz hisobingizga bonus olasiz.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { label: "Jami Daromad", value: "1,250,000 UZS", icon: DollarSign, color: "text-green-400" },
                    { label: "Takliflar", value: "45 ta", icon: Users, color: "text-blue-400" },
                    { label: "Havolaga o'tishlar", value: "312 ta", icon: MousePointer2, color: "text-purple-400" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                        <div className={`h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Referrals Table */}
            <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        So'nggi Takliflar
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5 text-left text-xs font-bold text-muted-foreground uppercase">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Foydalanuvchi</th>
                                <th className="p-4">Sana</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg text-right">Daromad</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { name: "O'quvchi 1", date: "Bugun, 14:30", status: "Xarid qildi", amount: "+150,000 UZS", statusColor: "text-green-400" },
                                { name: "O'quvchi 2", date: "Kecha, 09:15", status: "Ro'yxatdan o'tdi", amount: "0 UZS", statusColor: "text-blue-400" },
                                { name: "O'quvchi 3", date: "12 Fev, 18:45", status: "Xarid qildi", amount: "+150,000 UZS", statusColor: "text-green-400" },
                                { name: "O'quvchi 4", date: "10 Fev, 11:20", status: "Kutilmoqda", amount: "0 UZS", statusColor: "text-yellow-400" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{row.name}</td>
                                    <td className="p-4 text-muted-foreground text-sm">{row.date}</td>
                                    <td className={`p-4 text-sm font-bold ${row.statusColor}`}>{row.status}</td>
                                    <td className="p-4 text-right font-mono font-bold text-white">{row.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
