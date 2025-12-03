import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const API_KEY = process.env.API_KEY || ''; // In a real app, strict env handling

export const generateProductDescription = async (
  name: string,
  type: string,
  categoryName: string,
  brandName: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn("No API KEY found for Gemini.");
    return "AI description unavailable (Missing API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Write a compelling, professional, and short sales description (max 2 sentences) for a product with the following details:
    Product Name: ${name}
    Type: ${type}
    Brand: ${brandName}
    Category: ${categoryName}
    
    Focus on value and features.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate description.";
  }
};