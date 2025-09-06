import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { useAuthContext } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const appContext = useAppContext();
    const authContext = useAuthContext();
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
    
    const { profile } = authContext;

    const renderUserAvatar = () => {
      if (profile?.picture) {
        return <img src={profile.picture} alt={profile.name || 'User'} className="w-9 h-9 rounded-full border-2 border-white/50 object-cover" />
      }

      const nameInitial = profile?.name ? profile.name.charAt(0).toUpperCase() : '؟';

      return (
        <div className="w-9 h-9 rounded-full border-2 border-white/50 bg-yellow-500 flex items-center justify-center text-lg font-bold text-white">
            {nameInitial}
        </div>
      )
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-l from-[#1e4d3b] to-[#2d5a47] text-white shadow-lg h-[60px] px-3 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 w-1/3">
                 <div ref={dropdownRef} className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-center">
                       {renderUserAvatar()}
                    </button>
                    {dropdownOpen && (
                        <div className="absolute top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden text-gray-800 animate-fade-in">
                           <div className="p-4 border-b border-gray-200">
                             <p className="font-bold">{profile?.name}</p>
                           </div>
                           {profile?.role === 'admin' && (
                               <NavLink to="/admin" className="flex items-center gap-3 px-4 py-3 font-bold bg-yellow-100/50 hover:bg-yellow-200/50 transition-colors" onClick={() => setDropdownOpen(false)}>
                                   <span>👑</span><span>لوحة التحكم</span>
                               </NavLink>
                           )}
                           <NavLink to="/more/goals" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>🎯</span><span>أهدافي الشخصية</span></NavLink>
                           <NavLink to="/more/stats" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>📊</span><span>الإحصائيات</span></NavLink>
                           <NavLink to="/more/about" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>ℹ️</span><span>عن التطبيق</span></NavLink>
                           <NavLink to="/more/support" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>🆘</span><span>الدعم والأسئلة</span></NavLink>
                           <NavLink to="/more/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>⚙️</span><span>الإعدادات</span></NavLink>
                           <div className="border-t border-gray-200 mt-1 pt-1">
                             <NavLink to="/more/privacy" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>🔒</span><span>سياسة الخصوصية</span></NavLink>
                             <NavLink to="/more/terms" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-green-100/50 transition-colors" onClick={() => setDropdownOpen(false)}><span>📜</span><span>شروط الاستخدام</span></NavLink>
                           </div>
                        </div>
                    )}
                 </div>
                 <button
                    onClick={() => alert('سجل الإشعارات قيد التطوير وسيتوفر قريباً!')}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="الإشعارات"
                 >
                    <span className="text-xl">🔔</span>
                 </button>
            </div>

            <div className="flex flex-col items-center w-1/3">
                <h1 className="font-amiri text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">مَحيّاي</h1>
            </div>
            
            <div className="flex items-center justify-end w-1/3 text-right">
                {/* Desktop View */}
                <div className="hidden md:block">
                     <p className="font-semibold text-sm text-white whitespace-nowrap">
                        <span className="text-[#d4af37] font-amiri">{appContext.hijriDate}</span>
                    </p>
                </div>
                {/* Mobile View */}
                <div className="md:hidden">
                     <p className="font-semibold text-xs text-white/90 whitespace-nowrap">
                        <span className="text-yellow-300">{appContext.shortHijriDate} هـ</span>
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;