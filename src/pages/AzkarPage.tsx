import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AZKAR_DATA } from '../constants';
import { Zikr, DailyAzkarCategory, AzkarCategory } from '../types';
import GlassCard from '../components/GlassCard';
import Accordion from '../components/ui/Accordion';

const ZikrItemCard: React.FC<{
    zikr: Zikr;
    categoryName: DailyAzkarCategory;
}> = ({ zikr, categoryName }) => {
    const { dailyData, incrementAzkarCount, completeZikr } = useAppContext();
    
    const currentCount = dailyData.azkarStatus[categoryName]?.[zikr.id] || 0;
    const isDone = currentCount >= zikr.repeat;

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDone) {
            incrementAzkarCount(categoryName, zikr.id);
        }
    };
    
    const handleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isDone) {
            completeZikr(categoryName, zikr.id);
        }
    }

    const progressPercentage = (currentCount / zikr.repeat) * 100;
    
    // New logic: Use counter for low repeats (<= 3), single button for high repeats.
    const needsCounter = zikr.repeat > 1 && zikr.repeat <= 3;

    return (
        <div className={`relative p-4 rounded-lg overflow-hidden transition-all duration-300 ${isDone ? 'bg-green-500/20' : 'bg-black/20'}`}>
            <div 
                className="absolute top-0 right-0 bottom-0 bg-green-500/30 transition-all duration-500"
                style={{ width: `${isDone ? 100 : progressPercentage}%` }}
            ></div>
            <div className="relative z-10">
                <p className="font-amiri text-lg leading-relaxed text-white mb-3 whitespace-pre-wrap">{zikr.text}</p>
                {zikr.notes && <p className="text-sm text-yellow-300 mb-2">({zikr.notes})</p>}
                <p className="text-xs text-white/80 mb-4 font-amiri pr-2 border-r-2 border-yellow-400/50">{zikr.reference}</p>
                
                {needsCounter ? (
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleIncrement}
                            disabled={isDone}
                            className="w-24 h-12 rounded-lg bg-yellow-500 text-green-900 font-bold text-lg disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            {isDone ? 'أتممت ✅' : `سبّح (${currentCount})`}
                        </button>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{zikr.repeat}</p>
                            <p className="text-xs text-white/70">مرات</p>
                        </div>
                    </div>
                ) : (
                     <button
                        onClick={handleComplete}
                        disabled={isDone}
                        className="w-full h-12 rounded-lg bg-yellow-500 text-green-900 font-bold text-lg disabled:bg-gray-500/50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {isDone ? 'أتممت الذكر ✅' : 'أتممت الذكر'}
                    </button>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full py-2 px-1 text-xs sm:text-sm rounded-lg font-semibold transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 ${isActive ? 'bg-yellow-400/80 text-green-900 scale-105' : 'text-white/80 hover:bg-white/10'}`}>
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

const AzkarPage: React.FC = () => {
    const { dailyData, settings } = useAppContext();
    const [activeTab, setActiveTab] = useState<AzkarCategory['name']>('أذكار الصباح');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        morning: morningAzkar,
        evening: eveningAzkar,
        sleep: sleepingAzkar,
        wakeup: wakingAzkar,
        general: generalAzkar
    } = useMemo(() => ({
        morning: AZKAR_DATA.find(c => c.name === 'أذكار الصباح')!,
        evening: AZKAR_DATA.find(c => c.name === 'أذكار المساء')!,
        sleep: AZKAR_DATA.find(c => c.name === 'أذكار النوم')!,
        wakeup: AZKAR_DATA.find(c => c.name === 'أذكار الاستيقاظ')!,
        general: AZKAR_DATA.find(c => c.name === 'أذكار عامة')!
    }), []);

    useEffect(() => {
        const now = new Date();
        const morningTime = settings.azkarMorningStart.split(':').map(Number);
        const eveningTime = settings.azkarEveningStart.split(':').map(Number);
        const morningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), morningTime[0], morningTime[1]);
        const eveningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eveningTime[0], eveningTime[1]);

        if (now >= morningDate && now < eveningDate) {
            setActiveTab('أذكار الصباح');
        } else {
            setActiveTab('أذكار المساء');
        }
    }, [settings.azkarMorningStart, settings.azkarEveningStart]);
    
    const filteredGeneralAzkar = useMemo(() => {
        if (!searchTerm.trim()) return generalAzkar.items;
        return generalAzkar.items.filter(zikr => 
            zikr.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
            zikr.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, generalAzkar.items]);
    
    const dailyCategories = useMemo(() => [
        { name: morningAzkar.name, category: morningAzkar, icon: '🌅' },
        { name: eveningAzkar.name, category: eveningAzkar, icon: '🌃' },
        { name: sleepingAzkar.name, category: sleepingAzkar, icon: '😴' },
        { name: wakingAzkar.name, category: wakingAzkar, icon: '🌤️' }
    ], [morningAzkar, eveningAzkar, sleepingAzkar, wakingAzkar]);

    const isCategoryComplete = (category: AzkarCategory) => {
        const categoryProgress = dailyData.azkarStatus[category.name as DailyAzkarCategory];
        if (!categoryProgress) return false;
        return category.items.every(item => (categoryProgress[item.id] || 0) >= item.repeat);
    }

    const renderAzkarList = (category: AzkarCategory) => {
        if (isCategoryComplete(category)) {
            return (
                <GlassCard className="text-center py-10 animate-fade-in !bg-green-500/20">
                     <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-white">ما شاء الله! لقد أتممت {category.name}.</h3>
                    <p className="text-white/80 mt-2">جزاك الله خيرًا، ونفعك بها.</p>
                </GlassCard>
            );
        }
        return (
            <div className="space-y-4">
                {category.items.map(zikr => (
                    <ZikrItemCard key={zikr.id} zikr={zikr} categoryName={category.name as DailyAzkarCategory} />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">📿 الأذكار والأدعية</h2>

            <GlassCard className="!p-2">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                    {dailyCategories.map(cat => (
                         <TabButton key={cat.name} label={cat.name.replace('أذكار ', '')} icon={cat.icon} isActive={activeTab === cat.name} onClick={() => setActiveTab(cat.name)} />
                    ))}
                    <TabButton label="عامة" icon="🤲" isActive={activeTab === 'أذكار عامة'} onClick={() => setActiveTab('أذكار عامة')} />
                </div>
            </GlassCard>
            
            {dailyCategories.map(cat => activeTab === cat.name && <div key={cat.name} className="animate-fade-in">{renderAzkarList(cat.category)}</div>)}
            
            {activeTab === 'أذكار عامة' && (
                <div className="space-y-4 animate-fade-in">
                     <GlassCard>
                        <div className="relative">
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث في الأذكار العامة..."
                                className="w-full bg-black/30 border border-white/20 rounded-full px-5 py-3 pr-12 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                             <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/80">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                    </GlassCard>
                    {filteredGeneralAzkar.length > 0 ? (
                        filteredGeneralAzkar.map(zikr => (
                             <Accordion key={zikr.id} title={<span className="font-semibold">{zikr.notes || zikr.text.substring(0, 30)+'...'}</span>}>
                                <div className="p-4 pt-0 text-white/90 border-t border-white/10 space-y-3">
                                    <p className="font-amiri text-lg leading-relaxed text-white whitespace-pre-wrap">{zikr.text}</p>
                                    <p className="text-xs text-yellow-300 font-amiri pr-2 border-r-2 border-yellow-400/50">{zikr.reference}</p>
                                </div>
                             </Accordion>
                        ))
                    ) : (
                        <GlassCard className="text-center text-white/80 py-4">لم يتم العثور على نتائج لبحثك.</GlassCard>
                    )}
                </div>
            )}
        </div>
    );
};

export default AzkarPage;
