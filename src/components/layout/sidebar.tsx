"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    Wallet,
    Settings,
    LogOut,
    Share2,
    Bot
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kurslarim", href: "/dashboard/courses", icon: BookOpen },
    { name: "AI Ustoz", href: "/dashboard/ai-mentor", icon: Bot },
    { name: "Hamjamiyat", href: "/dashboard/community", icon: Users },
    { name: "Hamkorlik", href: "/dashboard/affiliate", icon: Share2 },
    { name: "Hamyon", href: "/dashboard/wallet", icon: Wallet },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-20 flex-col items-center py-8 glass-sidebar lg:w-64 lg:items-start lg:px-6 transition-all duration-300">
            {/* Logo */}
            <div className="mb-10 flex items-center justify-center lg:justify-start lg:w-full gap-3">
                <div className="relative h-14 w-14 rounded-2xl bg-white shadow-lg shadow-primary/20 overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                    <img src="/logo.jpg" alt="MAKON Logo" className="h-full w-full object-contain" />
                </div>
                <span className="hidden lg:block text-2xl font-bold tracking-tight text-white glow-text">
                    MAKON
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-2 w-full">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center justify-center lg:justify-start rounded-xl p-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/20 text-primary shadow-[0_0_20px_rgba(0,180,216,0.2)]"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                            <span className="hidden lg:ml-3 lg:block">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto w-full space-y-2">
                <button className="flex w-full items-center justify-center lg:justify-start rounded-xl p-3 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-white transition-all">
                    <Settings className="h-6 w-6" />
                    <span className="hidden lg:ml-3 lg:block">Sozlamalar</span>
                </button>
                <button className="flex w-full items-center justify-center lg:justify-start rounded-xl p-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all">
                    <LogOut className="h-6 w-6" />
                    <span className="hidden lg:ml-3 lg:block">Chiqish</span>
                </button>
            </div>
        </div>
    );
}
