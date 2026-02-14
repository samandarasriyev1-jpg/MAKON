import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExplorePage() {
    return (
        <div className="min-h-screen bg-[#0A192F] p-8 text-white">
            <Link href="/" className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Bosh sahifaga qaytish
            </Link>

            <div className="mt-10 text-center">
                <h1 className="text-4xl font-bold text-primary">Kurslar</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Bu sahifa tez orada ishga tushadi.
                </p>
            </div>
        </div>
    );
}
