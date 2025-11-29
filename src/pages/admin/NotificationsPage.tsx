import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';

const NotificationsPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'فشل إرسال الإشعار.');
            }
            
            setMessage(data.message);
            setTitle('');
            setBody('');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع.';
            setMessage(`خطأ: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">🔔 إدارة الإشعارات</h2>
            
            <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-4 text-white">
                    <div>
                        <label className="block text-sm font-semibold mb-1">عنوان الإشعار</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: تذكير مهم" className="w-full bg-black/30 p-2 rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">محتوى الرسالة</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="اكتب رسالتك هنا..." className="w-full bg-black/30 p-2 rounded" rows={4} required />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50">
                        {isLoading ? 'جاري الإرسال...' : 'إرسال إشعار للجميع'}
                    </button>
                    {message && (
                        <p className={`p-3 rounded-lg text-center text-sm ${message.includes('خطأ') ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </GlassCard>
        </div>
    );
};

export default NotificationsPage;
