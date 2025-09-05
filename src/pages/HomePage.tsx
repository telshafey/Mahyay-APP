

import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PRAYERS, AZKAR_TYPES, CHALLENGES } from '../constants';
import { PrayerStatus, UserChallenge, PersonalizedDua } from '../types';
import GlassCard from '../components/GlassCard';
import ChallengeCard from '../components/ChallengeCard';
import { getPersonalizedDua } from '../services/geminiService';


const DuaCompanionModal: React.FC<{ onClose: () => void; }> = ({ onClose }) => {
    const [request, setRequest] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PersonalizedDua | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.trim()) return;

        setIsLoading(true);
        setResult(null);
        setError(null);
        
        const response = await getPersonalizedDua(request);

        if (response.data) {
            setResult(response.data);
        } else {
            // The geminiService now provides detailed, user-friendly error messages.
            // We can display them directly.
            const userFriendlyError = response.error || 'عذراً، لم نتمكن من صياغة الدعاء. يرجى المحاولة مرة أخرى بطلب مختلف.';
            setError(userFriendlyError);
            console.error("Dua Companion Error:", response.error);
        }
        setIsLoading(false);
    };
    
    const handleCopy = () => {
        if(result?.dua) {
            navigator.clipboard.writeText(result.dua);
            alert('تم نسخ الدعاء!');
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <GlassCard className="w-full max-w-lg !bg-gradient-to-br from-[#2d5a47] to-[#1e4d3b]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white font-amiri">✨ رفيق الدعاء</h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white font-bold text-2xl">&times;</button>
                </div>
                
                {!result && !isLoading && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label htmlFor="dua-request" className="block text-white/90 text-center">
                            اكتب ما في قلبك أو ما تحتاج للدعاء به (مثال: لدي اختبار غداً وأشعر بالقلق)
                        </label>
                        <textarea
                            id="dua-request"
                            value={request}
                            onChange={(e) => setRequest(e.target.value)}
                            rows={3}
                            placeholder="اكتب هنا..."
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                        <button 
                            type="submit" 
                            disabled={!request.trim()}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                            صياغة الدعاء
                        </button>
                    </form>
                )}

                {isLoading && (
                    <div className="text-center p-8 space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                        <p className="text-white font-semibold">لحظات من فضلك، جاري صياغة الدعاء...</p>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 bg-red-900/50 rounded-lg text-center text-red-300">
                        <p>{error}</p>
                         <button onClick={() => { setError(null); setIsLoading(false); setResult(null); }} className="mt-3 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                            حاول مجدداً
                        </button>
                    </div>
                )}

                {result && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="p-4 bg-black/30 rounded-lg border-r-4 border-yellow-400">
                             <p className="font-amiri text-xl md:text-2xl leading-relaxed text-white text-center">"{result.dua}"</p>
                        </div>
                        <div className="text-center text-sm text-yellow-300 font-semibold">{result.source_info}</div>
                        <div className="flex gap-4">
                             <button onClick={handleCopy} className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg">نسخ الدعاء</button>
                             <button onClick={() => { setResult(null); setRequest(''); }} className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg">طلب دعاء آخر</button>
                        </div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};


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
        <Link to={linkTo} className="text-sm bg-white/15 hover:bg-white/25 transition-colors text-white py-2 px-4 rounded-full">
            عرض الكل ←
        </Link>
    </div>
);

const VerseCard: React.FC = () => {
    const verse = "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ";
    const source = "سورة الأنعام - آية 162";
    
    return (
        <GlassCard className="text-center !bg-gradient-to-br !from-yellow-300/20 !to-yellow-500/30 !border-yellow-400/30">
            <p className="font-amiri text-2xl md:text-3xl leading-relaxed text-white font-bold mb-4">"{verse}"</p>
            <p className="text-yellow-300 font-semibold mb-2">{source}</p>
        </GlassCard>
    );
}

const DailyWisdomCard: React.FC = () => {
    const context = useContext(AppContext);
    if (!context || !context.dailyWisdom) {
        return <GlassCard><p className="text-center text-white/80">جاري تحميل حكمة اليوم...</p></GlassCard>;
    }
    const { dailyWisdom } = context;
    return (
        <GlassCard className="!bg-gradient-to-tr !from-purple-500/20 !to-indigo-500/30 !border-purple-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💡 حكمة اليوم</h3>
            <p className="font-amiri text-lg md:text-xl leading-relaxed text-white font-bold mb-4 text-center">"{dailyWisdom.text}"</p>
            <p className="text-purple-300 font-semibold text-center">{dailyWisdom.source}</p>
        </GlassCard>
    );
}

