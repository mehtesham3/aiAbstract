import { createAIService } from "./src/index.js";
import "dotenv/config"

// const ai = createAIService({ provider: process.env.AI_PROVIDER });
// const response = await ai.generateText('Hello AI, how are you?');
// console.log(response);

const ai2 = createAIService({ provider: process.env.AI_PROVIDER });
const streamResp = await ai2.generateTextStream('Explain me in detail about the working of Groq LLM model , its architecture and best ways to use it for different usecases ', (chunk) => {
    process.stdout.write(chunk);
});
console.log('Stream response : ', streamResp);