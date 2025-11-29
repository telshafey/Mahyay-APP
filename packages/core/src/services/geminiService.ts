import { VerseReflection, PersonalizedDua } from "../types";

// تم تعطيل الذكاء الصناعي للإصدار التجريبي الحالي
// AI Services are disabled for the current preview release

export const getVerseReflection = async (_verse: string): Promise<{ data: VerseReflection | null, error: string | null }> => {
  return { data: null, error: "خدمة الذكاء الصناعي غير مفعلة حالياً." };
};

export const getPersonalizedDua = async (_prompt: string): Promise<{ data: PersonalizedDua | null, error: string | null }> => {
    return { data: null, error: "خدمة الذكاء الصناعي غير مفعلة حالياً." };
}

export const getGoalInspiration = async (): Promise<{ data: {title: string; icon: string} | null; error: string | null; }> => {
    return { data: null, error: "خدمة الذكاء الصناعي غير مفعلة حالياً." };
};