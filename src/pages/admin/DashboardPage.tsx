import React from 'react';
import AdminStatCard from '../../components/admin/AdminStatCard';
import EngagementChart from '../../components/admin/EngagementChart';
import PopularChallengesChart from '../../components/admin/PopularChallengesChart';

const DashboardPage: React.FC = () => {
    // Mock data for demonstration
    const engagementData = [
        { day: 'الأحد', value: 120 },
        { day: 'الاثنين', value: 150 },
        { day: 'الثلاثاء', value: 130 },
        { day: 'الأربعاء', value: 180 },
        { day: 'الخميس', value: 200 },
        { day: 'الجمعة', value: 250 },
        { day: 'السبت', value: 160 },
    ];
    
    const popularChallengesData = [
        { title: 'قراءة سورة الملك قبل النوم', value: 85 },
        { title: 'مداومة على صلاة الضحى', value: 72 },
        { title: 'المحافظة على أذكار الصباح', value: 65 },
        { title: 'قراءة سورة الكهف يوم الجمعة', value: 50 },
        { title: 'صدقة أسبوعية', value: 30 },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">📊 لوحة المعلومات</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard title="إجمالي المستخدمين" value="1,250" icon="👥" />
                <AdminStatCard title="المستخدمون النشطون يوميًا" value="850" icon="🔥" />
                <AdminStatCard title="مجموع الصلوات المسجلة" value="15,780" icon="🕌" />
                <AdminStatCard title="التحديات المكتملة" value="450" icon="🏆" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart title="مجموع الصلوات المسجلة (آخر 7 أيام)" data={engagementData} />
                <PopularChallengesChart title="التحديات الأكثر شيوعًا" data={popularChallengesData} />
            </div>
        </div>
    );
};

export default DashboardPage;
