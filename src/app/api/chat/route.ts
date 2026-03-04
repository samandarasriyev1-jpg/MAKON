import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", details: "Iltimos tizimga kiring." }, { status: 401 });
        }

        const { messages } = await req.json();

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured", details: "Iltimos .env.local faylga OPENROUTER_API_KEY kalitini joylashtiring." }, { status: 500 });
        }

        const systemPrompt = "Sizning ismingiz 'AI Ustoz', MAKON platformasining dasturlash bo'yicha yordamchisisiz. Har doim do'stona, aniq, va O'zbek tilida javob bering. Kod misollarini taqdim eting.";

        const formattedMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))
        ];

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "MAKON Platform"
                },
                body: JSON.stringify({
                    model: "google/gemini-2.5-flash", // OpenRouter dagi juda tez va arzon/tekin model
                    messages: formattedMessages,
                    max_tokens: 1500 // MUHIM: Tekin(Free) API kalitda token sig'imi oshib ketmasligi uchun cheklov
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error?.message || "OpenRouter API xatosi");
            }

            const data = await response.json();
            const responseText = data.choices[0]?.message?.content || "";

            const lastUserMessage = messages[messages.length - 1];

            // Orqa fonda asinxron xotiraga saqlab yuboramiz
            if (lastUserMessage && lastUserMessage.role === 'user') {
                supabase.from('ai_chat_history').insert([
                    { user_id: user.id, role: 'user', content: lastUserMessage.content },
                    { user_id: user.id, role: 'ai', content: responseText }
                ]).then(({ error }) => {
                    if (error) console.error("Chat saving error:", error);
                });
            }

            return NextResponse.json({ content: responseText });
        } catch (error: any) {
            console.error(`Attempt failed with OpenRouter:`, error.message);

            return NextResponse.json({
                error: "Model Error",
                details: `API xatosi: ${error.message}`
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({
            error: "AI service error",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
