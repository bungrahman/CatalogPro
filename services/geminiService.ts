import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const API_KEY = process.env.API_KEY || ''; // In a real app, strict env handling

export const generateProductDescription = async (
  categoryName: string,
  brandName: string,
  type: string
): Promise<string> => {
  if (!API_KEY) {
    console.warn("No API KEY found for Gemini.");
    return "AI description unavailable (Missing API Key).";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const prompt = `Write a compelling, professional, and short sales description (max 2 sentences) for a product with the following details:
    Category: ${categoryName}
    Brand: ${brandName}
    Model/Type: ${type}
    
    Focus on value and features suitable for this type of product.`;

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