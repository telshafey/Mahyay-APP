import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import NotificationToast from '../components/NotificationToast';

const UserAppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen">
            <NotificationToast />
            <Header />
            <main className="pt-[60px] pb-[60px] md:pb-[65px]">
                <div className="p-4">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
};

export default UserAppLayout;
