import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { profile, toggleViewMode } = useAuthContext();
    const navigate = useNavigate();

    const handleToggleView = () => {
        toggleViewMode();
        navigate('/');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: '📊', label: 'لوحة المعلومات' },
        { path: '/admin/users', icon: '👥', label: 'المستخدمين' },
        { path: '/admin/notifications', icon: '🔔', label: 'الإشعارات' },
        { path: '/admin/settings', icon: '🔧', label: 'الإعدادات العامة' },
        { path: '/admin/challenges', icon: '🏆', label: 'التحديات' },
        { path: '/admin/occasions', icon: '🗓️', label: 'المناسبات' },
        { path: '/admin/prayer-methods', icon: '⚙️', label: 'طرق الحساب' },
        { path: '/admin/prayers', icon: '🕌', label: 'الصلوات' },
        { path: '/admin/azkar', icon: '📿', label: 'الأذكار' },
        { path: '/admin/quran', icon: '📖', label: 'القرآن' },
        { path: '/admin/faq', icon: '🆘', label: 'الأسئلة الشائعة' },
    ];

    return (
        <div className="min-h-screen flex text-white bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47]">
            <aside className="w-64 bg-black/20 p-4 flex flex-col border-l border-white/10">
                <div className="text-center mb-8">
                    <h1 className="font-amiri text-3xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
                        مَحيّاي
                    </h1>
                    <p className="text-sm text-yellow-300 font-semibold">لوحة التحكم</p>
                </div>
                <nav className="flex-grow space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                    isActive ? 'bg-yellow-500/80 text-green-900 font-bold' : 'hover:bg-white/10'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-4">
                     <button onClick={handleToggleView} className="w-full text-center flex items-center justify-center gap-3 px-4 py-3 font-bold bg-white/10 hover:bg-white/20 transition-colors rounded-lg">
                        👤 عرض كتطبيق مستخدم
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;