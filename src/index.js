import AIService from "./services/ai.service.js";
import aiConfig from "./config/ai.config.js";

/**
 * Create AI service instance
 * @param {Object} config
 * @returns {AIService}
 */

export function createAIService(config = null) {
    if (!config || !config.provider) {
        throw new Error("Please provide a valid AI provider configuration");
    }

    const provider = config.provider.toLowerCase();
    if (!aiConfig[provider]) {
        throw new Error(`AI provider ${provider} is not supported`);
    }
    return new AIService({ ...aiConfig[provider], ...config });
}

/**
 * Get default AI service instance
 */
let defaultService = null;
export function getAIService() {
    if (!defaultService) {
        defaultService = createAIService();
    }
    return defaultService;
}

export { AIService };

export default {
    createAIService,
    getAIService,
    AIService
};