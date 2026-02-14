import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0A192F] text-white">
            {/* Navigation */}

            <nav className="fixed top-0 z-50 w-full glass-sidebar border-b border-white/5 px-6 py-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.jpg"
                            alt="MAKON"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-lg object-cover"
                        />
                        <span className="text-xl font-bold">MAKON</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white">
                            Kirish
                        </Link>
                        <Link href="/register" className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-[#0A192F] hover:bg-primary/90 transition-all">
                            Boshlash
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
                <div className="glass-card absolute top-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />

                <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
                    Bilim — bu <span className="text-primary">MAKON</span>. <br />
                    Kelajak shu yerdan boshlanadi.
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                    Top o&apos;qituvchilardan o&apos;rganing, bilimingizni monetizatsiya qiling va professional hamjamiyatga qo&apos;shiling.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                    <Link href="/register" className="glass-card group flex items-center gap-2 px-8 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all border-primary/50">
                        Hoziroq Qo&apos;shiling
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/explore" className="flex items-center gap-2 px-8 py-4 text-lg font-medium text-muted-foreground hover:text-white">
                        Kurslarni Ko&apos;rish
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="mt-24 grid max-w-5xl gap-8 sm:grid-cols-3">
                    {[
                        "Professional Kurslar",
                        "Gamifikatsiya Tizimi",
                        "Affiliate Daromad",
                    ].map((feature) => (
                        <div key={feature} className="glass-card flex flex-col items-center p-6 hover:translate-y-1 transition-transform">
                            <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                            <h3 className="font-bold">{feature}</h3>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
