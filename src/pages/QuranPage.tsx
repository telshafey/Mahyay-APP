import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import GlassCard from '../components/GlassCard';
import { REFLECTION_VERSES, CHALLENGES } from '../constants';
import { DisplayChallenge } from '../types';
import ChallengeCard from '../components/ChallengeCard';


const QuranPage: React.FC = () => {
    const { dailyData, settings, updateQuranRead, completeKhatma, userChallenges, startChallenge } = useAppContext();

    const read = dailyData.quranRead || 0;
    const goal = settings.quranGoal || 10;
    const progress = goal > 0 ? Math.min((read / goal) * 100, 100) : 0;
    const khatmat = dailyData.quranKhatmat || 0;

    const [selectedReflection, setSelectedReflection] = useState<{ 
        text: string; 
        source: string; 
        reflection: string; 
        actionable_tip: string; 
    } | null>(null);

     const quranChallenges = useMemo(() => {
        const quranChallengeIds = ['c5', 'c6']; // Surah Al-Kahf, Surah Al-Mulk
        return CHALLENGES
            .filter(base => quranChallengeIds.includes(base.id))
            .map(baseChallenge => {
                const userProgress = userChallenges.find(uc => uc.challengeId === baseChallenge.id && uc.status === 'active');
                if (!userProgress) return null;
                return {
                    ...baseChallenge,
                    progress: userProgress.progress,
                    userProgress: userProgress,
                } as DisplayChallenge;
            })
            .filter((c): c is DisplayChallenge => Boolean(c));
    }, [userChallenges]);


    useEffect(() => {
        if (progress >= 100 && !selectedReflection) {
            const randomIndex = Math.floor(Math.random() * REFLECTION_VERSES.length);
            setSelectedReflection(REFLECTION_VERSES[randomIndex]);
        } else if (progress < 100 && selectedReflection) {
            setSelectedReflection(null);
        }
    }, [progress, selectedReflection]);

    const motivationalMessages = {
        0: 'ابدأ رحلتك مع القرآن الكريم اليوم، فكل حرف بحسنة.',
        25: 'بداية مباركة! استمر في القراءة لتنال الأجر.',
        50: 'ما شاء الله، لقد قطعت نصف الطريق. أكمل وردك وستُفتح لك تأملات روحية عند إتمام الهدف!',
        75: 'ممتاز! أنت على وشك إتمام وردك اليومي. عند إكماله، ستفتح لك تأملات روحية في آية مختارة!',
        100: '🎉 أحسنت! لقد أتممت هدفك اليومي، تقبل الله منك.'
    };

    const getMotivationalMessage = () => {
        if (progress >= 100) return motivationalMessages[100];
        if (progress >= 75) return motivationalMessages[75];
        if (progress >= 50) return motivationalMessages[50];
        if (progress > 0) return motivationalMessages[25];
        return motivationalMessages[0];
    };

    return (
        <div className="space-y-6 text-white">
            <GlassCard className="text-center !bg-gradient-to-br !from-yellow-400/20 !to-yellow-500/30">
                 <p className="font-amiri text-2xl md:text-3xl leading-relaxed font-bold mb-2">"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"</p>
                 <p className="text-yellow-300 font-semibold">سورة المزمل - آية 4</p>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xl font-bold text-center mb-4">📖 قراءة اليوم</h3>
                <div className="text-center mb-6">
                    <p className="text-white">الهدف اليومي</p>
                    <p className="text-4xl font-bold text-yellow-300">{goal}</p>
                    <p className="text-white">صفحات</p>
                </div>

                <div className="flex items-center justify-center gap-4 my-6">
                    <button onClick={() => updateQuranRead(-1)} className="w-12 h-12 rounded-full bg-white/10 text-white text-2xl font-bold hover:bg-white/20">-</button>
                    <span className="text-5xl font-bold text-white w-24 text-center">{read}</span>
                    <button onClick={() => updateQuranRead(1)} className="w-12 h-12 rounded-full bg-white/10 text-white text-2xl font-bold hover:bg-white/20">+</button>
                </div>

                <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden my-4">
                    <div style={{width: `${progress}%`}} className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500"></div>
                </div>
                 <p className="text-center font-semibold text-yellow-300 mb-4">{Math.round(progress)}% من الهدف</p>

                <div className="p-3 bg-black/20 rounded-lg text-center text-white text-sm">
                    {getMotivationalMessage()}
                </div>
            </GlassCard>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-center mb-4">🏆 إنجازات الختم</h3>
                <div className="flex items-center justify-around">
                     <div className="text-center">
                        <p className="text-4xl font-bold text-yellow-300">{khatmat}</p>
                        <p className="text-white">ختمة مكتملة</p>
                    </div>
                    <button onClick={completeKhatma} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                        🎉 ختمة جديدة
                    </button>
                </div>
            </GlassCard>

            {quranChallenges.length > 0 && (
                <GlassCard className="animate-fade-in !bg-gradient-to-br from-cyan-500/20 to-teal-500/30">
                    <h3 className="text-xl font-bold text-center mb-2 text-cyan-300">🎯 تحديات قرآنية نشطة</h3>
                    <p className="text-center text-sm text-white/80 mb-4">
                        سجّل إنجازك في هذه التحديات مباشرة من هنا.
                    </p>
                    <div className="space-y-4">
                        {quranChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} onStartChallenge={startChallenge} />
                        ))}
                    </div>
                </GlassCard>
            )}


             <GlassCard className="!bg-black/20">
                <h3 className="text-xl font-bold text-center mb-4 text-yellow-300">✨ فضل قراءة القرآن</h3>
                <div className="font-amiri text-center">
                     <p className="text-lg text-white">"مَن قَرَأَ حَرْفًا مِن كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا"</p>
                     <p className="text-sm text-white/90 mt-2">رواه الترمذي</p>
                </div>
            </GlassCard>

            {selectedReflection && (
            <GlassCard className="animate-fade-in !bg-gradient-to-br from-indigo-500/20 to-purple-500/30 !border-purple-400/50">
                <h3 className="text-xl font-bold text-center mb-4 text-purple-300">✨ تأملات روحية</h3>
                
                <div className="text-center mb-6 p-4 bg-black/25 rounded-lg border-r-4 border-purple-400">
                    <p className="font-amiri text-xl md:text-2xl text-white">"{selectedReflection.text}"</p>
                    <p className="text-sm text-purple-300 mt-2">{selectedReflection.source}</p>
                </div>
                
                <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-black/20 rounded-lg">
                        <h4 className="font-bold text-purple-300 mb-2">التأمل:</h4>
                        <p className="text-white leading-relaxed font-amiri text-lg">{selectedReflection.reflection}</p>
                    </div>
                     <div className="p-4 bg-black/20 rounded-lg">
                        <h4 className="font-bold text-purple-300 mb-2">خطوة عملية:</h4>
                        <p className="text-white leading-relaxed font-amiri text-lg">{selectedReflection.actionable_tip}</p>
                    </div>
                </div>
            </GlassCard>
            )}

        </div>
    );
};

export default QuranPage;