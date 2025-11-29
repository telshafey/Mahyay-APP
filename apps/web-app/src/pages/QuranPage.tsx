import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext, QURAN_SURAHS } from '@mahyay/core';
import GlassCard from '../components/GlassCard';
import KhatmaProgressChart from '../components/more/KhatmaProgressChart';

const QuranPage: React.FC = () => {
    const { settings, dailyData, updateKhatmaPosition } = useAppContext();
    const currentPosition = settings.khatmaPosition || { surah: 1, ayah: 1 };

    const [selectedSurah, setSelectedSurah] = useState<number>(currentPosition.surah);
    const [selectedAyah, setSelectedAyah] = useState<number>(currentPosition.ayah);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSelectedSurah(currentPosition.surah);
        setSelectedAyah(currentPosition.ayah);
    }, [settings.khatmaPosition]);
    
    const selectedSurahInfo = useMemo(() => {
        return QURAN_SURAHS.find(s => s.id === selectedSurah);
    }, [selectedSurah]);

    const handleSurahChange = (surahId: number) => {
        setSelectedSurah(surahId);
        // Reset ayah to 1 when surah changes
        setSelectedAyah(1);
    };

    const handleSaveProgress = async () => {
        setIsSaving(true);
        await updateKhatmaPosition({ surah: selectedSurah, ayah: selectedAyah });
        setIsSaving(false);
    };

    const currentSurahName = QURAN_SURAHS.find(s => s.id === currentPosition.surah)?.name || '...';
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">📖 القرآن الكريم</h2>

            <GlassCard className="text-center">
                <h3 className="text-lg font-semibold text-white/90">آخر موضع وصلت إليه في ختمتك</h3>
                <p className="font-amiri text-3xl font-bold text-yellow-300 my-2">
                    سورة {currentSurahName} - آية {currentPosition.ayah}
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-yellow-300 font-semibold">التقدم اليومي المحسوب: {dailyData.quranPagesRead || 0} / {settings.quranGoal} صفحات</p>
                    <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                        <div 
                            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full" 
                            style={{width: `${Math.min((dailyData.quranPagesRead / settings.quranGoal) * 100, 100)}%`}}>
                        </div>
                    </div>
                </div>
            </GlassCard>
            
            <div className="grid md:grid-cols-2 gap-6">
                <GlassCard>
                     <h3 className="text-xl font-bold text-white text-center mb-4">تسجيل التقدم الجديد</h3>
                     <div className="space-y-4">
                        <div>
                            <label htmlFor="surah-select" className="block text-sm font-semibold mb-2 text-white/90">
                                السورة
                            </label>
                             <select
                                id="surah-select"
                                value={selectedSurah}
                                onChange={e => handleSurahChange(Number(e.target.value))}
                                className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-3 text-white"
                            >
                                {QURAN_SURAHS.map(surah => (
                                    <option key={surah.id} value={surah.id} style={{ backgroundColor: '#2d5a47' }}>
                                        {surah.id}. {surah.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="ayah-select" className="block text-sm font-semibold mb-2 text-white/90">
                                الآية
                            </label>
                             <select
                                id="ayah-select"
                                value={selectedAyah}
                                onChange={e => setSelectedAyah(Number(e.target.value))}
                                className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-3 text-white"
                            >
                                {selectedSurahInfo && Array.from({ length: selectedSurahInfo.ayahs }, (_, i) => i + 1).map(ayahNum => (
                                     <option key={ayahNum} value={ayahNum} style={{ backgroundColor: '#2d5a47' }}>
                                        {ayahNum}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleSaveProgress}
                            disabled={isSaving}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex justify-center items-center"
                        >
                            {isSaving ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div> : '💾 حفظ التقدم'}
                        </button>
                     </div>
                </GlassCard>
                <KhatmaProgressChart />
            </div>
        </div>
    );
};

export default QuranPage;
