import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Fix: The API key must be obtained exclusively from the environment variable `process.env.API_KEY` as per guidelines, which also resolves the TypeScript error.
const apiKey = process.env.API_KEY;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    // This warning will be visible in the developer console if the API_KEY is not set.
    // Fix: Updated warning message to refer to the correct environment variable.
    console.warn("API_KEY is not set in environment variables. Gemini features will be disabled.");
}

export const getVerseReflection = async (verse: string): Promise<string> => {
  if (!ai) {
    return "عذراً، خدمة التأملات الروحية غير مهيأة بشكل صحيح. (مفتاح API غير موجود)";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `الآية: "${verse}"`,
        config: {
          systemInstruction: "أنت عالم إسلامي حكيم ولطيف. قدم تأملًا قصيرًا وملهمًا ومحفزًا (لا يزيد عن 3-4 جمل). يجب أن يكون التأمل باللغة العربية، سهل الفهم، ويركز على ربط الآية بالحياة اليومية والنمو الروحي. لا تضف أي مقدمة أو خاتمة، فقط التأمل نفسه."
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching reflection from Gemini:", error);
    return "عذراً، حدث خطأ أثناء جلب التأمل الروحي.";
  }
};