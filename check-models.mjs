import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA5vuF21xtmtINg0u_3p_CWcUI65d4ZINc";

async function listModels() {
    console.log("Fetching available models...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Note: listModels is on the genAI instance or requires a specific manager in some SDK versions,
        // but often we have to fetch it via REST if SDK doesn't expose it easily or use the model manager.
        // Let's try the SDK's model manager if available, or just a known list logic.
        // Actually the error message suggested calling ListModels.

        // In the JS SDK, typically we might not have a direct listModels helper on the top level in older versions,
        // but let's try to see if we can just test a few known candidates if listModels isn't straightforward.

        // BETTER APPROACH: Just try the most likely candidates for 'Flash 2.0' (experimental) and others one by one.
        const candidates = [
            "gemini-2.0-flash-exp",
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.0-pro",
            "gemini-pro"
        ];

        for (const modelName of candidates) {
            console.log(`Testing ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                console.log(`✅ ${modelName} IS WORKING!`);
                return; // Found a working one
            } catch (e) {
                console.log(`❌ ${modelName} failed: ${e.message.split('[')[0]}`); // Print short error
            }
        }

    } catch (error) {
        console.error("Critical Error:", error);
    }
}

listModels();
