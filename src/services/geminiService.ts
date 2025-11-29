

import { GoogleGenAI, Type } from "@google/genai";
import { VerseReflection, PersonalizedDua, IslamicOccasion, AiUpdateOccasion } from "./types";

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

// This block runs once when the module is loaded.
try {
    const apiKey = process.env.API_KEY;
    
    if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
        throw new Error("VITE_API_KEY is not configured. Please add it to your environment variables.");
    }

    ai = new GoogleGenAI({ apiKey });

} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Gemini service initialization failed: ${message}`);
    initializationError = `Gemini service initialization failed: ${message}`;
}

const cleanAndParseJson = (text: string | undefined): any => {
    if (!text) {
        throw new Error("استجابة فارغة من نموذج الذكاء الاصطناعي.");
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error("Could not parse JSON directly, trying to extract from markdown. Raw text:", text);
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            try {
                return JSON.parse(jsonMatch[1]);
            } catch (e2) {
                console.error("Failed to parse extracted JSON. Extracted string:", jsonMatch[1]);
                throw new Error("صيغة JSON المستخرجة من استجابة الذكاء الاصطناعي غير صالحة.");
            }
        }
        throw new Error("لم يتم العثور على كتلة JSON صالحة في استجابة الذكاء الاصطناعي.");
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
    return { data: null, error: "لم تأت استجابة الذكاء الاصطناعي بالشكل المتوقع." };

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
        return { data: null, error: "فشل تحليل استجابة الدعاء." };


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
        return { data: null, error: "فشل تحليل استجابة الهدف." };

    } catch (error) {
        const errorMessage = handleGeminiError(error);
        return { data: null, error: errorMessage };
    }
};

export const getOccasionsUpdate = async (currentOccasions: IslamicOccasion[]): Promise<{ data: AiUpdateOccasion[] | null; error: string | null; }> => {
    if (!ai) {
        const msg = initializationError || "خدمة الذكاء الاصطناعي غير مهيأة لسبب غير معروف.";
        return { data: null, error: msg };
    }
    try {
        const currentOccasionsNames = currentOccasions.map(o => o.name).join(', ');
        const prompt = `هذه هي قائمة المناسبات الإسلامية الموجودة حاليًا في التطبيق: [${currentOccasionsNames}].
        راجع هذه القائمة وقارنها بقائمة المناسبات الإسلامية السنوية الهامة والمعروفة لدى المسلمين (مثل رأس السنة الهجرية، عاشوراء، المولد النبوي، الإسراء والمعراج، النصف من شعبان، بداية رمضان، ليلة القدر، عيد الفطر، يوم عرفة، عيد الأضحى، أيام التشريق).
        إذا وجدت مناسبة هامة جدًا مفقودة، قم بإضافتها. لا تقم بتعديل أو حذف أي مناسبات موجودة.`;

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
                                    action: { type: Type.STRING, description: "يجب أن يكون 'add' فقط." },
                                    newItem: {
                                        type: Type.OBJECT,
                                        properties: {
                                            name: { type: Type.STRING },
                                            hijriDay: { type: Type.INTEGER },
                                            hijriMonth: { type: Type.INTEGER },
                                            description: { type: Type.STRING }
                                        }
                                    },
                                    reason: { type: Type.STRING, description: "سبب الإضافة، مثال: 'إضافة مناسبة هامة مفقودة.'" }
                                }
                            }
                        }
                    }
                },
                systemInstruction: `أنت خبير في التقويم الإسلامي. مهمتك هي مراجعة قائمة المناسبات واقتراح الإضافات الضرورية فقط بصيغة JSON.`
            }
        });

        const result = cleanAndParseJson(response.text);
        
        if (result && Array.isArray(result.updates)) {
            return { data: result.updates, error: null };
        }

        console.warn("Unexpected AI response for occasions update:", response.text);
        return { data: null, error: "لم تأت استجابة الذكاء الاصطناعي بالشكل المتوقع." };

    } catch (error) {
        return { data: null, error: handleGeminiError(error) };
    }
};