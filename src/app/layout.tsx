import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("https://makon-demo.vercel.app"),
    title: {
        default: "MAKON - Bilim bu Makon",
        template: "%s | MAKON",
    },
    description: "Top o'qituvchilardan o'rganing, bilimingizni monetizatsiya qiling va professional hamjamiyatga qo'shiling.",
    openGraph: {
        type: "website",
        locale: "uz_UZ",
        url: "/",
        title: "MAKON - Bilim bu Makon",
        description: "Top o'qituvchilardan o'rganing, bilimingizni monetizatsiya qiling va professional hamjamiyatga qo'shiling.",
        siteName: "MAKON",
    },
    icons: {
        icon: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="uz">
            <body className={inter.className}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
