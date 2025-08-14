
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext.ts';
import GlassCard from '../components/GlassCard.tsx';

const QuranPage: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { dailyData, settings, updateQuranRead, completeKhatma } = context;

    const read = dailyData.quranRead || 0;
    const goal = settings.quranGoal || 10;
    const progress = Math.min((read / goal) * 100, 100);
    const khatmat = dailyData.quranKhatmat || 0;

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

        </div>
    );
};

export default QuranPage;
