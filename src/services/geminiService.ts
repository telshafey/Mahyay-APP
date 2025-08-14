
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Reflections feature will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getVerseReflection = async (verse: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("ميزة التأملات الروحية غير متاحة حالياً.");
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
