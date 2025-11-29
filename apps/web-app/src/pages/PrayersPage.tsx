import React, { useState, useEffect } from 'react';
import { useAppContext, usePrayerTimesContext, Prayer, PrayerFardStatus, Nawafil, NawafilStatus, storage } from '@mahyay/core';
import GlassCard from '../components/GlassCard';

const FardhPrayerDetail: React.FC<{ prayer: Prayer }> = ({ prayer }) => {
    const { dailyData, updatePrayerStatus, updateSunnahStatus } = useAppContext();
    const { prayerTimes } = usePrayerTimesContext();
    const [isUpdating, setIsUpdating] = useState(false);
    const status = dailyData.prayerData[prayer.name];

    const prayerTimeStr = prayerTimes[prayer.name];
    const now = new Date();

    let isTimeActive = false;
    if (prayerTimeStr) {
        const [h, m] = prayerTimeStr.split(':').map(Number);
        const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        if (now >= prayerDateTime) {
            isTimeActive = true;
        }
    }
    
    const handleUpdateStatus = async (newStatus: PrayerFardStatus) => {
        setIsUpdating(true);
        await updatePrayerStatus(prayer.name, newStatus);
        setIsUpdating(false);
    }
    
    const handleUpdateSunnah = async (type: 'sunnahBefore' | 'sunnahAfter') => {
        setIsUpdating(true);
        await updateSunnahStatus(prayer.name, type);
        setIsUpdating(false);
    }

    const statusButtons: { key: PrayerFardStatus; label: string; style: string }[] = [
        { key: 'early', label: '🌟 أول الوقت', style: 'bg-green-400/80 border-green-300 text-green-900' },
        { key: 'ontime', label: '✅ في الوقت', style: 'bg-yellow-400/80 border-yellow-300 text-yellow-900' },
        { key: 'late', label: '⚠️ بعد الوقت', style: 'bg-orange-400/80 border-orange-300 text-orange-900' },
        { key: 'missed', label: '❌ لم أصل', style: 'bg-red-400/80 border-red-300 text-red-900' },
    ];

    return (
        <div className="text-white text-center space-y-6">
            <h3 className="text-4xl font-amiri">{prayer.emoji} {prayer.name}</h3>
            <p className="text-2xl font-semibold">{prayerTimeStr || '...'}</p>
            
            {!isTimeActive && (
                <div className="p-3 bg-yellow-900/50 border border-yellow-400/50 rounded-lg text-yellow-300 font-semibold">
                    لم يحن وقت الصلاة بعد
                </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
                {statusButtons.map(btn => (
                    <button 
                        key={btn.key} 
                        onClick={() => handleUpdateStatus(btn.key)} 
                        disabled={!isTimeActive || isUpdating}
                        className={`px-4 py-2 rounded-full font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${status.fard === btn.key ? `${btn.style} scale-110 shadow-lg` : 'bg-white/10 hover:bg-white/20 border-white/20'}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                {prayer.sunnahBefore && (
                    <GlassCard className={`!bg-black/20 transition-opacity ${!isTimeActive ? 'opacity-50' : ''}`}>
                        <label className={`flex items-center justify-between ${isTimeActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <span className="font-semibold">سنة قبلية ({prayer.sunnahBefore.count} ركعات)</span>
                             <input type="checkbox" checked={status.sunnahBefore} onChange={() => handleUpdateSunnah('sunnahBefore')} disabled={!isTimeActive || isUpdating} className="w-5 h-5 rounded accent-yellow-400 disabled:cursor-not-allowed"/>
                        </label>
                        <p className="text-xs text-white mt-2 font-amiri pr-2 border-r-2 border-yellow-400/50">{prayer.sunnahBefore.evidence}</p>
                    </GlassCard>
                )}
                 {prayer.sunnahAfter && (
                    <GlassCard className={`!bg-black/20 transition-opacity ${!isTimeActive ? 'opacity-50' : ''}`}>
                        <label className={`flex items-center justify-between ${isTimeActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <span className="font-semibold">سنة بعدية ({prayer.sunnahAfter.count} ركعات)</span>
                             <input type="checkbox" checked={status.sunnahAfter} onChange={() => handleUpdateSunnah('sunnahAfter')} disabled={!isTimeActive || isUpdating} className="w-5 h-5 rounded accent-yellow-400 disabled:cursor-not-allowed"/>
                        </label>
                        <p className="text-xs text-white mt-2 font-amiri pr-2 border-r-2 border-yellow-400/50">{prayer.sunnahAfter.evidence}</p>
                    </GlassCard>
                )}
            </div>

             <GlassCard className="!bg-black/20 text-right">
                <h4 className="font-semibold mb-2 text-yellow-300">✨ فضل الصلاة</h4>
                <p className="font-amiri text-sm leading-relaxed text-white">{prayer.virtue}</p>
            </GlassCard>
        </div>
    );
};


const NawafilCard: React.FC<{ nawafil: Nawafil }> = ({ nawafil }) => {
    const { dailyData, updateNawafilOption, updateQiyamCount } = useAppContext();
    const status: NawafilStatus = dailyData.nawafilData[nawafil.name] || {};
    const [isUpdating, setIsUpdating] = useState(false);
    
    const handleUpdateOption = async (index: number) => {
        setIsUpdating(true);
        await updateNawafilOption(nawafil.name, index);
        setIsUpdating(false);
    }
    
    const handleUpdateCount = async (change: number) => {
        setIsUpdating(true);
        await updateQiyamCount(nawafil.name, change);
        setIsUpdating(false);
    }


    return(
        <GlassCard className="!bg-black/30">
            <h3 className="text-xl font-bold text-white text-center mb-4">{nawafil.emoji} {nawafil.name}</h3>
            {nawafil.isCustom ? (
                <div className="text-center">
                    <label className="text-white mb-2 block">عدد الركعات:</label>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleUpdateCount(-2)} disabled={isUpdating} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-bold hover:bg-white/20 disabled:opacity-50" aria-label="إنقاص عدد الركعات">-</button>
                        <span className="text-2xl font-bold text-white w-16 text-center">{status.count || 0}</span>
                        <button onClick={() => handleUpdateCount(2)} disabled={isUpdating} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-bold hover:bg-white/20 disabled:opacity-50" aria-label="زيادة عدد الركعات">+</button>
                    </div>
                     <p className="font-amiri text-xs text-white mt-4">{nawafil.evidence}</p>
                </div>
            ) : (
                <div className={`space-y-3 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
                    {nawafil.options?.map((opt, index) => (
                        <div key={index} onClick={() => handleUpdateOption(index)} className={`p-3 rounded-lg cursor-pointer transition-all ${status.selectedOption === index ? 'bg-yellow-400/30 border border-yellow-300' : 'bg-white/5 hover:bg-white/10'}`}>
                            <p className="font-semibold text-white">{opt.count} ركعات</p>
                            <p className="font-amiri text-xs text-white">{opt.evidence}</p>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    )
}

const PrayersPage: React.FC = () => {
  const { prayers, nawafilPrayers } = useAppContext();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  useEffect(() => {
    const loadInitialPrayer = async () => {
        const savedPrayerName = await storage.getItem('selectedPrayer');
        const savedPrayer = savedPrayerName ? prayers.find(p => p.name === savedPrayerName) : null;
        setSelectedPrayer(savedPrayer || prayers[0]);
    };
    if (prayers.length > 0) {
        loadInitialPrayer();
    }
  }, [prayers]);

  useEffect(() => {
    if (selectedPrayer) {
        storage.setItem('selectedPrayer', selectedPrayer.name);
    }
  }, [selectedPrayer]);

  if (!selectedPrayer) {
      return null; // or a loading indicator
  }

  return (
    <div className="space-y-8">
        <GlassCard>
            <h2 className="text-2xl font-bold text-white text-center mb-4">🕌 الصلوات الخمس</h2>
            <div className="grid grid-cols-5 gap-2 mb-6">
                {prayers.map(p => (
                    <button key={p.name} onClick={() => setSelectedPrayer(p)} className={`p-2 rounded-lg transition-all text-white ${selectedPrayer.name === p.name ? 'bg-white/25 scale-105' : 'bg-white/10 hover:bg-white/20'}`}>
                        <div className="text-xl md:text-2xl">{p.emoji}</div>
                        <div className="text-xs font-semibold">{p.name}</div>
                    </button>
                ))}
            </div>
            <div key={selectedPrayer.name} className="animate-fade-in-down">
                <FardhPrayerDetail prayer={selectedPrayer} />
            </div>
        </GlassCard>

        <GlassCard>
             <h2 className="text-2xl font-bold text-white text-center mb-4">🌙 النوافل والسنن</h2>
             <div className="grid md:grid-cols-2 gap-4">
                 {nawafilPrayers.map(n => <NawafilCard key={n.name} nawafil={n} />)}
             </div>
        </GlassCard>
    </div>
  );
};

export default PrayersPage;
