import React from 'react';
import { useAppContext } from '@mahyay/core';
import StatCard from '../../components/more/StatCard';
import WeeklyPrayerChart from '../../components/more/WeeklyPrayerChart';
import KhatmaProgressChart from '../../components/more/KhatmaProgressChart';

const StatsPage: React.FC = () => {
    const { stats } = useAppContext();

    const statItems = [
        { label: "نقاط الإنجاز", value: stats.totalPoints, icon: "🌟", color: "bg-yellow-500" },
        { label: "أيام متتالية", value: stats.streak, icon: "🔥", color: "bg-orange-500" },
        { label: "صلوات هذا الشهر", value: stats.monthlyPrayers, icon: "🗓️", color: "bg-teal-500" },
        { label: "مجموعات الأذكار المكتملة", value: stats.completedAzkar, icon: "📿", color: "bg-purple-500" },
    ];

    return (
        <div className="space-y-10">
            <section id="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WeeklyPrayerChart />
                    <KhatmaProgressChart />
                    {statItems.map(item => (
                        <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} colorClass={item.color} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default StatsPage;
