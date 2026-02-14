import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyA5vuF21xtmtINg0u_3p_CWcUI65d4ZINc";

async function testModel(modelName) {
    console.log(`\n--- Testing Model: ${modelName} ---`);
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log("SUCCESS!");
        console.log("Response:", response.text());
        return true;
    } catch (error) {
        console.error("FAILED.");
        console.error("Error Message:", error.message);
        if (error.response) {
            // console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
        return false;
    }
}

async function run() {
    // Try requested model first
    let success = await testModel("gemini-1.5-flash");
    if (!success) {
        // Fallback
        await testModel("gemini-pro");
    }
}

run();
