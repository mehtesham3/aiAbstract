import { GoogleGenAI } from "@google/genai";
import BaseAIAdapter from "./base.js";

class GeminiAdapter extends BaseAIAdapter {
    constructor(config) {
        super(config);
        this.validateConfig();

        this.clientSdk = new GoogleGenAI({ apiKey: config.apikey });
        this.defaultModel = config.model || 'gemini-3-flash-preview'
    }

    async generateText(prompt, options = {}) {
        const model = options.model || this.defaultModel;
        console.debug('Gemini generateText called', {
            promptLength: prompt.length,
            model: model
        });
        const response = await this.clientSdk.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                temperature: options.temperature || 0.7,
                // maxOutputTokens: options.maxTokens || 500,
            }
        });

        const text = response.text;
        console.debug('Gemini response details', {
            model: model,
            textLength: text.length
        })
        return text;
    }

    async generateTextStream(prompt, onChunk, options = {}) {
        const model = options.model || this.defaultModel;
        console.debug('Gemini generateTextStream called', {
            promptLength: prompt.length,
            model: model
        });
        const result = await this.clientSdk.models.generateContentStream({
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        let totalChunks = 0;
        for await (const chunks of result.stream) {
            const text = chunks.text();
            if (text) {
                onChunk(text);
                totalChunks++;
            }
        }
        console.log('Gemini streaming complete', { totalChunks });
    }

    getCapabilities() {
        return {
            provider: 'Google',
            supportsStreaming: true,
            supportsVision: true,
            supportsFunctionCalling: false,
            maxTokens: 2048,
            models: ['gemini-2.5-pro', 'gemini-2.5-flash']
        }
    }
}

export default GeminiAdapter;