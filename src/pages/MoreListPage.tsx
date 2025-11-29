
import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { useAppContext } from '../contexts/AppContext';

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

const MoreListPage: React.FC = () => {
    const { featureToggles } = useAppContext();

    const menuItems = [
        { to: '/challenges', icon: '🏆', title: 'التحديات الإيمانية', feature: 'challenges' },
        { to: '/more/stats', icon: '📊', title: 'الإحصائيات' },
        { to: '/more/goals', icon: '🎯', title: 'أهدافي الشخصية' },
        { to: '/community', icon: '🤝', title: 'المجتمع', feature: 'community' },
        { to: '/more/settings', icon: '⚙️', title: 'الإعدادات' },
        { to: '/more/support', icon: '🆘', title: 'الدعم والأسئلة الشائعة' },
        { to: '/more/about', icon: 'ℹ️', title: 'عن التطبيق' },
    ];

    const visibleItems = menuItems.filter(item => {
        if (item.feature) {
            return featureToggles[item.feature as keyof typeof featureToggles] ?? true;
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">☰ المزيد</h2>
            <div className="space-y-4">
                {visibleItems.map(item => (
                    <MoreListItem key={item.to} to={item.to} icon={item.icon} title={item.title} />
                ))}
            </div>
        </div>
    );
};

export default MoreListPage;
