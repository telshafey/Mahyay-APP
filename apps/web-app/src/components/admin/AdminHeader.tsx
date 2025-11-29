import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext, useAppContext } from '@mahyay/core';

const AdminHeader: React.FC = () => {
    const { profile, signOut } = useAuthContext();
    const { hijriDate } = useAppContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setDropdownOpen(false);
        navigate('/login');
    };

    const handleSwitchToUserView = () => {
        setDropdownOpen(false);
        navigate('/');
    };
    
    const gregorianDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-l from-[#1e4d3b] to-[#2d5a47] text-white shadow-lg h-[60px] px-3 flex items-center justify-between border-b border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 w-1/3">
                 <div ref={dropdownRef} className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-center" aria-label="القائمة الشخصية">
                       {profile && <img src={profile.picture} alt={profile.name || 'Admin'} className="w-9 h-9 rounded-full border-2 border-white/50 object-cover" />}
                    </button>
                    {dropdownOpen && (
                        <div className="absolute top-full mt-2 w-64 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/20 overflow-hidden text-gray-800 animate-fade-in">
                           <div className="p-4 border-b border-gray-200">
                             <p className="font-bold">{profile?.name}</p>
                             <p className="text-sm text-gray-500">مدير النظام</p>
                           </div>

                           <button onClick={handleSwitchToUserView} className="w-full text-right flex items-center gap-3 px-4 py-3 font-semibold hover:bg-green-100/50 transition-colors">
                               <span>👤</span>
                               <span>عرض كتطبيق مستخدم</span>
                           </button>
                           
                           <div className="border-t border-gray-200 mt-1 pt-1">
                             <button onClick={handleSignOut} className="w-full text-right flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-100/50 transition-colors">
                                 <span>🚪</span>
                                 <span>تسجيل الخروج</span>
                            </button>
                           </div>
                        </div>
                    )}
                 </div>
            </div>

            <div className="flex flex-col items-center w-1/3">
                <h1 className="font-amiri text-lg md:text-xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent whitespace-nowrap">
                    لوحة التحكم
                </h1>
            </div>
            
            <div className="flex items-center justify-end w-1/3 text-right">
                <p className="font-semibold text-xs md:text-sm text-white whitespace-nowrap">
                    {gregorianDate} | <span className="text-[#d4af37] font-amiri">{hijriDate}</span>
                </p>
            </div>
        </header>
    );
};

export default AdminHeader;