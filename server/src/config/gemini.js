import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API });

export const geminiModel = genAI;

export default genAI;
