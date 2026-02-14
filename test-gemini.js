const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyA5vuF21xtmtINg0u_3p_CWcUI65d4ZINc"; // Use the key directly for testing

async function testGemini() {
    console.log("Testing Gemini API...");
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Hello, are you working?";
        console.log(`Sending prompt: "${prompt}"`);

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Success! Response:");
        console.log(text);
    } catch (error) {
        console.error("Test Failed!");
        console.error("Error message:", error.message);
        if (error.response) {
            console.error("Error details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
