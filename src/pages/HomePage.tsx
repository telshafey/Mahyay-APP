import React, { useContext, useState } from 'react';
// Fix: Corrected react-router-dom import to use namespace import to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.ts';
import { PRAYERS, AZKAR_TYPES, CHALLENGES } from '../constants.ts';
import type { PrayerStatus, UserChallenge } from '../types.ts';
import GlassCard from '../components/GlassCard.tsx';
import ChallengeCard from '../components/ChallengeCard.tsx';

const LocationBanner: React.FC<{ message: string }> = ({ message }) => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;
    return (
        <GlassCard className="!bg-red-900/50 !border-red-400/50 flex items-center justify-between gap-4">
            <p className="text-white text-sm">
                <span className="font-bold">⚠️ تنبيه:</span> {message}
            </p>
            <button onClick={() => setIsVisible(false)} className="text-white font-bold text-xl">&times;</button>
        </GlassCard>
    );
}

const SectionHeader: React.FC<{ title: string; linkTo: string; }> = ({ title, linkTo }) => (
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-xl font-semibold flex items-center gap-2">{title}</h3>
        <ReactRouterDOM.Link to={linkTo} className="text-sm bg-white/15 hover:bg-white/25 transition-colors text-white py-2 px-4 rounded-full">
            عرض الكل ←
        </ReactRouterDOM.Link>
    </div>
);

const VerseCard: React.FC = () => {
    const verse = "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ";
    const source = "سورة الأنعام - آية 162";
    
    return (
        <GlassCard className="text-center !bg-gradient-to-br !from-yellow-300/10 !to-yellow-500/20 !border-yellow-400/30">
            <p className="font-amiri text-2xl md:text-3xl leading-relaxed text-white font-bold mb-4">"{verse}"</p>
            <p className="text-yellow-300 font-semibold mb-2">{source}</p>
        </GlassCard>
    );
}

const DailyWisdomCard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context?.dailyWisdom) {
        return <GlassCard><p className="text-center text-white/70">جاري تحميل حكمة اليوم...</p></GlassCard>;
    }
    const { dailyWisdom } = context;
    return (
        <GlassCard className="!bg-gradient-to-tr !from-purple-500/10 !to-indigo-500/20 !border-purple-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💡 حكمة اليوم</h3>
            <p className="font-amiri text-lg md:text-xl leading-relaxed text-white font-bold mb-4 text-center">"{dailyWisdom.text}"</p>
            <p className="text-purple-300 font-semibold text-center">{dailyWisdom.source}</p>
        </GlassCard>
    );
}

