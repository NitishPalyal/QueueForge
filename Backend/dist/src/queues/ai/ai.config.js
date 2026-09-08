import { GoogleGenAI } from "@google/genai";
import configKeys from "../../config/config.keys.js";
export const gemini = new GoogleGenAI({
    apiKey: configKeys.GEMINI_API_KEY,
});
export const groq = new GoogleGenAI({
    apiKey: configKeys.GROQ_API_KEY,
});
//# sourceMappingURL=ai.config.js.map