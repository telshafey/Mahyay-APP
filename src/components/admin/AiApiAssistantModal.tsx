import React, { useState } from 'react';
import { ApiSuggestion } from '../../types';
import { getApiSuggestion } from '../../services/geminiService';
import Modal from '../ui/Modal';
import FormField from './FormField';

interface AiApiAssistantModalProps {
    onClose: () => void;
    onSelectUrl?: (url: string) => void;
    initialPrompt?: string;
}

const AiApiAssistantModal: React.FC<AiApiAssistantModalProps> = ({ onClose, onSelectUrl, initialPrompt }) => {
    const [prompt, setPrompt] = useState(initialPrompt || 'API مجاني لمواقيت الصلاة');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ApiSuggestion | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const response = await getApiSuggestion(prompt);

        if (response.data) {
            setResult(response.data);
        } else {
            setError(response.error || 'عذراً، لم نتمكن من العثور على اقتراح. يرجى المحاولة مرة أخرى بطلب مختلف.');
        }
        setIsLoading(false);
    };

    const handleUseUrl = () => {
        if (result?.suggested_url && onSelectUrl) {
            onSelectUrl(result.suggested_url);
        }
    };

    return (
        <Modal title="✨ مساعد API الذكي" onClose={onClose}>
            <div className="space-y-4">
                <form onSubmit={handleSubmit}>
                    <FormField 
                        label="اكتب ما تبحث عنه"
                        name="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="مثال: API لمواقيت الصلاة في الرياض"
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !prompt.trim()}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'جاري البحث...' : 'ابحث عن API'}
                    </button>
                </form>

                {isLoading && (
                    <div className="text-center p-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
                        <p className="text-white font-semibold mt-3">يقوم الذكاء الاصطناعي بالبحث الآن...</p>
                    </div>
                )}
                
                {error && (
                    <div className="p-3 bg-red-900/50 rounded-lg text-center text-red-300">
                        <p>{error}</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-3 pt-4 border-t border-white/20 animate-fade-in">
                        <h4 className="font-bold text-yellow-300">الاقتراح:</h4>
                        <div className="p-3 bg-black/30 rounded-lg">
                            <p className="font-mono text-sm text-teal-300 break-all">{result.suggested_url}</p>
                        </div>
                        <div className="p-3 bg-black/20 rounded-lg">
                            <p className="text-sm text-white/90">{result.description}</p>
                        </div>
                        {onSelectUrl && (
                             <button 
                                onClick={handleUseUrl} 
                                className="w-full bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg"
                            >
                                استخدام هذا الرابط
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AiApiAssistantModal;