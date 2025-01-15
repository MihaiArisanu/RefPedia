import OpenAI from "openai";

// Configurarea OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Funcția care generează o întrebare despre regulamentul FIBA
const generateQuestion = async () => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3", // Folosește modelul corect
    store: true,
    messages: [
      { "role": "user", "content": "Generate a yes/no question about FIBA regulations." },
    ],
  });

  return completion.choices[0].message.content;
};

export { generateQuestion };