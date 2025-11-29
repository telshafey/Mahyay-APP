import React, { useState, useEffect } from 'react';
import GlassCard from '../../components/GlassCard';

interface NotificationRecord {
    id: number;
    title: string;
    body: string;
    status: 'sent' | 'scheduled';
    timestamp: string; // ISO string for scheduled time or sent time
}

const NotificationsPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

    // Effect to simulate checking for scheduled notifications to send
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            setNotifications(prev => {
                let changed = false;
                const updated = prev.map(notif => {
                    if (notif.status === 'scheduled' && new Date(notif.timestamp) <= now) {
                        changed = true;
                        // In a real app, you would trigger the push notification send here
                        console.log(`[SIMULATING PUSH] Sending scheduled notification: "${notif.title}"`);
                        return { ...notif, status: 'sent', timestamp: new Date().toISOString() };
                    }
                    return notif;
                });
                // Sort by timestamp descending after update
                return changed ? updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : prev;
            });
        }, 1000); // Check every second

        return () => clearInterval(interval);
    }, []);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const newNotification: NotificationRecord = {
                id: Date.now(),
                title,
                body,
                status: scheduleTime ? 'scheduled' : 'sent',
                timestamp: scheduleTime ? new Date(scheduleTime).toISOString() : new Date().toISOString(),
            };

            setNotifications(prev => [newNotification, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

            if (scheduleTime) {
                setStatusMessage({ type: 'success', message: 'تم جدولة الإشعار بنجاح!' });
            } else {
                 // In this mock, we just confirm it was "sent"
                setStatusMessage({ type: 'success', message: 'تم استلام طلب الإرسال الفوري بنجاح.' });
            }

            setTitle('');
            setBody('');
            setScheduleTime('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred.';
            setStatusMessage({ type: 'error', message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">🔔 إرسال الإشعارات</h2>
            
            <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold mb-2 text-white/90">
                            عنوان الإشعار
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: تذكير بصيام يوم عاشوراء"
                            className="w-full text-lg bg-black/30 rounded-lg py-2 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/60"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-semibold mb-2 text-white/90">
                            محتوى الإشعار
                        </label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={3}
                            placeholder="اكتب رسالتك هنا..."
                            className="w-full text-lg bg-black/30 rounded-lg py-2 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/60"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="scheduleTime" className="block text-sm font-semibold mb-2 text-white/90">
                            وقت الإرسال (اختياري)
                        </label>
                        <input
                            id="scheduleTime"
                            type="datetime-local"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                            className="w-full text-lg bg-black/30 rounded-lg py-2 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                        />
                        <p className="text-xs text-white/70 mt-1">اتركه فارغًا للإرسال الفوري.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !title.trim() || !body.trim()}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 flex justify-center items-center"
                    >
                        {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div> : (scheduleTime ? 'جدولة الإشعار' : 'إرسال الآن')}
                    </button>

                    {statusMessage && (
                        <div className={`p-3 rounded-lg text-center text-sm font-semibold ${statusMessage.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {statusMessage.message}
                        </div>
                    )}
                </form>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">سجل الإشعارات</h3>
                {notifications.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {notifications.map(notif => (
                            <div key={notif.id} className="p-3 bg-black/20 rounded-lg border-r-4 border-white/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-white">{notif.title}</p>
                                        <p className="text-sm text-white/80 mt-1">{notif.body}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap ${
                                        notif.status === 'sent' 
                                        ? 'bg-green-500/30 text-green-300' 
                                        : 'bg-yellow-500/30 text-yellow-300'
                                    }`}>
                                        {notif.status === 'sent' ? 'أُرْسِلَ' : 'مجدول'}
                                    </span>
                                </div>
                                <p className="text-xs text-white/60 mt-2 text-left">
                                    {notif.status === 'sent' ? 'أُرْسِلَ في: ' : 'مجدول لـ: '} 
                                    {new Date(notif.timestamp).toLocaleString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/70 py-4">لا توجد إشعارات في السجل بعد.</p>
                )}
            </GlassCard>
        </div>
    );
};

export default NotificationsPage;