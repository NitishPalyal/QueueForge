import { gemini, groq } from "./ai.config.js";
async function geminiFlash(prompt) {
    const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
    });
    return response.text;
}
async function geminiFlashLite(prompt) {
    const response = await gemini.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
    });
    return response.text;
}
async function groqLlmaInstant(prompt) {
    const response = await groq.models.generateContent({
        model: "llama-3.1-8b-instant",
        contents: prompt,
    });
    return response.text;
}
async function groqLlmaVersatile(prompt) {
    const response = await groq.models.generateContent({
        model: "llama-3.3-70b-versatile",
        contents: prompt,
    });
    return response.text;
}
export const providers = [
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
//# sourceMappingURL=ai.providers.js.map