import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Surah } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';
import SurahFormModal from '../../components/admin/SurahFormModal';

const QuranManagementPage: React.FC = () => {
    const { quranSurahs, updateSurah } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSurah, setEditingSurah] = useState<Surah | null>(null);

    const openModalForEdit = (surah: Surah) => {
        setEditingSurah(surah);
        setIsModalOpen(true);
    };
    
    const handleSave = async (data: Surah) => {
        await updateSurah(data);
        setIsModalOpen(false);
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">📖 إدارة القرآن</h2>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">#</th>
                                <th className="p-4">السورة</th>
                                <th className="p-4">الآيات</th>
                                <th className="p-4">النوع</th>
                                <th className="p-4">صفحة البداية</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quranSurahs.map(surah => (
                                <tr key={surah.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4">{surah.id}</td>
                                    <td className="p-4 font-semibold">{surah.name}</td>
                                    <td className="p-4">{surah.ayahs}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${surah.revelationType === 'Meccan' ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}>
                                            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                        </span>
                                    </td>
                                    <td className="p-4">{surah.startPage}</td>
                                    <td className="p-4">
                                        <button onClick={() => openModalForEdit(surah)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            
            {isModalOpen && editingSurah && (
                <SurahFormModal
                    surah={editingSurah}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default QuranManagementPage;