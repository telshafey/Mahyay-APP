import React, { useEffect, useState } from 'react';
import { useAppContext } from '@mahyay/core';

const NotificationToast: React.FC = () => {
    const { notification } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 4500); // Start fade-out before it's removed from context

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [notification]);

    if (!notification) {
        return null;
    }

    return (
        <div 
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}
        >
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-full shadow-lg p-2 flex items-center gap-3 pr-5">
                <span className="text-2xl">{notification.icon}</span>
                <p className="text-white font-semibold">{notification.message}</p>
            </div>
        </div>
    );
};

export default NotificationToast;
