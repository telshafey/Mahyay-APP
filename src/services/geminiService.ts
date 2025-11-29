import { GoogleGenAI, Type } from "@google/genai";
import { VerseReflection, PersonalizedDua } from "../types";

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

// This block runs once when the module is loaded.
try {
    const apiKey = process.env.API_KEY;

    // Vite replaces process.env.API_KEY with the value at build time. 
    // If VITE_API_KEY is not set on Vercel, it becomes 'undefined' as a string.
    if (apiKey === 'undefined') {
        throw new Error("خطأ في الإعداد: متغير VITE_API_KEY غير موجود في Vercel. يرجى إضافته في إعدادات المشروع (Project Settings > Environment Variables) ثم إعادة النشر (Redeploy).");
    }
    
    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error("خطأ في الإعداد: متغير VITE_API_KEY موجود ولكنه فارغ. يرجى إدخال قيمة مفتاح API الصحيحة في Vercel.");
    }

    if (apiKey.trim().length < 10) { // API keys are usually much longer
         throw new Error("خطأ في الإعداد: مفتاح API الذي تم إدخاله قصير جدًا ويبدو غير صالح. يرجى التحقق منه في إعدادات Vercel.");
    }

    ai = new GoogleGenAI({ apiKey });

} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Gemini service initialization failed: ${message}`);
    initializationError = message;
}

const cleanAndParseJson = (text: string | undefined): any => {
    if (!text) {
        throw new Error("استجابة فارغة من نموذج الذكاء الاصطناعي.");
    }

    // Attempt to find the JSON block, which might be wrapped in markdown
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```|(\{[\s\S]*\})|(\[[\s\S]*\])/);

    if (!jsonMatch) {
        // With responseMimeType: "application/json", the response should be a clean JSON string.
        // We can try parsing it directly.
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error("Could not find or parse JSON block in Gemini response:", text);
            throw new Error("لم يتم العثور على كتلة JSON في استجابة الذكاء الاصطناعي أو أن الصيغة غير صالحة.");
        }
    }
    
    // The actual JSON string is in one of the capturing groups
    const jsonString = jsonMatch[1] || jsonMatch[2] || jsonMatch[3];

    if (!jsonString) {
        console.error("Could not extract JSON string from Gemini response:", text);
        throw new Error("فشل استخلاص نص JSON من استجابة الذكاء الاصطناعي.");
    }

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse extracted JSON from Gemini. Raw text:", text);
        console.error("Extracted string for parsing:", jsonString);
        throw new Error("صيغة JSON المستخرجة من استجابة الذكاء الاصطناعي غير صالحة.");
    }
};


const handleGeminiError = (error: unknown): string => {
    console.error("Error fetching from Gemini:", error);
    let message = 'حدث خطأ غير معروف أثناء الاتصال بخدمة الذكاء الاصطناعي.';
    if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('API key not valid')) {
            message = "تم رفض الطلب. قد يكون هذا بسبب مفتاح API غير صالح، أو مشاكل في الفوترة، أو فلاتر الأمان.";
        } else if (error.message.includes('500') || error.message.includes('503')) {
            message = "خدمة الذكاء الاصطناعي تواجه مشاكل حاليًا. يرجى المحاولة مرة أخرى لاحقًا."
        } else {
            message = error.message;
        }
    }
    return message;
};


