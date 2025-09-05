import React, { useState, useMemo } from 'react';
import GlassCard from '../../components/GlassCard';
import FAQItem from '../../components/more/FAQItem';

const SupportPage: React.FC = () => {
    const faqCategories = [
        {
            category: "أسئلة عامة",
            icon: "❓",
            faqs: [
                {
                    q: "ما هو تطبيق مَحيّاي؟",
                    a: "مَحيّاي هو تطبيق إسلامي شامل مصمم ليكون رفيقك الروحي اليومي، يساعدك على تنظيم عباداتك من صلوات وأذكار وقراءة للقرآن الكريم، مع متابعة تقدمك عبر إحصائيات وتحديات محفزة."
                },
                {
                    q: "هل التطبيق مجاني؟",
                    a: "نعم، تطبيق مَحيّاي مجاني بالكامل ويهدف لخدمة المسلمين في كل مكان. هذا العمل هو وقف لوجه الله تعالى."
                },
                 {
                    q: "وجدت خطأ في محتوى التطبيق، كيف أبلغ عنه؟",
                    a: "نعتذر عن أي خطأ قد تجده. يرجى مراسلتنا فورًا عبر البريد الإلكتروني الموضح في قسم 'تواصل معنا' مع تفاصيل الخطأ، وسنعمل على تصحيحه في أقرب وقت ممكن. جزاكم الله خيرًا."
                }
            ]
        },
        {
            category: "البيانات والخصوصية",
            icon: "🔒",
            faqs: [
                 {
                    q: "أين يتم حفظ بياناتي؟ وهل هي آمنة؟",
                    a: "يتم حفظ جميع بياناتك (صلواتك، أذكارك، تقدمك) بشكل آمن في التخزين المحلي لمتصفحك على جهازك الخاص. هذا يعني أن بياناتك لا تغادر جهازك وهي خاصة بك تمامًا."
                },
                {
                    q: "هل يمكنني استخدام التطبيق على جهاز آخر ومزامنة بياناتي؟",
                    a: "حاليًا، بياناتك مرتبطة بالمتصفح الذي تستخدمه على جهازك الحالي. لا توجد مزامنة سحابية بين الأجهزة في هذه النسخة، ولكن يمكنك استخدام ميزة 'تصدير البيانات' من لوحة التحكم لنقلها يدوياً."
                },
                {
                    q: "كيف يمكنني حذف جميع بياناتي؟",
                    a: "يمكنك الذهاب إلى 'الإعدادات' واختيار 'إعادة تعيين التطبيق بالكامل' من منطقة الخطر. هذا الإجراء سيحذف جميع بياناتك نهائيًا ولا يمكن التراجع عنه."
                }
            ]
        },
        {
            category: "ميزات التطبيق",
            icon: "⚙️",
            faqs: [
                 {
                    q: "كيف يتم حساب أوقات الصلاة؟",
                    a: "يتم جلب أوقات الصلاة تلقائيًا بناءً على موقع جهازك. إذا لم تمنح الإذن بالوصول للموقع، سيتم استخدام مواقيت القاهرة كإعداد افتراضي. يمكنك تغيير طريقة الحساب من 'الإعدادات'."
                },
                {
                    q: "كيف تعمل أوقات الأذكار؟ وهل يمكنني تخصيصها؟",
                    a: "يقوم التطبيق بعرض أذكار الصباح والمساء تلقائيًا بناءً على الوقت الحالي. ولمزيد من المرونة، يمكنك الذهاب إلى 'الإعدادات' وتحديد وقت بداية أذكار الصباح والمساء بنفسك ليناسب روتينك اليومي."
                },
                {
                    q: "كيف تعمل الإحصائيات والنقاط؟",
                    a: "تُحسب نقاطك بناءً على إنجازاتك اليومية: 10 نقاط لكل صلاة في وقتها، 15 نقطة لكل مجموعة أذكار مكتملة، ونقطتان لكل صفحة تقرأها من القرآن. 'الأيام المتتالية' تزداد كل يوم تكمل فيه 3 صلوات على الأقل."
                },
                {
                    q: "كيف أضيف هدفاً شخصياً؟",
                    a: "من القائمة المنسدلة في الأعلى أو من الصفحة الرئيسية، اختر 'أهدافي الشخصية'. هناك يمكنك إضافة هدف جديد، سواء كان هدفًا يوميًا (مثل قراءة أذكار معينة) أو هدفًا له كمية محددة (مثل قراءة كتاب)."
                }
            ]
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, 'yes' | 'no' | null>>({});

    const handleFeedback = (question: string, feedback: 'yes' | 'no') => {
        setHelpfulFeedback(prev => ({ ...prev, [question]: feedback }));
    };

    const filteredResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        const lowercasedTerm = searchTerm.toLowerCase();
        const results: { q: string, a: string }[] = [];

        faqCategories.forEach(category => {
            category.faqs.forEach(faq => {
                if (faq.q.toLowerCase().includes(lowercasedTerm) || faq.a.toLowerCase().includes(lowercasedTerm)) {
                    results.push(faq);
                }
            });
        });
        return results;
    }, [searchTerm, faqCategories]);

    return (
        <div className="space-y-6">
            <GlassCard>
                <div className="relative">
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="ابحث عن سؤالك هنا..."
                        className="w-full bg-black/30 border border-white/20 rounded-full px-5 py-3 pr-12 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                     <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
            </GlassCard>

            {searchTerm.trim() ? (
                <GlassCard>
                    <h3 className="font-amiri text-xl text-center mb-4 text-white">نتائج البحث</h3>
                     <div className="space-y-3">
                        {filteredResults.length > 0 ? (
                            filteredResults.map((faq, i) => (
                                <FAQItem key={`search-${i}`} q={faq.q} a={faq.a} feedback={helpfulFeedback[faq.q] || null} onFeedback={(feedback) => handleFeedback(faq.q, feedback)} />
                            ))
                        ) : (
                            <p className="text-center text-white/80 py-4">لم يتم العثور على نتائج لبحثك.</p>
                        )}
                    </div>
                </GlassCard>
            ) : (
                faqCategories.map(category => (
                    <GlassCard key={category.category}>
                        <h3 className="font-amiri text-xl text-center mb-4 text-white flex items-center justify-center gap-2"><span className="text-2xl">{category.icon}</span> {category.category}</h3>
                        <div className="space-y-3">
                            {category.faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} feedback={helpfulFeedback[faq.q] || null} onFeedback={(feedback) => handleFeedback(faq.q, feedback)} />)}
                        </div>
                    </GlassCard>
                ))
            )}
            
            <GlassCard className="text-white space-y-4 text-center">
                <div className="text-5xl">📧</div>
                <h3 className="font-amiri text-2xl">بحاجة للمزيد من المساعدة؟</h3>
                <p>إذا لم تجد إجابة لسؤالك، أو كان لديك اقتراح لتطوير التطبيق، لا تتردد في التواصل معنا.</p>
                <div className="p-4 bg-black/20 rounded-lg">
                    <a href="mailto:support@tech-bokra.com" className="font-bold text-xl text-yellow-300 tracking-wider hover:text-yellow-200 transition-colors">تواصل معنا</a>
                </div>
            </GlassCard>
        </div>
    );
}

export default SupportPage;