const IslamicCalendar: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const { currentHijriMonthInfo, nextIslamicOccasion, hijriYearInfo } = context;

    const hijriMonths: { [key: number]: string } = {
        1: "محرم", 2: "صفر", 3: "ربيع الأول", 4: "ربيع الآخر",
        5: "جمادى الأولى", 6: "جمادى الآخرة", 7: "رجب", 8: "شعبان",
        9: "رمضان", 10: "شوال", 11: "ذو القعدة", 12: "ذو الحجة"
    };

    if (!currentHijriMonthInfo) {
        return <GlassCard><p className="text-center text-white/70">جاري تحميل التقويم الإسلامي...</p></GlassCard>;
    }
    
    return (
        <GlassCard>
            <div className="text-center text-white mb-4">
                <h3 className="font-amiri text-2xl font-bold">{currentHijriMonthInfo.name}</h3>
                <p className="opacity-80 mb-2">{currentHijriMonthInfo.year} هـ</p>
                <p className="text-sm opacity-90 max-w-md mx-auto">{currentHijriMonthInfo.definition}</p>
            </div>
            
            <div className="mt-4 mb-4 p-3 bg-black/20 rounded-lg text-xs text-center text-white/80 space-y-2">
                <p>أنت في عام <span className="font-bold text-yellow-300">{hijriYearInfo?.year || '...'}</span> هجريًا، والذي يبلغ طوله حوالي <span className="font-bold text-yellow-300">{hijriYearInfo?.length || '354'}</span> يومًا.</p>
                <p className="font-amiri">"إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا ... مِنْهَا أَرْبَعَةٌ حُرُمٌ"</p>
                <p className="text-white/60">(التوبة: 36)</p>
            </div>

            {nextIslamicOccasion && (
                 <div className="bg-yellow-400/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-4 text-center">
                    <h4 className="font-bold text-yellow-200 text-sm">أقرب مناسبة قادمة</h4>
                    <p className="text-white font-bold text-lg">{nextIslamicOccasion.name}</p>
                    <p className="text-yellow-300 text-sm">{nextIslamicOccasion.hijriDay} {hijriMonths[nextIslamicOccasion.hijriMonth]}</p>
                    <p className="text-white/80 text-xs mt-1">{nextIslamicOccasion.description}</p>
                </div>
            )}
            
            <div>
                <h4 className="font-bold text-white mb-2">مناسبات هذا الشهر:</h4>
                {currentHijriMonthInfo.occasions.length > 0 ? (
                     <ul className="space-y-2">
                        {currentHijriMonthInfo.occasions.map(occasion => (
                             <li key={occasion.id} className="p-2 bg-black/20 rounded-md flex items-start gap-2">
                                <span className="text-yellow-400 pt-1">⭐</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">{occasion.name} - {occasion.hijriDay} {currentHijriMonthInfo.name}</p>
                                    <p className="text-xs text-white/70">{occasion.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-white/60 py-2">لا توجد مناسبات بارزة في هذا الشهر.</p>
                )}
            </div>
        </GlassCard>
    );
};


const HomePage: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return <div>Loading...</div>;

  const { dailyData, nextPrayer, stats, prayerTimes, locationError } = context;
  
  const todayPrayers = Object.values(dailyData.prayerData).filter((p: PrayerStatus) => p.fard !== 'not_prayed' && p.fard !== 'missed').length;
  const todayAzkar = Object.values(dailyData.azkarStatus).filter(s => s === true).length;
  const todayQuran = dailyData.quranRead;

  const quickStats = [
      { icon: '🕌', label: 'صلوات', value: todayPrayers },
      { icon: '📿', label: 'أذكار', value: todayAzkar },
      { icon: '📖', label: 'صفحات', value: todayQuran },
      { icon: '🌟', label: 'نقاط', value: stats.totalPoints }
  ];
  
  const activeChallenges = CHALLENGES.filter(c => c.status === 'active');

  return (
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
                        <div className="text-sm text-white/80">{stat.label}</div>
                    </GlassCard>
                ))}
            </div>
        </section>

        <section>
            <DailyWisdomCard />
        </section>

        <section>
             <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">🕌 الصلاة القادمة</h3>
             <GlassCard className="!bg-gradient-to-tr !from-blue-500/10 !to-purple-500/20 !border-blue-400/30">
                <div className="flex items-center justify-between text-white">
                    <div>
                        <p className="text-2xl font-bold">{nextPrayer.prayer?.emoji} {nextPrayer.prayer?.name}</p>
                        {nextPrayer.isNextDay && <p className="text-xs text-cyan-200">لليوم التالي</p>}
                        <p className="text-lg opacity-90">{nextPrayer.prayer ? prayerTimes[nextPrayer.prayer.name] : '...'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm opacity-80">متبقي</p>
                        <p className="text-xl font-bold text-cyan-300">{nextPrayer.countdown}</p>
                    </div>
                </div>
             </GlassCard>
        </section>

        <section>
            <SectionHeader title="🏆 التحديات النشطة" linkTo="/more/challenges" />
            <div className="space-y-4">
                {activeChallenges.slice(0, 2).map(challenge => (
                    <ReactRouterDOM.Link to="/more/challenges" key={challenge.id}>
                        <ChallengeCard challenge={challenge} />
                    </ReactRouterDOM.Link>
                ))}
            </div>
        </section>
      
        <section>
             <SectionHeader title="🕐 أوقات الصلوات" linkTo="/prayers" />
             <div className="grid grid-cols-5 gap-2 md:gap-3">
                {PRAYERS.map(p => {
                    const status = dailyData.prayerData[p.name]?.fard;
                    const isCompleted = status && status !== 'not_prayed' && status !== 'missed';
                    return (
                        <ReactRouterDOM.Link to="/prayers" key={p.name}>
                            <GlassCard className={`text-center transition-transform transform hover:-translate-y-1 ${isCompleted ? '!bg-green-500/30 !border-green-400/50' : ''}`}>
                                <div className="text-2xl mb-1">{p.emoji}</div>
                                <div className="text-xs md:text-sm font-semibold text-white">{p.name}</div>
                                <div className="text-[10px] md:text-xs text-white/70">{prayerTimes[p.name] || '...'}</div>
                            </GlassCard>
                        </ReactRouterDOM.Link>
                    )
                })}
             </div>
        </section>

        <section>
            <SectionHeader title="📿 الأذكار اليومية" linkTo="/azkar" />
            <div className="grid grid-cols-2 gap-4">
                {AZKAR_TYPES.map(azkar => {
                    const isCompleted = dailyData.azkarStatus[azkar.name];
                    const progress = context.getAzkarProgress(azkar.name);
                    return (
                         <ReactRouterDOM.Link to="/azkar" key={azkar.name}>
                            <GlassCard className={`flex flex-col justify-between h-full transition-transform transform hover:-translate-y-1 ${isCompleted ? '!bg-green-500/30 !border-green-400/50' : ''}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-2xl">{azkar.emoji}</span>
                                        <h4 className="font-semibold text-white">{azkar.name}</h4>
                                    </div>
                                    <p className="text-xs text-white/70 mb-2">{azkar.time}</p>
                                </div>
                                <div className="text-sm font-semibold text-white">
                                    {isCompleted ? '✅ مكتمل' : progress > 0 ? `🔄 ${Math.round(progress)}%` : '⏳ لم تبدأ'}
                                </div>
                            </GlassCard>
                         </ReactRouterDOM.Link>
                    );
                })}
            </div>
        </section>

        <section>
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">🌙 التقويم الإيماني</h3>
            <IslamicCalendar />
        </section>

    </div>
  );
};

export default HomePage;