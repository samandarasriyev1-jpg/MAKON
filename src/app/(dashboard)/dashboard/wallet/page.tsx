"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    CreditCard,
    Download,
    Loader2,
    X,
    CheckCircle2,
    Snowflake,
    ShoppingCart
} from "lucide-react";

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    created_at: string;
    status: 'completed' | 'pending' | 'failed';
}

export default function WalletPage() {
    const { user, isLoading: authLoading } = useAuth();
    const supabase = createClient();
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    // Modals State
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);

    // Form State
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");

    // Status State
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isBuying, setIsBuying] = useState(false);
    const STREAK_FREEZE_PRICE = 10000;

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                const { data: userData } = await supabase
                    .from("users")
                    .select("wallet_balance")
                    .eq("id", user!.id)
                    .maybeSingle();

                setBalance(userData?.wallet_balance || 0);

                setTransactions([
                    {
                        id: "1",
                        amount: 150000,
                        type: "credit",
                        description: "Frontend kursi sotuvi (Affiliate)",
                        created_at: new Date().toISOString(),
                        status: "completed"
                    },
                    {
                        id: "2",
                        amount: 50000,
                        type: "debit",
                        description: "Premium obuna to'lovi",
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        status: "completed"
                    }
                ]);
            } catch (error) {
                console.error("Wallet loading error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, authLoading, supabase]);

    const handleWithdraw = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API Call
        setTimeout(() => {
            setIsWithdrawOpen(false);
            setStatusMessage({ type: 'success', text: "So'rov muvaffaqiyatli yuborildi!" });
            setWithdrawAmount("");
            setTimeout(() => setStatusMessage(null), 3000);
        }, 1000);
    };

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock API Call
        setTimeout(() => {
            setIsAddCardOpen(false);
            setStatusMessage({ type: 'success', text: "Karta muvaffaqiyatli qo'shildi!" });
            setCardNumber("");
            setCardExpiry("");
            setTimeout(() => setStatusMessage(null), 3000);
        }, 1000);
    };

    const handleBuyFreeze = async () => {
        if (balance < STREAK_FREEZE_PRICE) {
            setStatusMessage({ type: 'error', text: "Mablag' yetarli emas!" });
            setTimeout(() => setStatusMessage(null), 3000);
            return;
        }

        setIsBuying(true);
        try {
            const res = await fetch("/api/shop/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ item_id: "streak_freeze", price: STREAK_FREEZE_PRICE }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setBalance(data.newBalance);
                setStatusMessage({ type: 'success', text: "Muzlashkun sotib olindi! Endi 1 kun kirmasangiz ham olovingiz o'chmaydi." });
            } else {
                setStatusMessage({ type: 'error', text: data.error || "Xatolik yuz berdi" });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: "Xatolik yuz berdi" });
        } finally {
            setTimeout(() => setStatusMessage(null), 4000);
            setIsBuying(false);
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
        <div className="space-y-8 relative">
            {/* Status Toast */}
            {statusMessage && (
                <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4">
                    <div className={`glass-card p-4 rounded-xl flex items-center gap-3 border ${statusMessage.type === 'success' ? 'border-green-500/30 bg-green-500/10 text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
                        {statusMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        <span className="font-bold">{statusMessage.text}</span>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {isWithdrawOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-md p-6 rounded-3xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Pulni Yechish</h3>
                            <button onClick={() => setIsWithdrawOpen(false)} className="text-muted-foreground hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleWithdraw} className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Summa (UZS)</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Masalan: 100,000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-lg"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-2">Mavjud: {balance.toLocaleString()} UZS</p>
                            </div>
                            <button type="submit" className="w-full bg-primary text-[#0A192F] font-bold py-3 rounded-xl hover:bg-primary/90 transition-all">
                                Tasdiqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Card Modal */}
            {isAddCardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-card w-full max-w-md p-6 rounded-3xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Karta Qo&apos;shish</h3>
                            <button onClick={() => setIsAddCardOpen(false)} className="text-muted-foreground hover:text-white">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleAddCard} className="space-y-4">
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Karta Raqami</label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="8600 0000 0000 0000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Amal Qilish Muddat</label>
                                <input
                                    type="text"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    placeholder="MM/YY"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none font-mono text-lg"
                                    required
                                />
                            </div>
                            <button type="submit" className="w-full bg-primary text-[#0A192F] font-bold py-3 rounded-xl hover:bg-primary/90 transition-all">
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white glow-text">Mening Hamyonim</h1>
                    <p className="text-muted-foreground mt-2">
                        Mablag&apos;larni boshqarish va to&apos;lovlar tarixi.
                    </p>
                </div>
                <button
                    onClick={() => setIsWithdrawOpen(true)}
                    className="bg-primary text-[#0A192F] px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                    <Download className="h-5 w-5" />
                    Pulni Yechish
                </button>
            </div>

            {/* Balance Card */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="h-48 w-48 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <span className="text-muted-foreground font-medium">Joriy Balans</span>
                        <div className="text-5xl font-mono font-bold text-white mt-4 tracking-tighter">
                            {balance.toLocaleString()} <span className="text-2xl text-primary">UZS</span>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1.5 rounded-lg border border-green-400/20">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-sm font-bold">+150,000 bu oy</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20">
                                <ArrowDownLeft className="h-4 w-4" />
                                <span className="text-sm font-bold">-50,000 bu oy</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-8 rounded-3xl flex flex-col justify-center gap-4">
                    <h3 className="font-bold text-white mb-2">Tezkor Amallar</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setIsAddCardOpen(true)}
                            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-3 text-center group"
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CreditCard className="h-5 w-5 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-white">Karta Qo&apos;shish</span>
                        </button>
                        <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all flex flex-col items-center gap-3 text-center group">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <History className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-white">To&apos;liq Tarix</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Gamification Shop section */}
            <div className="glass-card p-8 rounded-3xl mt-8 relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6">
                    <ShoppingCart className="h-6 w-6 text-purple-400" />
                    <h3 className="font-bold text-xl text-white">Do&apos;kon (O&apos;yin Elementlari)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:bg-white/10 hover:border-purple-400/50 transition-all">
                        <div>
                            <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                <Snowflake className="h-6 w-6 text-blue-400" />
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">Streak Freeze (Muzlashkun)</h4>
                            <p className="text-sm text-muted-foreground">Agar bir kun dars qila olmasangiz, Streak (Olov) o&apos;chmasligini ta&apos;minlaydi. O&apos;tkazib yuborilgan kuningizni muzlatib qo&apos;yadi.</p>
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                            <span className="font-mono font-bold text-white">{STREAK_FREEZE_PRICE.toLocaleString()} UZS</span>
                            <button
                                onClick={handleBuyFreeze}
                                disabled={isBuying || balance < STREAK_FREEZE_PRICE}
                                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                            >
                                {isBuying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sotib olish"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        So&apos;nggi O&apos;tkazmalar
                    </h3>
                </div>
                <div className="divide-y divide-white/5">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {tx.type === 'credit' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{tx.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(tx.created_at).toLocaleDateString('uz-UZ', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-mono font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-white'
                                    }`}>
                                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} UZS
                                </p>
                                <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${tx.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {transactions.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            Hozircha o&apos;tkazmalar yo&apos;q.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
