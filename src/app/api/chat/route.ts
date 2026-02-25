import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        // In a real app, you should just rely on process.env.GROQ_API_KEY.
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const groq = new Groq({ apiKey });

        const modelName = "llama3-8b-8192"; // Fast, reliable Groq model

        const systemMessage = {
            role: "system",
            content: "You are 'AI Ustoz', a helpful and professional programming mentor for the MAKON platform. Your goal is to help students learn frontend (React, Tailwind, Next.js) and backend development. Be encouraging, concise, and provide code examples where helpful. Always answer in Uzbek language."
        };

        // Format messages for Groq format: { role: "user" | "assistant", content: string }
        // The incoming messages from the frontend usually have this format already,
        // but we ensure the system message is prepended.
        const formattedMessages = [
            systemMessage,
            ...messages.map((m: any) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }))
        ];

        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: formattedMessages as any,
                model: modelName,
                temperature: 0.7,
                max_tokens: 1024,
            });

            const text = chatCompletion.choices[0]?.message?.content || "";

            return NextResponse.json({ content: text });
        } catch (error: any) {
            console.error(`Attempt failed with ${modelName}:`, error.message);

            if (error.status === 429) {
                return NextResponse.json({
                    error: "Too Many Requests",
                    details: "AI serveri juda band (Rate Limit). Iltimos, bir ozdan so'ng urinib ko'ring."
                }, { status: 429 });
            }

            return NextResponse.json({
                error: "Model Error",
                details: `Model xatosi: ${error.message}`
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
