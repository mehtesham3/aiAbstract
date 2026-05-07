import OpenAI from 'openai';
import "dotenv/config"
const apiKey = process.env.NVIDIA_API_KEY;

const openai = new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1',
})

const url = 'https://api.nvcf.nvidia.com/v2/nvcf/assets';
const options = {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ contentType: 'image/jpeg', description: 'Profile picture for processing' })
};

fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));

async function main() {
    const completion = await openai.chat.completions.create({
        model: "nvidia/nemotron-3-super-120b-a12b",
        messages: [{ "role": "user", "content": "Write a limerick about the wonders of GPU computing." }],
        temperature: 1,
        top_p: 0.95,
        max_tokens: 16384,
        reasoning_budget: 16384,
        chat_template_kwargs: { "enable_thinking": true },
        stream: true
    })

    for await (const chunk of completion) {
        const reasoning = chunk.choices[0]?.delta?.reasoning_content;
        if (reasoning) process.stdout.write(reasoning);
        process.stdout.write(chunk.choices[0]?.delta?.content || '')

    }

}

// main();