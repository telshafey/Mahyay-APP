


import React from 'react';
// Fix: Corrected react-router-dom import to use namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';

const BottomNav: React.FC = () => {
    
    const navItems = [
        { path: '/', icon: '🏠', label: 'الرئيسية' },
        { path: '/prayers', icon: '🕌', label: 'الصلوات' },
        { path: '/azkar', icon: '📿', label: 'الأذكار' },
        { path: '/quran', icon: '📖', label: 'القرآن' },
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] h-[60px] md:h-[65px] flex justify-around items-center pb-safe">
            {navItems.map(item => (
                <ReactRouterDOM.NavLink 
                    key={item.path} 
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center gap-1 text-gray-500 w-full h-full transition-all duration-300 ${isActive ? 'text-[#2d5a47] font-bold' : 'hover:text-[#1e4d3b]'}`
                    }
                >
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <span className="text-[10px] md:text-xs">{item.label}</span>
                </ReactRouterDOM.NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;