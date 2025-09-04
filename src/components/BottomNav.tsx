import React from 'react';
// Fix: Corrected import statement for react-router-dom.
import { NavLink } from 'react-router-dom';

const BottomNav: React.FC = () => {
    
    const navItems = [
        { path: '/', icon: '🏠', label: 'الرئيسية' },
        { path: '/prayers', icon: '🕌', label: 'الصلوات' },
        { path: '/azkar', icon: '📿', label: 'الأذكار' },
        { path: '/quran', icon: '📖', label: 'القرآن' },
    ];
    
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/80 backdrop-blur-lg border-t border-white/10 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] h-[60px] md:h-[65px] flex justify-around items-center pb-safe">
            {navItems.map(item => (
                <NavLink 
                    key={item.path} 
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => 
                        `flex flex-col items-center justify-center gap-1 text-gray-300 w-full h-full transition-all duration-300 ${isActive ? 'text-white font-bold' : 'hover:text-white'}`
                    }
                    aria-label={item.label}
                >
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <span className="text-[10px] md:text-xs">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;