import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { usePrayerTimesContext } from '../contexts/PrayerTimesContext';
import { PRAYERS, AZKAR_TYPES, CHALLENGES } from '../constants';
import { PrayerStatus, DisplayChallenge } from '../types';
import GlassCard from '../components/GlassCard';
import ChallengeCard from '../components/ChallengeCard';

import LocationBanner from '../components/home/LocationBanner';
import SectionHeader from '../components/home/SectionHeader';
import VerseCard from '../components/home/VerseCard';
import DailyWisdomCard from '../components/home/DailyWisdomCard';
import DuaCompanionCard from '../components/home/DuaCompanionCard';
import IslamicCalendar from '../components/home/IslamicCalendar';

const HomePage: React.FC = () => {
  const { 
      dailyData, stats, 
      getAzkarProgress, personalGoals, goalProgress, toggleDailyGoalCompletion,
      userChallenges, startChallenge 
  } = useAppContext();
  const { prayerTimes, nextPrayer, locationError } = usePrayerTimesContext();
  
  const todayPrayers = Object.values(dailyData.prayerData).filter((p: PrayerStatus) => p.fard !== 'not_prayed' && p.fard !== 'missed').length;
  const todayAzkar = Object.values(dailyData.azkarStatus).filter(s => s === true).length;
  const todayQuran = dailyData.quranRead;

  const quickStats = [
      { icon: '🕌', label: 'صلوات', value: todayPrayers },
      { icon: '📿', label: 'أذكار', value: todayAzkar },
      { icon: '📖', label: 'صفحات', value: todayQuran },
      { icon: '🌟', label: 'نقاط', value: stats.totalPoints }
  ];
  
  const activeChallenges = useMemo((): DisplayChallenge[] => {
    return userChallenges
      .filter(uc => uc.status === 'active')
      .map((uc): DisplayChallenge | null => {
        const baseChallenge = CHALLENGES.find(c => c.id === uc.challengeId);
        return baseChallenge ? { ...baseChallenge, progress: uc.progress, userProgress: uc } : null;
      })
      .filter((c): c is DisplayChallenge => Boolean(c));
  }, [userChallenges]);
  
  const activeGoals = personalGoals.filter(g => !g.isArchived && !g.completedAt).slice(0, 2);

  return (
    <>
    <div className="space-y-8">
        {locationError && <LocationBanner message={locationError} />}

        <VerseCard />

        <section>
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">📊 إنجازات اليوم</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map(stat => (
                    <GlassCard key={stat.label} className="text-center">
                        <div className="text-3xl mb-2">{stat.icon}</div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-white">{stat.label}</div>
                    </GlassCard>
                ))}
            </div>
        </section>

        <section>
            <DailyWisdomCard />
        </section>
        
        <section>
            <DuaCompanionCard />
        </section>

        <section>
             <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">🕌 الصلاة القادمة</h3>
             <GlassCard className="!bg-gradient-to-tr !from-blue-500/20 !to-purple-500/30 !border-blue-400/30">
                <div className="flex items-center justify-between text-white">
                    <div>
                        <p className="text-2xl font-bold">{nextPrayer.prayer?.emoji} {nextPrayer.prayer?.name}</p>
                        {nextPrayer.isNextDay && <p className="text-xs text-cyan-200">لليوم التالي</p>}
                        <p className="text-lg text-white/95">{nextPrayer.prayer ? prayerTimes[nextPrayer.prayer.name] : '...'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-white/90">متبقي</p>
                        <p className="text-xl font-bold text-cyan-300">{nextPrayer.countdown}</p>
                    </div>
                </div>
             </GlassCard>
        </section>
        
        {activeGoals.length > 0 && (
            <section>
                <SectionHeader title="🎯 أهدافي الشخصية" linkTo="/more/goals" />
                <div className="space-y-4">
                    {activeGoals.map(goal => {
                        const progress = goal.type === 'target' ? ((goalProgress[goal.id] || 0) / goal.target) * 100 : (dailyData.dailyGoalProgress[goal.id] ? 100 : 0);
                        return (
                            <Link to="/more/goals" key={goal.id}>
                                <GlassCard className="!p-3">
                                    <div className="flex items-center gap-3 text-white">
                                        <div className="text-3xl">{goal.icon}</div>
                                        <div className="flex-grow">
                                            <p className="font-bold">{goal.title}</p>
                                            <div className="w-full bg-black/20 rounded-full h-2 mt-1">
                                                <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2 rounded-full" style={{width: `${progress}%`}}></div>
                                            </div>
                                        </div>
                                        {goal.type === 'daily' && (
                                            <button onClick={(e) => { e.preventDefault(); toggleDailyGoalCompletion(goal.id); }} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors ${dailyData.dailyGoalProgress[goal.id] ? 'bg-teal-500' : 'bg-white/10'}`}>
                                                {dailyData.dailyGoalProgress[goal.id] ? '✓' : ''}
                                            </button>
                                        )}
                                    </div>
                                </GlassCard>
                            </Link>
                        )
                    })}
                </div>
            </section>
        )}

        <section>
            <SectionHeader title="🏆 التحديات النشطة" linkTo="/challenges" />
            <div className="space-y-4">
                {activeChallenges.slice(0, 2).map(challenge => (
                    challenge && (
                        <Link to="/challenges" key={challenge.id}>
                            <ChallengeCard challenge={challenge} onStartChallenge={startChallenge} />
                        </Link>
                    )
                ))}
                 {activeChallenges.length === 0 && (
                    <Link to="/challenges">
                        <GlassCard className="text-center text-white/80 py-6">
                            <p>لا توجد تحديات نشطة حاليًا.</p>
                            <p className="font-bold text-yellow-300">اكتشف تحديات جديدة وابدأ رحلتك!</p>
                        </GlassCard>
                    </Link>
                )}
            </div>
        </section>
      
        <section>
             <SectionHeader title="🕐 أوقات الصلوات" linkTo="/prayers" />
             <div className="grid grid-cols-5 gap-2 md:gap-3">
                {PRAYERS.map(p => {
                    const status = dailyData.prayerData[p.name]?.fard;
                    const isCompleted = status && status !== 'not_prayed' && status !== 'missed';
                    return (
                        <Link to="/prayers" key={p.name}>
                            <GlassCard className={`text-center transition-transform transform hover:-translate-y-1 !p-2 md:!p-4 ${isCompleted ? '!bg-green-500/30 !border-green-400/50' : ''}`}>
                                <div className="text-xl md:text-2xl mb-1">{p.emoji}</div>
                                <div className="text-xs font-semibold text-white">{p.name}</div>
                                <div className="text-[11px] text-white/90">{prayerTimes[p.name] || '...'}</div>
                            </GlassCard>
                        </Link>
                    )
                })}
             </div>
        </section>

        <section>
            <SectionHeader title="📿 الأذكار اليومية" linkTo="/azkar" />
            <div className="grid grid-cols-2 gap-4">
                {AZKAR_TYPES.map(azkar => {
                    const isCompleted = dailyData.azkarStatus[azkar.name];
                    const progress = getAzkarProgress(azkar.name);
                    return (
                         <Link to="/azkar" key={azkar.name}>
                            <GlassCard className={`flex flex-col justify-between h-full transition-transform transform hover:-translate-y-1 ${isCompleted ? '!bg-green-500/30 !border-green-400/50' : ''}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-2xl">{azkar.emoji}</span>
                                        <h4 className="font-semibold text-white">{azkar.name}</h4>
                                    </div>
                                    <p className="text-xs text-white mb-2">{azkar.time}</p>

                                </div>
                                <div className="text-sm font-semibold text-white">
                                    {isCompleted ? '✅ مكتمل' : progress > 0 ? `🔄 ${Math.round(progress)}%` : '⏳ لم تبدأ'}
                                </div>
                            </GlassCard>
                         </Link>
                    );
                })}
            </div>
        </section>

        <section>
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">🌙 التقويم الإيماني</h3>
            <IslamicCalendar />
        </section>

    </div>
    </>
  );
};

export default HomePage;