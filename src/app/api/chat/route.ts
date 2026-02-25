import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Fallback to stable free tier model
        const modelName = "gemini-1.5-flash";

        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: "You are 'AI Ustoz', a helpful and professional programming mentor for the MAKON platform. Your goal is to help students learn frontend (React, Tailwind, Next.js) and backend development. Be encouraging, concise, and provide code examples where helpful. Always answer in Uzbek language."
        });

        const lastMessage = messages[messages.length - 1];

        try {
            const result = await model.generateContent(lastMessage.content);
            const response = await result.response;
            const text = response.text();

            return NextResponse.json({ content: text });
        } catch (error: any) {
            console.error(`Attempt 1 failed with ${modelName}:`, error.message);

            // If Rate Limited (429), try one more time after a short delay
            if (error.message && error.message.includes("429")) {
                console.log("Rate limited. Waiting 2 seconds to retry...");
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    const resultRetry = await model.generateContent(lastMessage.content);
                    const responseRetry = await resultRetry.response;
                    const textRetry = responseRetry.text();
                    return NextResponse.json({ content: textRetry });
                } catch (retryError: any) {
                    console.error("Retry failed:", retryError.message);
                    return NextResponse.json({
                        error: "Too Many Requests",
                        details: "Google AI serveri juda band (Rate Limit). Iltimos, 1 daqiqadan so'ng urinib ko'ring."
                    }, { status: 429 });
                }
            }

            // If 404, we have no choice but to report it, as we tried the others and they failed too.
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
