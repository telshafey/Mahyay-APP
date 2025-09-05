import React, { useState, useEffect } from 'react';
import SettingsCard from './SettingsCard';
import { subscribeUser, getSubscription, unsubscribeUser } from '../../utils/pushNotifications';

const PushNotificationManager: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSubscription = async () => {
            const subscription = await getSubscription();
            setIsSubscribed(!!subscription);
            setIsLoading(false);
        };
        checkSubscription();
    }, []);

    const handleSubscription = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (isSubscribed) {
                await unsubscribeUser();
                setIsSubscribed(false);
            } else {
                await subscribeUser();
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Failed to handle subscription", err);
            if (err instanceof Error) {
                 if (Notification.permission === 'denied') {
                    setError('لقد قمت بحظر الإشعارات. يرجى تفعيلها من إعدادات المتصفح.');
                } else {
                    setError(err.message);
                }
            } else {
                setError("حدث خطأ غير متوقع.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingsCard title="الإشعارات الفورية (Push)" icon="🚀">
            <div className="text-center space-y-3">
                <p className="text-sm text-white/90">
                    {isSubscribed 
                        ? "أنت مشترك حاليًا في الإشعارات الفورية. ستصلك رسائل هامة من إدارة التطبيق."
                        : "اشترك لتصلك رسائل هامة ومواعظ مباشرة من إدارة التطبيق، حتى لو كنت خارج التطبيق."
                    }
                </p>
                <button
                    onClick={handleSubscription}
                    disabled={isLoading}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50
                        ${isSubscribed 
                            ? 'bg-red-800/80 hover:bg-red-800 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'}`
                    }
                >
                    {isLoading ? 'جاري المعالجة...' : (isSubscribed ? 'إلغاء الاشتراك' : 'تفعيل الإشعارات')}
                </button>
                {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
            </div>
        </SettingsCard>
    );
};

export default PushNotificationManager;
