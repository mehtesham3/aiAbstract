import OpenAI from 'openai';
import "dotenv/config";

const apiKey = process.env.NVIDIA_API_KEY1;

const openai = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
    const completion = await openai.chat.completions.create({
        model: "moonshotai/kimi-k2-thinking",
        messages: [{ "role": "user", "content": "which is bigger 1.8 or 1.11 ?" }],
        temperature: 1,
        top_p: 0.9,
        max_tokens: 16384,
        stream: true
    });


    for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta;

        const reasoning = delta?.reasoning_content;
        if (reasoning) {
            process.stdout.write(reasoning);
        }

        if (delta?.content) {
            process.stdout.write(delta.content);
        }
    }

}

main().catch(console.error);