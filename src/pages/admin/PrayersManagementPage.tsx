import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Prayer, Nawafil } from '../../types';
import GlassCard from '../../components/GlassCard';
import FardhPrayerFormModal from '../../components/admin/FardhPrayerFormModal';
import NawafilFormModal from '../../components/admin/NawafilFormModal';

const PrayersManagementPage: React.FC = () => {
    const { prayers, nawafilPrayers, updateFardhPrayer, updateNawafilPrayer } = useAppContext();
    const [isFardhModalOpen, setIsFardhModalOpen] = useState(false);
    const [isNawafilModalOpen, setIsNawafilModalOpen] = useState(false);
    const [editingFardh, setEditingFardh] = useState<Prayer | null>(null);
    const [editingNawafil, setEditingNawafil] = useState<Nawafil | null>(null);

    const handleEditFardh = (prayer: Prayer) => {
        setEditingFardh(prayer);
        setIsFardhModalOpen(true);
    };

    const handleEditNawafil = (nawafil: Nawafil) => {
        setEditingNawafil(nawafil);
        setIsNawafilModalOpen(true);
    };

    const handleSaveFardh = async (data: Prayer) => {
        await updateFardhPrayer(data);
        setIsFardhModalOpen(false);
    };
    
    const handleSaveNawafil = async (data: Nawafil) => {
        await updateNawafilPrayer(data);
        setIsNawafilModalOpen(false);
    };


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">🕌 إدارة الصلوات</h2>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">الصلوات الخمس</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الصلاة</th>
                                <th className="p-4">الفضل</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prayers.map(p => (
                                <tr key={p.name} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{p.emoji} {p.name}</td>
                                    <td className="p-4 text-sm truncate max-w-xs">{p.virtue}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleEditFardh(p)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">النوافل والسنن</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الصلاة</th>
                                <th className="p-4">الدليل</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nawafilPrayers.map(n => (
                                <tr key={n.name} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{n.emoji} {n.name}</td>
                                    <td className="p-4 text-sm truncate max-w-xs">{n.evidence}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleEditNawafil(n)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isFardhModalOpen && (
                <FardhPrayerFormModal
                    prayer={editingFardh}
                    onClose={() => setIsFardhModalOpen(false)}
                    onSave={handleSaveFardh}
                />
            )}
            
            {isNawafilModalOpen && (
                <NawafilFormModal
                    nawafil={editingNawafil}
                    onClose={() => setIsNawafilModalOpen(false)}
                    onSave={handleSaveNawafil}
                />
            )}
        </div>
    );
};

export default PrayersManagementPage;
