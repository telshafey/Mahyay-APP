import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const adminNavItems = [
    { path: '/admin/dashboard', label: 'لوحة المعلومات', icon: '📊' },
    { path: '/admin/challenges', label: 'إدارة التحديات', icon: '🏆' },
    { path: '/admin/occasions', label: 'إدارة المناسبات', icon: '🗓️' },
    { path: '/admin/prayer-methods', label: 'إدارة طرق الحساب', icon: '⚙️' },
    { path: '/admin/prayers', label: 'إدارة الصلوات', icon: '🕌' },
    { path: '/admin/azkar', label: 'إدارة الأذكار', icon: '📿' },
    { path: '/admin/quran', label: 'إدارة القرآن', icon: '📖' },
    { path: '/admin/support', label: 'إدارة الدعم', icon: '🆘' },
    { path: '/admin/users', label: 'إدارة المستخدمين', icon: '👥' },
    { path: '/admin/notifications', label: 'الإشعارات', icon: '🔔' },
    { path: '/admin/settings', label: 'الإعدادات العامة', icon: '🔧' },
];

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { profile, toggleViewMode } = useAuthContext();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <aside className="w-72 bg-gray-800 p-4 flex flex-col">
                <div className="text-center mb-8">
                    <h1 className="font-amiri text-3xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
                        مَحيّاي
                    </h1>
                    <p className="text-sm text-yellow-300">لوحة التحكم</p>
                </div>
                <nav className="flex-grow space-y-2">
                    {adminNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-lg ${
                                    isActive ? 'bg-yellow-500 text-green-900 font-bold' : 'hover:bg-white/10'
                                }`
                            }
                        >
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-white/10 pt-4 space-y-3">
                     <button onClick={toggleViewMode} className="flex items-center justify-center gap-2 text-sm text-center w-full py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 transition-colors">
                        <span>👤</span>
                        <span>عرض كتطبيق مستخدم</span>
                    </button>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                        <img src={profile?.picture} alt={profile?.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                            <p className="font-bold text-white">{profile?.name}</p>
                            <p className="text-xs text-white/70">{profile?.email}</p>
                        </div>
                    </div>
                </div>
            </aside>
            <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-900">
                {children ? children : <Outlet />}
            </main>
        </div>
    );
};

export default AdminLayout;
