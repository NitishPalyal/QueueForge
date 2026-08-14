import { gemini, groq } from "./ai.config.ts";
import type { AiProvider } from "./ai.types.ts";

async function geminiFlash(prompt: string): Promise<string> {
  const response = await gemini.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt as any,
  });

  return response.text as string;
}

async function geminiFlashLite(prompt: string): Promise<string> {
  const response = await gemini.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt as any,
  });

  return response.text as string;
}

async function groqLlmaInstant(prompt: string): Promise<string> {
  const response = await groq.models.generateContent({
    model: "llama-3.1-8b-instant",
    contents: prompt as any,
  });

  return response.text as string;
}

async function groqLlmaVersatile(prompt: string): Promise<string> {
  const response = await groq.models.generateContent({
    model: "llama-3.3-70b-versatile",
    contents: prompt as any,
  });

  return response.text as string;
}

export const providers: AiProvider[] = [
  {
    name: "gemini",
    models: [
      {
        name: "gemini-3.5-flash",
        generate: geminiFlashLite,
      },
      {
        name: "gemini-3.1-flash",
        generate: geminiFlash,
      },
    ],
  },
  {
    name: "groq",
    models: [
      {
        name: "llama-3.1-8b-instant",
        generate: groqLlmaInstant,
      },
      {
        name: "llama-3.3-70b-versatile",
        generate: groqLlmaVersatile,
      },
    ],
  },
];
