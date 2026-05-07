import { createAIService } from "../src/index.js";

async function basicExamples() {
    console.log('\n=== BASIC AI SERVICE EXAMPLES ===\n');

    // Example 1: Using default provider (from .env)
    console.log('1. Using default provider...');
    const defaultAI = createAIService();
    console.log('Provider : ', defaultAI.getInfo());

    const resp1 = await defaultAI.generateText('Hello, how are you?');
    console.log('Response 1 : ', resp1);

    console.log("\n Using Google explicitly... ");

    const googleAI = createAIService({
        provider: "google"
    });

    const resp2 = await googleAI.generateText('Explain how AI works in a few words');
    console.log('Response 2 : ', resp2);

    console.log("\n Using OpenAI explicitly... ");

    const openaiAI = createAIService({
        provider: "openai"
    });

    const resp3 = await openaiAI.generateText('Tell me some python tricks');
    console.log('Response 3 : ', resp3);

}

basicExamples().then(() => {
    console.log('Basic examples completed');
}).catch((err) => {
    console.log('Error in basic examples', err);
});