const DuaCompanionCard: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { dailyDua } = context;
    return (
        <GlassCard className="!bg-gradient-to-tr !from-teal-500/20 !to-cyan-500/30 !border-teal-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💖 دعاء اليوم</h3>
            <div className="p-4 bg-black/25 rounded-lg border-r-4 border-teal-400 text-center mb-4">
                <p className="font-amiri text-lg text-white">"{dailyDua.text}"</p>
                <p className="text-sm text-teal-300 mt-2">{dailyDua.source}</p>
            </div>
            <p className="text-center text-sm text-white/90 mb-4">هل تحتاج لدعاء مخصص؟ دع الذكاء الاصطناعي يساعدك في مناجاة ربك.</p>
            <button onClick={onOpenModal} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                اطلب دعاءً مخصصًا
            </button>
        </GlassCard>
    );
};


const IslamicCalendar: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return <GlassCard><p className="text-center text-white/80">جاري تحميل التقويم الإسلامي...</p></GlassCard>;

    const { currentHijriMonthInfo, nextIslamicOccasion, hijriYearInfo } = context;

    const hijriMonths: { [key: number]: string } = {
        1: "محرم", 2: "صفر", 3: "ربيع الأول", 4: "ربيع الآخر",
        5: "جمادى الأولى", 6: "جمادى الآخرة", 7: "رجب", 8: "شعبان",
        9: "رمضان", 10: "شوال", 11: "ذو القعدة", 12: "ذو الحجة"
    };

    if (!currentHijriMonthInfo) {
        return <GlassCard><p className="text-center text-white/80">جاري تحميل التقويم الإسلامي...</p></GlassCard>;
    }
    
    return (
        <GlassCard>
            <div className="text-center text-white mb-4">
                <h3 className="font-amiri text-2xl font-bold">{currentHijriMonthInfo.name}</h3>
                <p className="text-white/95 mb-2">{currentHijriMonthInfo.year} هـ</p>
                <p className="text-sm text-white/95 max-w-md mx-auto">{currentHijriMonthInfo.definition}</p>
            </div>
            
            <div className="mt-4 mb-4 p-3 bg-black/20 rounded-lg text-xs text-center text-white space-y-2">
                <p>أنت في عام <span className="font-bold text-yellow-300">{hijriYearInfo?.year || '...'}</span> هجريًا، والذي يبلغ طوله حوالي <span className="font-bold text-yellow-300">{hijriYearInfo?.length || '354'}</span> يومًا.</p>
                <p className="font-amiri">"إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا ... مِنْهَا أَرْبَعَةٌ حُرُمٌ"</p>
                <p className="text-white/85">(التوبة: 36)</p>
            </div>

            {nextIslamicOccasion && (
                 <div className="bg-yellow-400/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-4 text-center">
                    <h4 className="font-bold text-yellow-200 text-sm">أقرب مناسبة قادمة</h4>
                    <p className="text-white font-bold text-lg">{nextIslamicOccasion.name}</p>
                    <p className="text-yellow-300 text-sm">{nextIslamicOccasion.hijriDay} {hijriMonths[nextIslamicOccasion.hijriMonth]}</p>
                    <p className="text-white text-xs mt-1">{nextIslamicOccasion.description}</p>
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
                                    <p className="text-xs text-white/90">{occasion.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-white/85 py-2">لا توجد مناسبات بارزة في هذا الشهر.</p>
                )}
            </div>
        </GlassCard>
    );
};


const HomePage: React.FC = () => {
  const context = useContext(AppContext);
  const [isDuaModalOpen, setIsDuaModalOpen] = useState(false);

  if (!context) return <div>Loading...</div>;

  const { dailyData, nextPrayer, stats, prayerTimes, locationError, getAzkarProgress, personalGoals, goalProgress, toggleDailyGoalCompletion } = context;
  
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
  const activeGoals = personalGoals.filter(g => !g.isArchived && !g.completedAt).slice(0, 2);

  return (
    <>
    {isDuaModalOpen && <DuaCompanionModal onClose={() => setIsDuaModalOpen(false)} />}
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
            <DuaCompanionCard onOpenModal={() => setIsDuaModalOpen(true)} />
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
            <SectionHeader title="🏆 التحديات النشطة" linkTo="/more/challenges" />
            <div className="space-y-4">
                {activeChallenges.slice(0, 2).map(challenge => (
                    <Link to="/more/challenges" key={challenge.id}>
                        <ChallengeCard challenge={challenge} />
                    </Link>
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
                        <Link to="/prayers" key={p.name}>
                            <GlassCard className={`text-center transition-transform transform hover:-translate-y-1 ${isCompleted ? '!bg-green-500/30 !border-green-400/50' : ''}`}>
                                <div className="text-2xl mb-1">{p.emoji}</div>
                                <div className="text-xs md:text-sm font-semibold text-white">{p.name}</div>
                                <div className="text-[10px] md:text-xs text-white/90">{prayerTimes[p.name] || '...'}</div>
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