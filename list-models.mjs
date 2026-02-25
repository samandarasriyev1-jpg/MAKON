const API_KEY = "AIzaSyA5vuF21xtmtINg0u_3p_CWcUI65d4ZINc";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        console.log("Available models:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
