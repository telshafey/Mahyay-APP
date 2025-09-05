import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';

const AdminPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage(null);

        if (!title.trim() || !body.trim()) {
            setResponseMessage({ type: 'error', message: 'العنوان والمحتوى مطلوبان.' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/send-push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, body }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل إرسال الإشعار.');
            }

            setResponseMessage({ type: 'success', message: data.message || 'تم إرسال الإشعارات بنجاح!' });
            setTitle('');
            setBody('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'حدث خطأ غير متوقع.';
            setResponseMessage({ type: 'error', message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-3xl font-bold text-center font-amiri">👑 لوحة تحكم الأدمن</h2>
            
            <GlassCard>
                <h3 className="text-xl font-bold mb-4 text-center">إرسال إشعار فوري (Push Notification)</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="push-title" className="block text-sm font-semibold mb-1">
                            عنوان الإشعار
                        </label>
                        <input
                            id="push-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: موعظة اليوم"
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="push-body" className="block text-sm font-semibold mb-1">
                            محتوى الإشعار
                        </label>
                        <textarea
                            id="push-body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={3}
                            placeholder="اكتب رسالتك هنا..."
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div> : '🚀 إرسال للجميع'}
                    </button>

                    {responseMessage && (
                        <div className={`p-3 rounded-lg text-center font-semibold ${responseMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {responseMessage.message}
                        </div>
                    )}
                </form>
            </GlassCard>
        </div>
    );
};

export default AdminPage;
