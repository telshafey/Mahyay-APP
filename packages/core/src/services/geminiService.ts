import { GoogleGenAI, Type } from "@google/genai";
import { VerseReflection, PersonalizedDua, IslamicOccasion, AiUpdateOccasion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJson = (text: string | undefined): any => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (e) {
        // Try extracting from markdown code block
        const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON:", e2);
            }
        }
        // Try finding { ... }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
             try {
                return JSON.parse(text.substring(start, end + 1));
            } catch (e3) {
                 console.error("Failed to parse JSON substring:", e3);
            }
        }
        console.warn("Could not parse JSON from response:", text);
        return null;
    }
};

const handleGeminiError = (error: unknown): string => {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        return error.message;
    }
    return "حدث خطأ غير معروف أثناء الاتصال بخدمة الذكاء الاصطناعي.";
};

export const getVerseReflection = async (verse: string): Promise<{ data: VerseReflection | null, error: string | null }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `الآية: "${verse}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        reflection: { type: Type.STRING, description: "تأمل قصير (3-4 جمل) يربط الآية بحياة المسلم اليومية." },
                        actionable_tip: { type: Type.STRING, description: "نصيحة عملية واحدة ومحددة (جملة واحدة)." },
                    },
                    required: ["reflection", "actionable_tip"],
                },
                systemInstruction: "أنت عالم إسلامي حكيم. قدم تأملات للقرآن باللغة العربية.",
            }
        });
        return { data: cleanAndParseJson(response.text), error: null };
    } catch (error) {
        return { data: null, error: handleGeminiError(error) };
    }
};

export const getPersonalizedDua = async (prompt: string): Promise<{ data: PersonalizedDua | null, error: string | null }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `طلب المستخدم: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dua: { type: Type.STRING },
                        source_info: { type: Type.STRING },
                    },
                    required: ["dua", "source_info"],
                },
                systemInstruction: "صغ دعاءً بليغاً ومؤثراً باللغة العربية من وحي القرآن والسنة.",
            }
        });
        return { data: cleanAndParseJson(response.text), error: null };
    } catch (error) {
        return { data: null, error: handleGeminiError(error) };
    }
};

export const getGoalInspiration = async (): Promise<{ data: {title: string; icon: string} | null; error: string | null; }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "اقترح هدفاً روحياً بسيطاً.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        icon: { type: Type.STRING },
                    },
                    required: ["title", "icon"],
                },
                systemInstruction: "اقترح أهدافاً إيمانية قصيرة ومحفزة.",
            }
        });
        return { data: cleanAndParseJson(response.text), error: null };
    } catch (error) {
        return { data: null, error: handleGeminiError(error) };
    }
};

export const getOccasionsUpdate = async (currentOccasions: IslamicOccasion[]): Promise<{ data: AiUpdateOccasion[] | null; error: string | null; }> => {
    try {
         const prompt = `راجع هذه المناسبات الإسلامية: [${currentOccasions.map(o => o.name).join(', ')}]. اقترح إضافات إذا كانت هناك مناسبات هامة مفقودة.`;
         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        updates: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    action: { type: Type.STRING, description: "Must be 'add'" }, 
                                    newItem: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            hijriDay: { type: Type.INTEGER },
                                            hijriMonth: { type: Type.INTEGER },
                                            description: { type: Type.STRING }
                                        }
                                    },
                                    reason: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
         });
         const json = cleanAndParseJson(response.text);
         return { data: json?.updates || [], error: null };
    } catch (error) {
        return { data: null, error: handleGeminiError(error) };
    }
};
