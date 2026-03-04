import { Sidebar } from "@/components/layout/sidebar";
import { ProgressProvider } from "@/components/providers/progress-provider";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
                <OnboardingModal />
                <ProgressProvider>
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </ProgressProvider>
            </main>
        </div>
    );
}
