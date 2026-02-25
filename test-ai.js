const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyA5vuF21xtmtINg0u_3p_CWcUI65d4ZINc");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Salom!");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.error("1.5-flash Error Stack:", e.stack);
    }
}
test();
