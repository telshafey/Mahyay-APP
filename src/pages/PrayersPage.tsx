import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PRAYERS, ADDITIONAL_PRAYERS } from '../constants';
import { Prayer, PrayerFardStatus, Nawafil, NawafilStatus } from '../types';
import GlassCard from '../components/GlassCard';

const FardhPrayerDetail: React.FC<{ prayer: Prayer }> = ({ prayer }) => {
    const { dailyData, updatePrayerStatus, updateSunnahStatus, prayerTimes } = useAppContext();
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
                        onClick={() => updatePrayerStatus(prayer.name, btn.key)} 
                        disabled={!isTimeActive}
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
                             <input type="checkbox" checked={status.sunnahBefore} onChange={() => updateSunnahStatus(prayer.name, 'sunnahBefore')} disabled={!isTimeActive} className="w-5 h-5 rounded accent-yellow-400 disabled:cursor-not-allowed"/>
                        </label>
                        <p className="text-xs text-white mt-2 font-amiri pr-2 border-r-2 border-yellow-400/50">{prayer.sunnahBefore.evidence}</p>
                    </GlassCard>
                )}
                 {prayer.sunnahAfter && (
                    <GlassCard className={`!bg-black/20 transition-opacity ${!isTimeActive ? 'opacity-50' : ''}`}>
                        <label className={`flex items-center justify-between ${isTimeActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                            <span className="font-semibold">سنة بعدية ({prayer.sunnahAfter.count} ركعات)</span>
                             <input type="checkbox" checked={status.sunnahAfter} onChange={() => updateSunnahStatus(prayer.name, 'sunnahAfter')} disabled={!isTimeActive} className="w-5 h-5 rounded accent-yellow-400 disabled:cursor-not-allowed"/>
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

    return(
        <GlassCard className="!bg-black/30">
            <h3 className="text-xl font-bold text-white text-center mb-4">{nawafil.emoji} {nawafil.name}</h3>
            {nawafil.isCustom ? (
                <div className="text-center">
                    <label className="text-white mb-2 block">عدد الركعات:</label>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => updateQiyamCount(nawafil.name, -2)} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-bold hover:bg-white/20">-</button>
                        <span className="text-2xl font-bold text-white w-16 text-center">{status.count || 0}</span>
                        <button onClick={() => updateQiyamCount(nawafil.name, 2)} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl font-bold hover:bg-white/20">+</button>
                    </div>
                     <p className="font-amiri text-xs text-white mt-4">{nawafil.evidence}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {nawafil.options?.map((opt, index) => (
                        <div key={index} onClick={() => updateNawafilOption(nawafil.name, index)} className={`p-3 rounded-lg cursor-pointer transition-all ${status.selectedOption === index ? 'bg-yellow-400/30 border border-yellow-300' : 'bg-white/5 hover:bg-white/10'}`}>
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
  const getInitialPrayer = (): Prayer => {
    try {
        const savedPrayerName = sessionStorage.getItem('selectedPrayer');
        if (savedPrayerName) {
            const savedPrayer = PRAYERS.find(p => p.name === savedPrayerName);
            if (savedPrayer) {
                return savedPrayer;
            }
        }
    } catch (error) {
        console.error("Could not read from sessionStorage", error);
    }
    return PRAYERS[0];
  };

  const [selectedPrayer, setSelectedPrayer] = useState<Prayer>(getInitialPrayer);

  useEffect(() => {
    try {
        sessionStorage.setItem('selectedPrayer', selectedPrayer.name);
    } catch (error) {
        console.error("Could not write to sessionStorage", error);
    }
  }, [selectedPrayer]);

  return (
    <div className="space-y-8">
        <GlassCard>
            <h2 className="text-2xl font-bold text-white text-center mb-4">🕌 الصلوات الخمس</h2>
            <div className="grid grid-cols-5 gap-2 mb-6">
                {PRAYERS.map(p => (
                    <button key={p.name} onClick={() => setSelectedPrayer(p)} className={`p-2 rounded-lg transition-all text-white ${selectedPrayer.name === p.name ? 'bg-white/25 scale-105' : 'bg-white/10 hover:bg-white/20'}`}>
                        <div className="text-xl md:text-2xl">{p.emoji}</div>
                        <div className="text-xs font-semibold">{p.name}</div>
                    </button>
                ))}
            </div>
            {selectedPrayer && <FardhPrayerDetail prayer={selectedPrayer} />}
        </GlassCard>

        <GlassCard>
             <h2 className="text-2xl font-bold text-white text-center mb-4">🌙 النوافل والسنن</h2>
             <div className="grid md:grid-cols-2 gap-4">
                 {ADDITIONAL_PRAYERS.map(n => <NawafilCard key={n.name} nawafil={n} />)}
             </div>
        </GlassCard>
    </div>
  );
};

export default PrayersPage;