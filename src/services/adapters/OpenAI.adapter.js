import OpenAI from "openai";
import BaseAIAdapter from "./base.js";


class OpenAIAdapter extends BaseAIAdapter {
    constructor(config) {
        super(config);
        this.validateConfig();

        this.clientSdk = new OpenAI({
            apiKey: config.apiKey,
            baseURL: 'https://integrate.api.nvidia.com/v1'
        })

        this.defaultModel = config.model || 'nvidia/nemotron-mini-4b-instruct';
    }

    async generateText(prompt, options = {}) {
        const { model = this.defaultModel, maxTokens, temperature } = options;

        console.debug('OpenAI generateText called', { promptLenth: prompt.length, model: options.model || this.defaultModel });
        const response = await this.clientSdk.chat.completions.create({
            model: options.model || this.defaultModel,
            messages: [
                ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
                { role: "user", content: prompt }
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 500,
            temperature: options.temperature
        });

        const text = response.choices[0].message.content;
        const usage = response.usage;

        console.debug('OpenAI response details', { model: response.model, tokenUsed: usage.total_tokens, promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens });

        return text;
    }

    async generateTextStream(prompt, onChunk, options = {}) {
        console.debug('OpenAI generateTextStream called', {
            proomptLength: prompt.length
        });

        const stream = await this.clientSdk.chat.completions.create({
            model: options.model || this.defaultModel,
            messages: [
                ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
                { role: 'user', content: prompt }
            ],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 500,
            stream: true
        });

        let totalChunks = 0;
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                onChunk(content);
                totalChunks++;
            }
        }

        console.log('OpenAI streaming complete', { totalChunks });
    }

    getCapabilities() {
        return {
            provider: 'NvidiaAI',
            supportsStreaming: true,
            supportsVision: true,
            supportsFunctionCalling: true,
            maxTokens: 8192,
            models: ['moonshotai/kimi-k2-thinking', 'nvidia/nemotron-mini-4b-instruct']
        };
    }
}

export default OpenAIAdapter;