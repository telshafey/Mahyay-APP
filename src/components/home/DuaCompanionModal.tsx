import React, { useState } from 'react';
import { PersonalizedDua } from '../../types';
import { getPersonalizedDua } from '../../services/geminiService';
import Modal from '../ui/Modal';

const DuaCompanionModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const [request, setRequest] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PersonalizedDua | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const response = await getPersonalizedDua(request);

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
        if(result?.dua) {
            navigator.clipboard.writeText(result.dua);
            alert('تم نسخ الدعاء!');
        }
    }

    return (
        <Modal title="✨ رفيق الدعاء" onClose={onClose}>
            {!result && !isLoading && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label htmlFor="dua-request" className="block text-white/90 text-center">
                        اكتب ما في قلبك أو ما تحتاج للدعاء به (مثال: لدي اختبار غداً وأشعر بالقلق)
                    </label>
                    <textarea
                        id="dua-request"
                        value={request}
                        onChange={(e) => setRequest(e.target.value)}
                        rows={3}
                        placeholder="اكتب هنا..."
                        className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <button 
                        type="submit" 
                        disabled={!request.trim()}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        صياغة الدعاء
                    </button>
                </form>
            )}

            {isLoading && (
                <div className="text-center p-8 space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                    <p className="text-white font-semibold">لحظات من فضلك، جاري صياغة الدعاء...</p>
                </div>
            )}
            
            {error && (
                <div className="p-4 bg-red-900/50 rounded-lg text-center text-red-300">
                    <p>{error}</p>
                     <button onClick={() => { setError(null); setIsLoading(false); setResult(null); }} className="mt-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                        حاول مجدداً
                    </button>
                </div>
            )}

            {result && (
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-black/30 rounded-lg border-r-4 border-yellow-400">
                         <p className="font-amiri text-xl md:text-2xl leading-relaxed text-white text-center">"{result.dua}"</p>
                    </div>
                    <div className="text-center text-sm text-yellow-300 font-semibold">{result.source_info}</div>
                    <div className="flex gap-4">
                         <button onClick={handleCopy} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg">نسخ الدعاء</button>
                         <button onClick={() => { setResult(null); setRequest(''); }} className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg">طلب دعاء آخر</button>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default DuaCompanionModal;
