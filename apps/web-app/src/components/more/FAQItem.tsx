import React from 'react';
import Accordion from '../ui/Accordion';

const FAQItem: React.FC<{
    q: string;
    a: string;
    feedback: 'yes' | 'no' | null;
    onFeedback: (feedback: 'yes' | 'no') => void;
}> = ({ q, a, feedback, onFeedback }) => {
    return (
        <Accordion
            title={<span className="font-semibold">{q}</span>}
            contentClassName="p-4 pt-0 text-white/90 border-t border-white/10"
        >
            <p className="leading-relaxed">{a}</p>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-4">
                {feedback === null ? (
                    <>
                        <span className="text-sm font-semibold">هل كانت هذه الإجابة مفيدة؟</span>
                        <button onClick={() => onFeedback('yes')} className="px-3 py-1 text-xs rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300">نعم</button>
                        <button onClick={() => onFeedback('no')} className="px-3 py-1 text-xs rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300">لا</button>
                    </>
                ) : (
                    <p className="text-sm font-semibold text-yellow-300">شكراً لتقييمك!</p>
                )}
            </div>
        </Accordion>
    );
};

export default FAQItem;