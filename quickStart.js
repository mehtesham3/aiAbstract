import { createAIService } from "./src/index.js";
import "dotenv/config"

const ai = createAIService({ provider: process.env.AI_PROVIDER });
const response = await ai.generateText('Hello AI, how are you?');
console.log(response);