export const getVerseReflection = async (verse: string): Promise<{ data: VerseReflection | null, error: string | null }> => {
  if (!ai) {
    const msg = initializationError || "خدمة الذكاء الاصطناعي غير مهيأة لسبب غير معروف.";
    console.warn(msg);
    return { data: null, error: msg };
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `الآية: "${verse}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reflection: {
                type: Type.STRING,
                description: "تأمل قصير (3-4 جمل) يربط الآية بحياة المسلم اليومية.",
              },
              actionable_tip: {
                type: Type.STRING,
                description: "نصيحة عملية واحدة ومحددة (جملة واحدة) يمكن للمستخدم تطبيقها اليوم بناءً على فهم الآية.",
              },
            },
            required: ["reflection", "actionable_tip"],
          },
          systemInstruction: `أنت عالم إسلامي حكيم. مهمتك هي تقديم تأملات لآيات القرآن باللغة العربية.`,
        }
    });
    
    const result = cleanAndParseJson(response.text);

    if (result && result.reflection && result.actionable_tip) {
        return { data: result, error: null };
    }

    console.warn("Unexpected AI response structure. Raw text:", response.text);
    let detailedError = "لم تأت استجابة الذكاء الاصطناعي بالشكل المتوقع.";

    if (result && typeof result === 'object') {
        const missingKeys = [];
        if (!result.reflection) missingKeys.push("'التأمل (reflection)'");
        if (!result.actionable_tip) missingKeys.push("'النصيحة العملية (actionable_tip)'");
        if (missingKeys.length > 0) {
            detailedError = `الاستجابة من الذكاء الاصطناعي تفتقد الحقول التالية: ${missingKeys.join(' و ')}.`;
        }
    }
    
    const rawResponseSnippet = response.text ? response.text.substring(0, 100) : "فارغ";
    detailedError += ` المحتوى المستلم جزئيًا: "${rawResponseSnippet}..."`;

    return { data: null, error: detailedError };

  } catch (error) {
    const errorMessage = handleGeminiError(error);
    return { data: null, error: errorMessage };
  }
};

export const getPersonalizedDua = async (prompt: string): Promise<{ data: PersonalizedDua | null, error: string | null }> => {
    if (!ai) {
        const msg = initializationError || "خدمة الذكاء الاصطناعي غير مهيأة لسبب غير معروف.";
        console.warn(msg);
        return { data: null, error: msg };
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `طلب المستخدم: "${prompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        dua: {
                            type: Type.STRING,
                            description: "نص الدعاء المصاغ.",
                        },
                        source_info: {
                            type: Type.STRING,
                            description: "مصدر الدعاء إذا كان من القرآن أو السنة (مثال: 'سورة البقرة - آية 201' أو 'صحيح مسلم، رقم 2723')، أو 'دعاء عام من وحي السنة' إذا كان من صياغتك. يجب أن يكون السند كاملاً ودقيقاً.",
                        },
                    },
                    required: ["dua", "source_info"],
                },
                systemInstruction: `أنت مساعد إسلامي متخصص في صياغة الأدعية الشرعية من القرآن والسنة الصحيحة. مهمتك هي مساعدة المستخدمين على التعبير عن حاجاتهم في دعاء لله. بناءً على طلب المستخدم، قم بصياغة دعاء بليغ ومؤثر باللغة العربية.
**القواعد التي يجب اتباعها:**
1. يجب أن يكون الدعاء متوافقًا تمامًا مع عقيدة أهل السنة والجماعة.
2. ابدأ الدعاء بأسماء الله الحسنى المناسبة للموقف (مثل: يا رزاق، يا شافي، اللهم...).
3. إذا كان هناك دعاء مناسب من القرآن أو السنة الصحيحة، فاستخدمه مع ذكر المصدر الكامل والدقيق (اسم السورة ورقم الآية، أو اسم الكتاب ورقم الحديث). إذا لم يوجد، فصغ دعاءً عامًا لا يتعارض مع النصوص الشرعية.
4. تجنب تمامًا أي أدعية مبتدعة أو تحتوي على توسل غير مشروع.
5. حافظ على الدعاء قصيرًا (2-3 جمل)، ومركّزًا على طلب المستخدم.`,
            }
        });

        const result = cleanAndParseJson(response.text);

        if (result && result.dua && result.source_info) {
            return { data: result, error: null };
        }

        console.warn("Unexpected AI response structure for Dua. Raw text:", response.text);
        const rawResponseSnippet = response.text ? response.text.substring(0, 150) : "فارغ";
        const detailedError = `فشل تحليل استجابة الدعاء. المحتوى المستلم: "${rawResponseSnippet}..."`;
        return { data: null, error: detailedError };


    } catch (error) {
        const errorMessage = handleGeminiError(error);
        return { data: null, error: errorMessage };
    }
}


export const getGoalInspiration = async (): Promise<{ data: {title: string; icon: string} | null; error: string | null; }> => {
    if (!ai) {
        const msg = initializationError || "خدمة الذكاء الاصطناعي غير مهيأة لسبب غير معروف.";
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
                            description: "عنوان الهدف المقترح. يجب أن يكون قصيراً وواضحاً ومحفزاً.",
                        },
                        icon: {
                            type: Type.STRING,
                            description: "أيقونة (emoji) واحدة مناسبة للهدف.",
                        },
                    },
                    required: ["title", "icon"],
                },
                systemInstruction: `أنت مساعد إبداعي. مهمتك اقتراح أهداف إيمانية.`,
            }
        });
        
        const result = cleanAndParseJson(response.text);

        if (result && result.title && result.icon) {
            return { data: result, error: null };
        }

        console.warn("Unexpected AI response structure for Goal. Raw text:", response.text);
        const rawResponseSnippet = response.text ? response.text.substring(0, 150) : "فارغ";
        const detailedError = `فشل تحليل استجابة الهدف. المحتوى المستلم: "${rawResponseSnippet}..."`;
        return { data: null, error: detailedError };

    } catch (error) {
        const errorMessage = handleGeminiError(error);
        return { data: null, error: errorMessage };
    }
};