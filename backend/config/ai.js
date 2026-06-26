import Groq from 'groq-sdk';

// Groq client — almost identical API to OpenAI, just different model names
// and a different import. All our controller logic stays the same.
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;