import { GoogleGenAI, Type } from "@google/genai";
import { VerseReflection, PersonalizedDua } from "../types";

let ai: GoogleGenAI | null = null;

// FIX: Per coding guidelines, API key must come from process.env.API_KEY. This also resolves the TypeScript error.
const apiKey = process.env.API_KEY;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    // FIX: Updated warning message to reflect the correct environment variable.
    console.warn("API_KEY is not set in environment variables. Gemini features will be disabled.");
}

const handleGeminiError = (error: unknown): string => {
    console.error("Error fetching from Gemini:", error);
    let message = 'An unknown error occurred while contacting the AI service.';
    if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('API key not valid')) {
            message = "The request was rejected. This can be due to an invalid API key, billing issues, or safety filters.";
        } else if (error.message.includes('500') || error.message.includes('503')) {
            message = "The AI service is currently experiencing issues. Please try again later."
        } else {
            message = error.message;
        }
    }
    return message;
};


export const getVerseReflection = async (verse: string): Promise<{ data: VerseReflection | null, error: string | null }> => {
  if (!ai) {
    // FIX: Updated error message to reflect the correct environment variable.
    const msg = "Gemini service is not initialized. The API_KEY may be missing or invalid.";
    console.warn(msg);
    return { data: null, error: msg };
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `الآية: "${verse}"`,
        config: {
          systemInstruction: `أنت عالم إسلامي حكيم ومتخصص في التفسير. مهمتك هي تقديم تأملات عميقة وعملية لآيات القرآن الكريم. يجب أن تكون الاستجابة بصيغة JSON حصرًا وباللغة العربية.
الشكل المطلوب:
{
  "reflection": "تأمل قصير (3-4 جمل) يربط الآية بمشاعر وحياة المسلم اليومية، ويركز على المعاني الإيمانية والروحية.",
  "actionable_tip": "نصيحة عملية واحدة ومحددة (جملة واحدة) يمكن للمستخدم تطبيقها اليوم بناءً على فهمه للآية."
}
تأكد من أن النصيحة العملية قابلة للتنفيذ الفوري. لا تضف أي مقدمات أو خواتيم خارج بنية JSON.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                reflection: {
                    type: Type.STRING,
                    description: "تأمل قصير (3-4 جمل) يربط الآية بمشاعر وحياة المسلم اليومية."
                },
                actionable_tip: {
                    type: Type.STRING,
                    description: "نصيحة عملية واحدة ومحددة (جملة واحدة) يمكن للمستخدم تطبيقها."
                }
            }
          }
        }
    });
    
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && result.reflection && result.actionable_tip) {
        return { data: result, error: null };
    }
    return { data: null, error: "The AI response was not in the expected format." };
  } catch (error) {
    const errorMessage = handleGeminiError(error);
    return { data: null, error: errorMessage };
  }
};

export const getPersonalizedDua = async (prompt: string): Promise<{ data: PersonalizedDua | null, error: string | null }> => {
    if (!ai) {
        // FIX: Updated error message to reflect the correct environment variable.
        const msg = "Gemini service is not initialized. The API_KEY may be missing or invalid.";
        console.warn(msg);
        return { data: null, error: msg };
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `طلب المستخدم: "${prompt}"`,
            config: {
                systemInstruction: `أنت مساعد إسلامي متخصص في صياغة الأدعية الشرعية من القرآن والسنة الصحيحة. مهمتك هي مساعدة المستخدمين على التعبير عن حاجاتهم في دعاء لله. بناءً على طلب المستخدم، قم بصياغة دعاء بليغ ومؤثر باللغة العربية. يجب أن تكون الاستجابة بصيغة JSON حصرًا.
**القواعد الصارمة التي يجب اتباعها:**
1. يجب أن يكون الدعاء متوافقًا تمامًا مع عقيدة أهل السنة والجماعة.
2. ابدأ الدعاء بأسماء الله الحسنى المناسبة للموقف (مثل: يا رزاق، يا شافي، اللهم...).
3. إذا كان هناك دعاء مناسب من القرآن أو السنة الصحيحة، فاستخدمه مع ذكر المصدر الكامل والدقيق (اسم السورة ورقم الآية، أو اسم الكتاب ورقم الحديث). إذا لم يوجد، فصغ دعاءً عامًا لا يتعارض مع النصوص الشرعية.
4. تجنب تمامًا أي أدعية مبتدعة أو تحتوي على توسل غير مشروع.
5. حافظ على الدعاء قصيرًا (2-3 جمل)، ومركّزًا على طلب المستخدم.
**الشكل المطلوب:**
{
  "dua": "نص الدعاء المصاغ.",
  "source_info": "مصدر الدعاء إذا كان من القرآن أو السنة (مثال: 'سورة البقرة - آية 201' أو 'صحيح مسلم، رقم 2723')، أو 'دعاء عام من وحي السنة' إذا كان من صياغتك. يجب أن يكون السند كاملاً ودقيقاً."
}`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dua: {
                            type: Type.STRING,
                            description: "نص الدعاء المصاغ للمستخدم."
                        },
                        source_info: {
                            type: Type.STRING,
                            description: "مصدر الدعاء (قرآن، سنة، أو دعاء عام)."
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.dua && result.source_info) {
            return { data: result, error: null };
        }
        return { data: null, error: "The AI response was not in the expected format." };

    } catch (error) {
        const errorMessage = handleGeminiError(error);
        return { data: null, error: errorMessage };
    }
}


export const getGoalInspiration = async (): Promise<{ data: {title: string; icon: string} | null; error: string | null; }> => {
    if (!ai) {
        // FIX: Updated error message to reflect the correct environment variable.
        const msg = "Gemini service is not initialized. The API_KEY may be missing or invalid.";
        console.warn(msg);
        return { data: null, error: msg };
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "اقترح عليّ هدفًا روحيًا أو إيمانيًا بسيطًا يمكنني إضافته لتطبيق المتابعة اليومية. الهدف يجب أن يكون قصيرًا ومحفزًا. أمثلة: 'صلة الرحم عبر مكالمة هاتفية', 'قراءة 10 صفحات من كتاب إسلامي', 'حفظ آية جديدة'. لا تقترح أهدافًا موجودة بالفعل في التطبيق مثل الصلاة أو الأذكار العامة أو قراءة القرآن. تجنب الأهداف المعقدة جدًا.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.STRING,
                            description: "عنوان الهدف المقترح. يجب أن يكون قصيراً وواضحاً ومحفزاً."
                        },
                        icon: {
                            type: Type.STRING,
                            description: "أيقونة (emoji) واحدة مناسبة للهدف."
                        }
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && result.title && result.icon) {
            return { data: result, error: null };
        }
        return { data: null, error: "The AI response was not in the expected format." };

    } catch (error) {
        const errorMessage = handleGeminiError(error);
        return { data: null, error: errorMessage };
    }
};