import Groq from "groq-sdk";
import "dotenv/config"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    const chatComplete = await getGroqChatComplete();

    console.log(chatComplete.choices[0]?.message?.content || "");
}

async function getGroqChatComplete() {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: "Explain the importance of fast language models",
            },
        ],
        model: "openai/gpt-oss-20b"
    })
}

main();