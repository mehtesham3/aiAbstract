import "dotenv/config"

const aiConfig = {
    defaultProvider: process.env.AI_PROVIDER || "google",
    openai: {
        apiKey: process.env.NVIDIA_API_KEY,
        model: process.env.NVIDIA_MODEL || "nvidia/nemotron-mini-4b-instruct",
        timeout: process.env.NVIDIA_TIMEOUT || 30000,
        maxRetries: process.env.NVIDIA_MAX_RETRIES || 3
    },

    google: {
        apiKey: process.env.GOOGLE_API_KEY,
        model: process.env.GOOGLE_MODEL || "gemini-3-flash-preview",
        timeout: process.env.GOOGLE_TIMEOUT || 30000,
        maxRetries: process.env.GOOGLE_MAX_RETRIES || 3
    }
}

export default aiConfig;