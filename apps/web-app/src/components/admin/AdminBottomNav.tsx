import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const AdminBottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'الرئيسية' },
        { path: '/admin/users', icon: '👥', label: 'المستخدمين' },
        { path: '/admin/challenges', icon: '🏆', label: 'التحديات' },
        { path: '/admin/notifications', icon: '🔔', label: 'الإشعارات' },
        { path: '/admin/more', icon: '☰', label: 'المزيد' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-lg border-t border-white/10 h-[65px] flex justify-around items-center p-1 gap-1">
            {navItems.map(item => {
                const isMorePath = item.path === '/admin/more';
                const isCurrentlyActive = isMorePath 
                    ? location.pathname.startsWith('/admin/more') || ['/admin/settings', '/admin/occasions', '/admin/prayers', '/admin/azkar', '/admin/quran', '/admin/faq', '/admin/prayer-methods'].includes(location.pathname)
                    : location.pathname === item.path;
                
                const navLinkClass = `flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-all duration-200 ${
                    isCurrentlyActive ? 'bg-yellow-500 text-green-900' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`;

                return (
                    <NavLink 
                        key={item.path} 
                        to={item.path}
                        end={!isMorePath}
                        className={navLinkClass}
                        aria-label={item.label}
                    >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-[10px] font-semibold">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default AdminBottomNav;