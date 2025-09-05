import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { CHALLENGES } from '../../constants';
import GlassCard from '../../components/GlassCard';
import ChallengeCard from '../../components/ChallengeCard';
import StatCard from '../../components/more/StatCard';
import WeeklyPrayerChart from '../../components/more/WeeklyPrayerChart';
import KhatmaProgressChart from '../../components/more/KhatmaProgressChart';

const StatsAndChallengesPage: React.FC = () => {
    const { stats } = useAppContext();
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');
    const challengesSectionRef = useRef<HTMLElement>(null);
    const { page } = useParams<{ page: string }>();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 'challenges' && challengesSectionRef.current) {
                challengesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
        
        return () => clearTimeout(timer);
    }, [page]);

    const filteredChallenges = CHALLENGES.filter(c => c.status === activeTab);

    const statItems = [
        { label: "نقاط الإنجاز", value: stats.totalPoints, icon: "🌟", color: "bg-yellow-500" },
        { label: "أيام متتالية", value: stats.streak, icon: "🔥", color: "bg-orange-500" },
        { label: "صلوات هذا الشهر", value: stats.monthlyPrayers, icon: "🗓️", color: "bg-teal-500" },
        { label: "مجموعات الأذكار المكتملة", value: stats.completedAzkar, icon: "📿", color: "bg-purple-500" },
    ];

    return (
        <div className="space-y-10">
            <section id="stats">
                <h3 className="text-2xl font-bold text-white text-center mb-4">الإحصائيات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <WeeklyPrayerChart />
                    <KhatmaProgressChart />
                    {statItems.map(item => (
                        <StatCard key={item.label} icon={item.icon} label={item.label} value={item.value} colorClass={item.color} />
                    ))}
                </div>
            </section>
            <section id="challenges" ref={challengesSectionRef}>
                <h3 className="text-2xl font-bold text-white text-center mb-4">التحديات</h3>
                <div className="space-y-4">
                    <GlassCard className="!p-2">
                        <div className="flex justify-around items-center">
                            <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                نشطة
                            </button>
                            <button onClick={() => setActiveTab('available')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'available' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                متاحة
                            </button>
                            <button onClick={() => setActiveTab('completed')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'completed' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                                مكتملة
                            </button>
                        </div>
                    </GlassCard>

                    {filteredChallenges.length > 0 ? (
                        filteredChallenges.map(c => <ChallengeCard key={c.id} challenge={c} />)
                    ) : (
                        <GlassCard className="text-center text-white/80">
                            لا توجد تحديات في هذا القسم حالياً.
                        </GlassCard>
                    )}
                </div>
            </section>
        </div>
    );
};

export default StatsAndChallengesPage;
