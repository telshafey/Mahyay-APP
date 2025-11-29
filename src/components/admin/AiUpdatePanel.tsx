import React, { useState } from 'react';
import { AiUpdate } from '../../types';
import GlassCard from '../GlassCard';
import AiUpdateReviewModal from './AiUpdateReviewModal';

interface AiUpdatePanelProps<T> {
    title: string;
    fetcher: () => Promise<{ data: AiUpdate<T>[] | null; error: string | null; }>;
    onApply: (updates: AiUpdate<T>[]) => void;
}

const AiUpdatePanel = <T extends {}>({ title, fetcher, onApply }: AiUpdatePanelProps<T>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updates, setUpdates] = useState<AiUpdate<T>[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleFetchUpdates = async () => {
        setIsLoading(true);
        setError(null);
        setUpdates(null);
        const result = await fetcher();
        if (result.error) {
            setError(result.error);
        } else if (result.data && result.data.length > 0) {
            setUpdates(result.data);
        } else {
            // No updates found, which is a valid success case.
            setUpdates([]); 
        }
        setIsLoading(false);
    };

    const handleApply = () => {
        if (updates) {
            onApply(updates);
            setUpdates(null);
        }
        setIsModalOpen(false);
    };
    
    return (
        <GlassCard>
            <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
            <div className="text-center">
                {isLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                ) : error ? (
                    <div className="p-3 bg-red-900/50 rounded-lg text-red-300">
                        <p><strong>خطأ:</strong> {error}</p>
                    </div>
                ) : updates ? (
                    updates.length > 0 ? (
                        <div>
                            <p className="text-green-300 font-semibold">
                                🎉 تم العثور على {updates.length} اقتراح(اقتراحات) جديدة.
                            </p>
                            <button onClick={() => setIsModalOpen(true)} className="mt-3 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg">
                                مراجعة الاقتراحات
                            </button>
                        </div>
                    ) : (
                         <p className="text-white/80">✅ لا توجد اقتراحات جديدة. المحتوى محدّث.</p>
                    )
                ) : (
                    <button onClick={handleFetchUpdates} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        البحث عن تحديثات
                    </button>
                )}
            </div>
            
            {isModalOpen && updates && (
                <AiUpdateReviewModal
                    updates={updates}
                    onClose={() => setIsModalOpen(false)}
                    onApply={handleApply}
                />
            )}
        </GlassCard>
    );
};

export default AiUpdatePanel;
