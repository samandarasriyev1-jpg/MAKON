import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function RedirectPage({ params }: { params: { code: string } }) {
    const supabase = createClient();
    const code = params.code;

    if (!code) redirect("/");

    // 1. Find Affiliate Link
    const { data: link } = await supabase
        .from("affiliate_links")
        .select("user_id, course_id")
        .eq("unique_ref_code", code)
        .single();

    if (link) {
        // 2. Track Click
        // We try to get IP and UA for basic analytics
        const headersList = headers();
        const userAgent = headersList.get("user-agent") || "unknown";
        const ip = headersList.get("x-forwarded-for") || "unknown";

        await supabase.from("affiliate_clicks").insert({
            affiliate_id: link.user_id,
            course_id: link.course_id,
            ip_address: ip,
            user_agent: userAgent
        });

        // 3. Set Cookie (Simulated via URL param or localstorage in client)
        // Server Actions/Components can setting cookies too.
        // For MVP, we redirect to register page with ?ref=code so the client can store it
        redirect(`/register?ref=${code}`);
    } else {
        // Invalid code
        redirect("/");
    }

    return (
        <div className="flex h-screen items-center justify-center bg-[#0A192F] text-white">
            Yuklanmoqda...
        </div>
    );
}
