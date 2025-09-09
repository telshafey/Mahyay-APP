import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { usePrayerTimesContext } from '../contexts/PrayerTimesContext';
import VerseCard from '../components/home/VerseCard';
import GlassCard from '../components/GlassCard';
import SectionHeader from '../components/home/SectionHeader';
import { Link } from 'react-router-dom';
import DailyWisdomCard from '../components/home/DailyWisdomCard';
import IslamicCalendar from '../components/home/IslamicCalendar';
import DuaCompanionCard from '../components/home/DuaCompanionCard';
import DuaCompanionModal from '../components/home/DuaCompanionModal';
import LocationBanner from '../components/home/LocationBanner';
import { PRAYERS, AZKAR_DATA } from '../constants';
import { DailyAzkarCategory } from '../types';

const PrayerProgressItem: React.FC<{ name: string; emoji: string; status: string }> = ({ name, emoji, status }) => {
    const statusStyles: { [key: string]: string } = {
        early: 'bg-green-500/30 text-green-300',
        ontime: 'bg-yellow-500/30 text-yellow-300',
        late: 'bg-orange-500/30 text-orange-300',
        missed: 'bg-red-500/30 text-red-300',
        not_prayed: 'bg-white/10 text-white/70'
    };
    return (
        <div className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${statusStyles[status] || statusStyles['not_prayed']}`}>
            <span className="text-xl">{emoji}</span>
            <span className="text-xs font-semibold">{name}</span>
        </div>
    );
}

const HomePage: React.FC = () => {
    const { dailyData, stats, personalGoals } = useAppContext();
    const { nextPrayer, isPrayerTimesLoading, locationError } = usePrayerTimesContext();
    const [isDuaModalOpen, setIsDuaModalOpen] = useState(false);

    const isCategoryComplete = useMemo(() => {
        return (categoryName: DailyAzkarCategory) => {
            const category = AZKAR_DATA.find(c => c.name === categoryName);
            if (!category) return false;

            const categoryProgress = dailyData.azkarStatus[categoryName];
            if (!categoryProgress) return false;

            return category.items.every(item => (categoryProgress[item.id] || 0) >= item.repeat);
        };
    }, [dailyData.azkarStatus]);

    const activeDailyGoals = useMemo(() => {
        return personalGoals.filter(g => g.type === 'daily' && !g.is_archived);
    }, [personalGoals]);
    
    const completedDailyGoalsCount = useMemo(() => {
        return activeDailyGoals.filter(g => dailyData.dailyGoalProgress[g.id]).length;
    }, [activeDailyGoals, dailyData.dailyGoalProgress]);


    const quranProgress = dailyData.quranPagesRead;
    const morningAzkarDone = isCategoryComplete('أذكار الصباح');
    const eveningAzkarDone = isCategoryComplete('أذكار المساء');

    return (
        <div className="space-y-8 animate-fade-in">
            {locationError && <LocationBanner message={locationError} />}
            <VerseCard />
            
            <GlassCard>
                <SectionHeader title="🗓️ خلاصة اليوم" linkTo="/more/stats" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-white">
                    <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold">{stats.totalPoints}</p>
                        <p className="text-xs font-semibold">🌟 نقاط</p>
                    </div>
                     <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold">{stats.streak}</p>
                        <p className="text-xs font-semibold">🔥 أيام متتالية</p>
                    </div>
                    <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold">{quranProgress || 0}</p>
                        <p className="text-xs font-semibold">📖 صفحات قرآن</p>
                    </div>
                     <div className="p-3 bg-black/20 rounded-lg">
                        <p className="text-2xl font-bold">{Object.values(dailyData.prayerData).filter(p=>p.fard === 'early' || p.fard === 'ontime').length}/5</p>
                        <p className="text-xs font-semibold">🕌 صلوات</p>
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                <SectionHeader title="🕌 الصلوات" linkTo="/prayers" />
                 <div className="text-center mb-4">
                    {isPrayerTimesLoading ? (
                        <p className="text-white animate-pulse">جاري تحميل مواقيت الصلاة...</p>
                    ) : (
                        <div>
                            <p className="text-white">الصلاة القادمة: <span className="font-bold text-yellow-300">{nextPrayer.prayer?.name || '...'}</span></p>
                            <p className="text-2xl font-bold text-white tracking-wider">{nextPrayer.countdown}</p>
                            {locationError && <p className="text-xs text-yellow-400/80 mt-1">(مواقيت القاهرة الافتراضية)</p>}
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-5 gap-2">
                   {PRAYERS.map(p => (
                       <PrayerProgressItem 
                            key={p.name} 
                            name={p.name} 
                            emoji={p.emoji} 
                            status={dailyData.prayerData[p.name]?.fard || 'not_prayed'} 
                        />
                   ))}
                </div>
            </GlassCard>
            
            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                    <SectionHeader title="📿 الأذكار" linkTo="/azkar" />
                    <div className="space-y-3">
                        <Link to="/azkar" className={`block p-3 rounded-lg text-white font-semibold transition-colors ${morningAzkarDone ? 'bg-green-500/30' : 'bg-white/10 hover:bg-white/20'}`}>
                            🌅 أذكار الصباح {morningAzkarDone && '✅'}
                        </Link>
                         <Link to="/azkar" className={`block p-3 rounded-lg text-white font-semibold transition-colors ${eveningAzkarDone ? 'bg-green-500/30' : 'bg-white/10 hover:bg-white/20'}`}>
                            🌃 أذكار المساء {eveningAzkarDone && '✅'}
                        </Link>
                    </div>
                </GlassCard>
                <GlassCard>
                     <SectionHeader title="📖 القرآن الكريم" linkTo="/quran" />
                     <Link to="/quran" className="block text-center p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                        <p className="text-white">التقدم اليومي المحسوب</p>
                        <p className="text-3xl font-bold text-yellow-300">{quranProgress || 0}</p>
                        <p className="text-sm text-white/80">صفحة</p>
                     </Link>
                </GlassCard>
                {activeDailyGoals.length > 0 && (
                     <GlassCard className="md:col-span-2">
                        <SectionHeader title="🎯 أهدافك اليومية" linkTo="/more/goals" />
                        <Link to="/more/goals" className="block text-center p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                           <p className="text-white">التقدم اليومي</p>
                           <p className="text-3xl font-bold text-yellow-300">{completedDailyGoalsCount} / {activeDailyGoals.length}</p>
                           <p className="text-sm text-white/80">هدف مكتمل</p>
                        </Link>
                   </GlassCard>
                )}
            </div>
            
            <DuaCompanionCard onOpen={() => setIsDuaModalOpen(true)} />
            <DailyWisdomCard />
            <IslamicCalendar />

            {isDuaModalOpen && <DuaCompanionModal onClose={() => setIsDuaModalOpen(false)} />}
        </div>
    );
};

export default HomePage;