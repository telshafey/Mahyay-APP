import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, the API key must be obtained from process.env.API_KEY.
// This also resolves the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getVerseReflection = async (verse: string): Promise<string> => {
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
