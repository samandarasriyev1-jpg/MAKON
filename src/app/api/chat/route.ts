import { createClient } from "@/lib/supabase/server";
import { google } from "@ai-sdk/google";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized", details: "Iltimos tizimga kiring." }, { status: 401 });
        }

        const { messages } = await req.json();

        // Gemini API key is required. 
        // We assume GOOGLE_GENERATIVE_AI_API_KEY is set in .env.local
        // If you are using OpenRouter, you might need a different setup or custom provider.
        // For 10/10 quality, we use Vercel AI SDK which supports Google Native or OpenRouter via OpenAI compatible interface.
        // Let's stick to Google Native if possible for speed, or OpenRouter via custom config.

        // Falling back to custom OpenRouter fetch if SDK setup is complex without key, 
        // BUT user asked for "10/10", so streaming is a MUST.
        // We will use the Vercel AI SDK's 'streamText' with a custom OpenRouter provider if needed, 
        // or just use Google provider if keys are available. 
        // Assuming user has OPENROUTER_API_KEY, we can use the OpenAI compatible provider from AI SDK.

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const systemPrompt = "Sizning ismingiz 'AI Ustoz', MAKON platformasining dasturlash bo'yicha yordamchisisiz. Har doim do'stona, aniq, va O'zbek tilida javob bering. Kod misollarini taqdim eting.";

        // Use AI SDK for streaming
        // We use the 'google' provider from @ai-sdk/google. 
        // Make sure GOOGLE_GENERATIVE_AI_API_KEY is set, OR we use OpenRouter via openai-compatible interface.
        // For simplicity and stability in this demo, let's try to use the google provider if the user has that key,
        // otherwise we fallback to the manual fetch but with a ReadableStream (harder).
        // Best approach: Use `createOpenAI` from `@ai-sdk/openai` configured for OpenRouter.

        // However, since I installed `@ai-sdk/google`, I'll assume we can use it.
        // If not, I'll use the generic OpenAI client pointing to OpenRouter.
        // Let's try to use the Google provider directly if possible. 
        // If the user only has OpenRouter key, we need to use the OpenAI provider with baseURL.

        // Since I can't install @ai-sdk/openai right now without asking, and I already installed @ai-sdk/google,
        // I will use @ai-sdk/google. This requires GOOGLE_GENERATIVE_AI_API_KEY.
        // If the user only has OPENROUTER_API_KEY, this might fail. 
        // But the previous code used OpenRouter. 

        // PLAN B: Use standard fetch with StreamingResponse for OpenRouter to keep using the existing key.

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                "X-Title": "MAKON Platform"
            },
            body: JSON.stringify({
                model: "arcee-ai/trinity-large-preview:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages
                ],
                stream: true // ENABLE STREAMING
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "OpenRouter Error");
        }

        // Create a streaming response
        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                let fullText = "";

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = new TextDecoder().decode(value);
                        const lines = chunk.split("\n").filter(line => line.trim() !== "");

                        for (const line of lines) {
                            if (line.startsWith("data: ")) {
                                const dataStr = line.replace("data: ", "");
                                if (dataStr === "[DONE]") continue;

                                try {
                                    const json = JSON.parse(dataStr);
                                    const content = json.choices[0]?.delta?.content || "";
                                    if (content) {
                                        fullText += content;
                                        // Send chunk to client
                                        // Vercel AI SDK on client expects a specific format if we use useChat,
                                        // but here we are doing manual streaming.
                                        // Let's stick to simple text streaming which is easy to handle on client.
                                        controller.enqueue(new TextEncoder().encode(content));
                                    }
                                } catch (e) {
                                    console.error("Error parsing chunk", e);
                                }
                            }
                        }
                    }

                    // Save full history after stream ends
                    const lastUserMessage = messages[messages.length - 1];
                    if (lastUserMessage && lastUserMessage.role === 'user') {
                        await supabase.from('ai_chat_history').insert([
                            { user_id: user.id, role: 'user', content: lastUserMessage.content },
                            { user_id: user.id, role: 'ai', content: fullText }
                        ]);
                    }

                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json({
            error: "AI service error",
            details: error.message || "Unknown error"
        }, { status: 500 });
    }
}
