import React from 'react';
import GlassCard from '../../components/GlassCard';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <GlassCard className={`!bg-opacity-25 ${colorClass}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-black/20 text-3xl`}>{icon}</div>
            <div>
                <p className="text-white font-semibold text-lg">{label}</p>
                <p className="text-white text-2xl font-bold">{value}</p>
            </div>
        </div>
    </GlassCard>
);


const DashboardPage: React.FC = () => {
    // Mock data for demonstration
    const stats = {
        totalUsers: 1,
        activeChallenges: 2,
        completedChallenges: 1,
        totalPrayers: 12,
        totalPagesRead: 35
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">📊 لوحة المعلومات</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="إجمالي المستخدمين" value={stats.totalUsers} icon="👥" colorClass="bg-blue-500" />
                <StatCard label="تحديات نشطة" value={stats.activeChallenges} icon="⏳" colorClass="bg-yellow-500" />
                <StatCard label="تحديات مكتملة" value={stats.completedChallenges} icon="✅" colorClass="bg-green-500" />
                <StatCard label="إجمالي الصلوات المسجلة" value={stats.totalPrayers} icon="🕌" colorClass="bg-teal-500" />
                <StatCard label="إجمالي الصفحات المقروءة" value={stats.totalPagesRead} icon="📖" colorClass="bg-sky-500" />
            </div>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">نظرة سريعة</h3>
                <p className="text-white/80">
                    مرحباً بك في لوحة تحكم تطبيق "مَحيّاي". من هنا يمكنك إدارة محتوى التطبيق، ومتابعة الإحصائيات العامة.
                    استخدم الشريط الجانبي للتنقل بين الأقسام المختلفة.
                </p>
            </GlassCard>
        </div>
    );
};

export default DashboardPage;