import normalizeVendorError from "../utils/errorNormalizer.js";
import GeminiAdapter from "./adapters/Google.adapter.js";
import GroqAdapter from "./adapters/Groq.adapter.js";
import OpenAIAdapter from "./adapters/OpenAI.adapter.js";


class AIService {
    constructor(config) {
        this.provider = config.provider.toLowerCase();
        this.adapter = this.initializeAdapter(this.provider, config);
        console.log('AIService initialized', {
            provider: this.provider,
            capabilities: this.adapter.getCapabilities()
        });
    }

    initializeAdapter(provider = this.provider, config) {
        switch (provider) {
            case 'openai':
                return new OpenAIAdapter(config);
            case 'google':
                return new GeminiAdapter(config);
            case 'groq':
                return new GroqAdapter(config);
            default:
                throw new Error(`Unknow AI provider: ${provider}. Supported openai, gemini`);
        }
    }

    /**
     * Generate text using the selected AI provider
     * @param {string} prompt - The text prompt to send to the AI model
     * @param {Object} options - Additional generation options
     * @returns {Promise<string>} - The generated text from the AI model
     */
    async generateText(prompt, options = {}) {
        try {
            return await this.adapter.generateText(prompt, options);
        }
        catch (error) {
            throw normalizeVendorError(error, this.provider);
        }
    }

    /**
     * Generate text with streaming     
     * @param {string} prompt 
     * @param {Function} onChunk 
     * @param {Object} options 
     * @returns {Promise<void>}
     */
    async generateTextStream(prompt, onChunk, options = {}) {
        try {
            const capabilities = this.adapter.getCapabilities();
            if (!capabilities.supportsStreaming) {
                throw new Error(`Streamming is not supported by ${this.provider}`);
            }

            return await this.adapter.generateTextStream(prompt, onChunk, options);
        }
        catch (error) {
            throw normalizeVendorError(error, this.provider);
        }
    }

    getInfo() {
        return {
            provider: this.provider,
            ...this.adapter.getCapabilities()
        }

    }
}

export default AIService;