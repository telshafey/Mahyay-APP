import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import FAQItem from '../../components/more/FAQItem';
import { useAppContext } from '../../contexts/AppContext';

const SupportPage: React.FC = () => {
    const { faqs } = useAppContext();
    const [feedback, setFeedback] = useState<Record<string, 'yes' | 'no' | null>>({});

    const handleFeedback = (faqId: string, response: 'yes' | 'no') => {
        setFeedback(prev => ({ ...prev, [faqId]: response }));
    };

    return (
        <div className="space-y-6">
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-2 text-center">الأسئلة الشائعة</h3>
                <p className="text-center text-white/80 mb-6">تجد هنا إجابات للأسئلة الأكثر شيوعًا حول التطبيق.</p>
                <div className="space-y-4">
                    {faqs.map((faq) => (
                        <FAQItem 
                            key={faq.id} 
                            q={faq.q} 
                            a={faq.a} 
                            feedback={feedback[faq.id] || null}
                            onFeedback={(response) => handleFeedback(faq.id, response)}
                        />
                    ))}
                </div>
            </GlassCard>
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4 text-center">تحتاج مساعدة إضافية؟</h3>
                <div className="text-center">
                    <p className="text-white/90">إذا لم تجد إجابة لسؤالك، فلا تتردد في التواصل معنا مباشرة.</p>
                    <a href="mailto:support@tech-bokra.com" className="mt-4 inline-block bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-6 rounded-lg transition-colors">
                        📧 تواصل مع الدعم
                    </a>
                </div>
            </GlassCard>
        </div>
    );
};

export default SupportPage;