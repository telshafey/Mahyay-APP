import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext.ts';
import GlassCard from '../components/GlassCard.tsx';
import { getVerseReflection } from '../services/geminiService.ts';
import { REFLECTION_VERSES } from '../constants.ts';

const QuranPage: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { dailyData, settings, updateQuranRead, completeKhatma } = context;

    const read = dailyData.quranRead || 0;
    const goal = settings.quranGoal || 10;
    const progress = goal > 0 ? Math.min((read / goal) * 100, 100) : 0;
    const khatmat = dailyData.quranKhatmat || 0;

    const [reflectionVerse, setReflectionVerse] = useState<{ text: string; source: string; } | null>(null);
    const [reflectionText, setReflectionText] = useState<string | null>(null);
    const [isReflectionLoading, setIsReflectionLoading] = useState(false);

    useEffect(() => {
        if (progress >= 100 && !reflectionVerse) {
            const randomIndex = Math.floor(Math.random() * REFLECTION_VERSES.length);
            setReflectionVerse(REFLECTION_VERSES[randomIndex]);
            setReflectionText(null); 
        } else if (progress < 100 && reflectionVerse) {
            setReflectionVerse(null);
            setReflectionText(null);
        }
    }, [progress, reflectionVerse]);

    const handleGetReflection = async () => {
        if (!reflectionVerse) return;
        setIsReflectionLoading(true);
        setReflectionText(null);
        const reflection = await getVerseReflection(reflectionVerse.text);
        setReflectionText(reflection);
        setIsReflectionLoading(false);
    };


    const motivationalMessages = {
        0: 'ابدأ رحلتك مع القرآن الكريم اليوم، فكل حرف بحسنة.',
        25: 'بداية مباركة! استمر في القراءة لتنال الأجر.',
        50: 'ما شاء الله، لقد قطعت نصف الطريق لهدفك اليومي.',
        75: 'ممتاز! أنت على وشك إتمام وردك اليومي.',
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
            <GlassCard className="text-center !bg-gradient-to-br !from-yellow-400/10 !to-yellow-500/20">
                 <p className="font-amiri text-2xl md:text-3xl leading-relaxed font-bold mb-2">"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"</p>
                 <p className="text-yellow-300 font-semibold">سورة المزمل - آية 4</p>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xl font-bold text-center mb-4">📖 قراءة اليوم</h3>
                <div className="text-center mb-6">
                    <p className="text-white/80">الهدف اليومي</p>
                    <p className="text-4xl font-bold text-yellow-300">{goal}</p>
                    <p className="text-white/80">صفحات</p>
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

                <div className="p-3 bg-black/20 rounded-lg text-center text-white/90 text-sm">
                    {getMotivationalMessage()}
                </div>
            </GlassCard>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-center mb-4">🏆 إنجازات الختم</h3>
                <div className="flex items-center justify-around">
                     <div className="text-center">
                        <p className="text-4xl font-bold text-yellow-300">{khatmat}</p>
                        <p className="text-white/80">ختمة مكتملة</p>
                    </div>
                    <button onClick={completeKhatma} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                        🎉 ختمة جديدة
                    </button>
                </div>
            </GlassCard>

             <GlassCard className="!bg-black/10">
                <h3 className="text-xl font-bold text-center mb-4 text-yellow-300">✨ فضل قراءة القرآن</h3>
                <div className="font-amiri text-center">
                     <p className="text-lg text-white/90">"مَن قَرَأَ حَرْفًا مِن كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا"</p>
                     <p className="text-sm text-white/70 mt-2">رواه الترمذي</p>
                </div>
            </GlassCard>

            {reflectionVerse && (
            <GlassCard className="animate-fade-in !bg-gradient-to-br from-indigo-500/10 to-purple-500/20 !border-purple-400/50">
                <h3 className="text-xl font-bold text-center mb-4 text-purple-300">✨ تأملات روحية</h3>
                <div className="text-center mb-6 p-4 bg-black/20 rounded-lg border-r-4 border-purple-400">
                    <p className="font-amiri text-xl md:text-2xl text-white">"{reflectionVerse.text}"</p>
                    <p className="text-sm text-purple-300 mt-2">{reflectionVerse.source}</p>
                </div>
                
                {!reflectionText && (
                    <div className="text-center">
                        <button 
                            onClick={handleGetReflection} 
                            disabled={isReflectionLoading}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
                        >
                            {isReflectionLoading ? 'جاري التفكر...' : '💡 تدبّر الآية مع Gemini'}
                        </button>
                    </div>
                )}

                {reflectionText && (
                    <div className="p-4 bg-black/20 rounded-lg text-center animate-fade-in space-y-4">
                        <p className="text-white/90 leading-relaxed font-amiri text-lg">{reflectionText}</p>
                        <button 
                            onClick={handleGetReflection}
                            disabled={isReflectionLoading} 
                            className="text-sm bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-full transition-colors"
                        >
                            {isReflectionLoading ? '...' : '🔄 إعادة التأمل'}
                        </button>
                    </div>
                )}
            </GlassCard>
        )}

        </div>
    );
};

export default QuranPage;