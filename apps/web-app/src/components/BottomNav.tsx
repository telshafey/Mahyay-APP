import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: '🏠', label: 'الرئيسية' },
        { path: '/prayers', icon: '🕌', label: 'الصلوات' },
        { path: '/azkar', icon: '📿', label: 'الأذكار' },
        { path: '/quran', icon: '📖', label: 'القرآن' },
        { path: '/more', icon: '☰', label: 'المزيد' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-lg border-t border-white/10 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] h-[60px] md:h-[65px] flex justify-around items-center p-1 md:p-2 gap-1 md:gap-2">
            {navItems.map(item => {
                // Custom check for "More" tab to keep it active on sub-routes
                const isMorePath = item.path === '/more';
                const isCurrentlyActive = isMorePath 
                    ? location.pathname.startsWith('/more') || location.pathname === '/challenges' || location.pathname === '/community'
                    : location.pathname === item.path;
                
                const navLinkClass = `flex flex-col items-center justify-center gap-1 w-full h-full rounded-lg transition-all duration-200 ${
                    isCurrentlyActive ? 'bg-green-700 text-yellow-300' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`;

                return (
                    <NavLink 
                        key={item.path} 
                        to={item.path}
                        end={!isMorePath}
                        className={navLinkClass}
                        aria-label={item.label}
                    >
                        <span className="text-xl md:text-2xl">{item.icon}</span>
                        <span className="text-[10px] md:text-xs font-semibold">{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default BottomNav;
