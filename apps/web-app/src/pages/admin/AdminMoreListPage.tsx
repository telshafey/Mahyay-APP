import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';
import { useAuthContext } from '@mahyay/core';

const MoreListItem: React.FC<{ to: string; icon: string; title: string; }> = ({ to, icon, title }) => (
    <Link to={to}>
        <GlassCard className="!p-4 hover:!bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
                <span className="text-3xl">{icon}</span>
                <span className="text-lg font-semibold text-white">{title}</span>
            </div>
        </GlassCard>
    </Link>
);

const AdminMoreListPage: React.FC = () => {
    const { profile, signOut } = useAuthContext();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        { to: '/admin/settings', icon: '🔧', title: 'الإعدادات العامة' },
        { to: '/admin/occasions', icon: '🗓️', title: 'المناسبات' },
        { to: '/admin/prayer-locations', icon: '🌍', title: 'إدارة المواقيت' },
        { to: '/admin/prayers', icon: '🕌', title: 'الصلوات' },
        { to: '/admin/azkar', icon: '📿', title: 'الأذكار' },
        { to: '/admin/quran', icon: '📖', title: 'القرآن' },
        { to: '/admin/faq', icon: '🆘', title: 'الأسئلة الشائعة' },
        { to: '/admin/prayer-methods', icon: '⚙️', title: 'طرق الحساب' },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">☰ المزيد</h2>
            
            {profile && (
                 <GlassCard>
                    <div className="flex items-center gap-4 p-2">
                        <img src={profile.picture} alt={profile.name || ''} className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                        <div>
                            <p className="font-bold text-white text-xl">{profile.name}</p>
                            <p className="text-sm text-white/70">مدير النظام</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            <div className="space-y-4">
                {menuItems.map(item => (
                    <MoreListItem key={item.to} to={item.to} icon={item.icon} title={item.title} />
                ))}
            </div>

            <div className="space-y-4">
                 <button onClick={() => navigate('/')} className="w-full text-lg text-center flex items-center justify-center gap-3 px-4 py-3 font-semibold bg-white/10 hover:bg-white/20 transition-colors rounded-lg">
                    👤 عرض تطبيق المستخدم
                </button>
                <button onClick={handleSignOut} className="w-full text-lg text-center flex items-center justify-center gap-3 px-4 py-3 font-semibold text-red-300 bg-red-900/20 hover:bg-red-900/40 transition-colors rounded-lg">
                    🚪 تسجيل الخروج
                </button>
            </div>
        </div>
    );
};

export default AdminMoreListPage;