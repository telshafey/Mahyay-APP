
import React from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import AdminBottomNav from '../components/admin/AdminBottomNav';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
            <AdminHeader />
            <main className="pt-[60px] pb-[65px]">
                <div className="p-4 md:p-6">
                    {children}
                </div>
            </main>
            <AdminBottomNav />
        </div>
    );
};

export default AdminLayout;
