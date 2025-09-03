import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';

const Header: React.FC = () => {
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    const renderUserAvatar = () => {
      if (authContext?.profile?.picture) {
        return <img src={authContext.profile.picture} alt={authContext.profile.name || 'User'} className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
      }

      const nameInitial = authContext?.profile?.name ? authContext.profile.name.charAt(0).toUpperCase() : '؟';

      return (
        <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-yellow-500 flex items-center justify-center text-xl font-bold text-white">
            {nameInitial}
        </div>
      )
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-l from-[#1e4d3b] to-[#2d5a47] text-white shadow-lg h-[70px] px-3 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 w-1/3">
                 <div ref={dropdownRef} className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-center">
                       {renderUserAvatar()}
                    </button>
                    {dropdownOpen && (
                        <div className="absolute top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden text-gray-800 animate-fade-in">
                           <div className="p-4 border-b border-gray-200">
                             <p className="font-bold">{authContext?.profile?.name}</p>
                           </div>
                           <NavLink to="/more/stats" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>📊</span><span>الإحصائيات والتحديات</span></NavLink>
                           <NavLink to="/more/about" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>ℹ️</span><span>عن التطبيق</span></NavLink>
                           <NavLink to="/more/support" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>🆘</span><span>الدعم والأسئلة</span></NavLink>
                           <NavLink to="/more/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>⚙️</span><span>الإعدادات</span></NavLink>
                        </div>
                    )}
                 </div>
                 <button
                    onClick={() => alert('سجل الإشعارات قيد التطوير وسيتوفر قريباً!')}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="الإشعارات"
                 >
                    <span className="text-xl">🔔</span>
                 </button>
            </div>

            <div className="flex flex-col items-center w-1/3">
                <h1 className="font-amiri text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">مَحيّاي</h1>
            </div>
            
            <div className="flex items-center justify-end w-1/3 text-right">
                <div>
                    <p className="font-amiri font-semibold text-sm md:text-base text-[#d4af37]">{appContext?.hijriDate}</p>
                    <p className="text-xs opacity-80">{appContext?.gregorianDate}</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
