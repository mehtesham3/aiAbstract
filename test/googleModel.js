import { GoogleGenAI } from "@google/genai"
import "dotenv/config"

const ai = new GoogleGenAI({ "apiKey": process.env.GOOGLE_API_KEY });

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain how AI works in a few words"
    });
    console.log(response.text);
}

main();