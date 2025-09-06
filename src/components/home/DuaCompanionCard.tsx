import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import { getPersonalizedDua } from '../../services/geminiService';
import { PersonalizedDua } from '../../types';

const DuaCompanionCard: React.FC = () => {
    const [request, setRequest] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PersonalizedDua | null>(null);
    const [error, setError] = useState<string | null>(null);

    const suggestions = ['للرزق والبركة', 'للشفاء والعافية', 'للهداية والصلاح', 'لتيسير الأمور'];

    const handleSubmit = async (prompt: string) => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const response = await getPersonalizedDua(prompt);

        if (response.data) {
            setResult(response.data);
        } else {
            const userFriendlyError = response.error || 'عذراً، لم نتمكن من صياغة الدعاء. يرجى المحاولة مرة أخرى بطلب مختلف.';
            setError(userFriendlyError);
            console.error("Dua Companion Error:", response.error);
        }
        setIsLoading(false);
    };

    const handleCopy = () => {
        if (result?.dua) {
            navigator.clipboard.writeText(result.dua)
                .then(() => alert('تم نسخ الدعاء!'))
                .catch(err => console.error('Failed to copy: ', err));
        }
    };

    const renderInitialState = () => (
        <div className="space-y-4">
            <p className="text-center text-sm text-white/90">اكتب ما في قلبك، أو اختر أحد الاقتراحات، ودع الذكاء الاصطناعي يساعدك في مناجاة ربك.</p>
            <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map(s => (
                    <button key={s} onClick={() => handleSubmit(s)} className="bg-black/20 hover:bg-black/40 text-white/80 text-xs font-semibold py-2 px-3 rounded-full transition-colors">
                        {s}
                    </button>
                ))}
            </div>
             <form onSubmit={(e) => { e.preventDefault(); handleSubmit(request); }} className="flex gap-2">
                <input
                    type="text"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="اكتب طلبك هنا..."
                    className="flex-grow bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button type="submit" disabled={!request.trim()} className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                    ادعُ
                </button>
            </form>
        </div>
    );

    const renderLoadingState = () => (
        <div className="text-center p-8 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="text-white font-semibold">لحظات من فضلك، جاري صياغة الدعاء...</p>
        </div>
    );

    const renderErrorState = () => (
        <div className="p-4 bg-red-900/50 rounded-lg text-center text-red-300 space-y-3 animate-fade-in">
            <p className="font-semibold">حدث خطأ</p>
            <p className="text-sm">{error}</p>
            <button onClick={() => { setError(null); setIsLoading(false); setResult(null); }} className="mt-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                حاول مجدداً
            </button>
        </div>
    );

    const renderResultState = () => (
        <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-black/30 rounded-lg border-r-4 border-yellow-400">
                <p className="font-amiri text-xl md:text-2xl leading-relaxed text-white text-center">"{result?.dua}"</p>
            </div>
            <div className="text-center text-sm text-yellow-300 font-semibold">{result?.source_info}</div>
            <div className="flex gap-4">
                <button onClick={handleCopy} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg">نسخ الدعاء</button>
                <button onClick={() => { setResult(null); setRequest(''); }} className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg">طلب دعاء آخر</button>
            </div>
        </div>
    );

    return (
        <GlassCard className="!bg-gradient-to-tr !from-teal-500/20 !to-cyan-500/30 !border-teal-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💖 رفيق الدعاء</h3>
            {isLoading ? renderLoadingState() : error ? renderErrorState() : result ? renderResultState() : renderInitialState()}
        </GlassCard>
    );
};

export default DuaCompanionCard;