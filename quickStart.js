import { createAIService } from "./src/index.js";
import "dotenv/config"

// const ai = createAIService({ provider: process.env.AI_PROVIDER });
// const response = await ai.generateText('Hello AI, how are you?');
// console.log(response);

const ai2 = createAIService({ provider: process.env.AI_PROVIDER });
const streamResp = await ai2.generateTextStream('Tell me the capabilites of yours and also in which ways we can use you to get the best of yours ', (chunk) => {
    process.stdout.write(chunk);
});
console.log('Stream response : ', streamResp);