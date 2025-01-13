import OpenAI from "openai";

// Configurarea OpenAI API
const openai = new OpenAI({
  apiKey: "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",
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