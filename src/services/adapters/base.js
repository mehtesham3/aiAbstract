import baseClient from "../../clients/baseClient.js";

/**
 * Base adapter class that all AI providers must extend
 */
class BaseAIAdapter extends baseClient {
    constructor(config) {
        if (new.target === BaseAIAdapter) {
            throw new Error('BaseAIAdapter is abstract - cannot instantiate directly');
        }

        super(config);
        this.providerName = config.provider;
        this.config = config;
    }

    /**
     * Generate text from prompt
     * @abstract
     * @param {string} prompt - Text prompt
     * @param {Object} options - Generation options
     * @returns {Promise<string>}
     */
    async generateText(prompt, options = {}) {
        throw new Error('generateText() must be implemented by subclass');
    }

    /**
     * Generate text with streaming
     * @abstract
     * @param {string} prompt - Text prompt
     * @param {Function} onChunk - Callback for each chunk
     * @param {Object} options - Generation options
     * @returns {Promise<void>}
     */
    async generateTextStream(prompt, onChunk, options = {}) {
        throw new Error('generateTextStream() must be implemented by subclass');
    }

    /**
     * Get provider capabilities
     * @returns {Object}
     */
    getCapabilities() {
        return {
            provider: this.providerName,
            supportsStreaming: false,
            supportsVision: false,
            supportsFunctionCalling: false,
            maxTokens: 4096,
            models: []
        };
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error(`${this.providerName} API key is required`);
        }
    }
}

export default BaseAIAdapter;