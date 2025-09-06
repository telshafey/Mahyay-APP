import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AZKAR_TYPES, AZKAR_DATA, MISCELLANEOUS_AZKAR, CHALLENGES } from '../constants';
import { AzkarType, AzkarItem, DisplayChallenge } from '../types';
import GlassCard from '../components/GlassCard';
import { getMaxCount } from '../utils';
import ChallengeCard from '../components/ChallengeCard';


const AzkarItemCard: React.FC<{
    item: AzkarItem;
    index: number;
    azkarName: string;
}> = ({ item, index, azkarName }) => {
    const { dailyData, toggleAzkarItemCompletion } = useAppContext();
    const azkarProgress = dailyData.azkarProgress[azkarName] || {};
    const maxCount = getMaxCount(item.repeat);
    const currentCount = Math.min(azkarProgress[index] || 0, maxCount);
    const isCompleted = currentCount >= maxCount;

    return (
        <GlassCard className={`transition-all duration-300 ${isCompleted ? '!bg-green-500/20 border-green-400/30' : 'bg-black/20'}`}>
            <p className="font-amiri text-xl md:text-2xl leading-relaxed text-white mb-6 text-center">{item.text}</p>
            
            <div className="flex flex-col items-center justify-center gap-4">
                <button
                    onClick={() => toggleAzkarItemCompletion(azkarName, index)}
                    className={`px-6 py-3 rounded-full font-semibold text-lg transition-colors ${isCompleted ? 'bg-green-500/80 text-white' : 'bg-yellow-400/80 text-green-900 hover:bg-yellow-400'}`}
                >
                    {isCompleted ? '✅ تم' : 'إتمام الذكر'}
                </button>
                <p className="text-white font-semibold">{item.repeat}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <p className="font-amiri text-sm text-white">
                    <span className="font-bold text-yellow-300">📖 الدليل:</span> {item.evidence}
                </p>
            </div>
        </GlassCard>
    );
};

const AccordionItem: React.FC<{
    title: string;
    children: React.ReactNode;
}> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-black/30 rounded-lg overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-right p-4 flex justify-between items-center text-white"
            >
                <span className="font-semibold text-lg">{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-white space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};


const AzkarPage: React.FC = () => {
    const { settings, completeAzkarGroup, userChallenges, startChallenge } = useAppContext();
    const [activeTab, setActiveTab] = useState<AzkarType>(AZKAR_TYPES[0]);

     const azkarChallenges = useMemo(() => {
        const azkarChallengeIds = ['c8']; // "لا حول ولا قوة إلا بالله"
        return CHALLENGES
            .filter(base => azkarChallengeIds.includes(base.id))
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
        const currentHour = new Date().getHours();
        const morningAzkar = AZKAR_TYPES.find(a => a.name === 'أذكار الصباح')!;
        const eveningAzkar = AZKAR_TYPES.find(a => a.name === 'أذكار المساء')!;
    
        const [morningStartHour] = settings.azkarMorningStart.split(':').map(Number);
        const [eveningStartHour] = settings.azkarEveningStart.split(':').map(Number);
    
        if (currentHour >= morningStartHour && currentHour < eveningStartHour) {
            setActiveTab(morningAzkar);
        } else {
            setActiveTab(eveningAzkar);
        }
    }, [settings.azkarMorningStart, settings.azkarEveningStart]);
    
    const azkarItems = AZKAR_DATA[activeTab.name] || [];

    const handleScrollToMiscellaneous = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('miscellaneous-azkar');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">📿 الأذكار</h2>
            
             <GlassCard className="!p-0 !bg-black/30">
                <a href="#miscellaneous-azkar" onClick={handleScrollToMiscellaneous} className="block p-4 text-center text-white hover:bg-white/10 rounded-lg transition-colors">
                    <p className="font-semibold">
                        👇 تصفح للأسفل للعثور على أدعية وأذكار متنوعة
                    </p>
                    <p className="text-sm text-white/80">
                        مثل أذكار بعد الصلاة، دعاء السفر، ودعاء القنوت.
                    </p>
                </a>
            </GlassCard>

            <GlassCard className="!p-2">
                <div className="flex flex-wrap justify-center gap-2">
                    {AZKAR_TYPES.map(type => (
                        <button
                            key={type.name}
                            onClick={() => setActiveTab(type)}
                            className={`py-2 px-4 rounded-lg font-semibold transition-colors text-sm md:text-base ${activeTab.name === type.name ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}
                        >
                            {type.emoji} {type.name}
                        </button>
                    ))}
                </div>
            </GlassCard>
            
            <div className="flex justify-end">
                <button
                    onClick={() => completeAzkarGroup(activeTab.name)}
                    className="bg-green-500/80 hover:bg-green-500 text-white font-bold py-2 px-5 rounded-full transition-colors"
                >
                    ✅ إكمال الكل
                </button>
            </div>

            <div className="space-y-4">
                {azkarItems.map((item, index) => (
                    <AzkarItemCard key={index} item={item} index={index} azkarName={activeTab.name} />
                ))}
            </div>

            <GlassCard id="miscellaneous-azkar">
                <h3 className="text-2xl font-bold text-white text-center mb-4 font-amiri">أذكار وأدعية متنوعة</h3>
                <div className="space-y-3">
                    {MISCELLANEOUS_AZKAR.map(category => (
                        <AccordionItem key={category.title} title={category.title}>
                            {category.items.map((item, index) => (
                                <div key={index} className="p-3 bg-black/30 rounded-lg border-r-4 border-yellow-400/50">
                                    <p className="font-amiri text-lg mb-2">{item.text}</p>
                                    <p className="text-xs text-yellow-300">الدليل: {item.evidence}</p>
                                </div>
                            ))}
                        </AccordionItem>
                    ))}
                </div>
            </GlassCard>

            {azkarChallenges.length > 0 && (
                <GlassCard className="animate-fade-in !bg-gradient-to-br from-cyan-500/20 to-teal-500/30">
                    <h3 className="text-xl font-bold text-center mb-2 text-cyan-300">🎯 تحديات أذكار نشطة</h3>
                    <p className="text-center text-sm text-white/80 mb-4">
                        سجّل إنجازك في هذه التحديات مباشرة من هنا.
                    </p>
                    <div className="space-y-4">
                        {azkarChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} onStartChallenge={startChallenge} />
                        ))}
                    </div>
                </GlassCard>
            )}

        </div>
    );
};

export default AzkarPage;