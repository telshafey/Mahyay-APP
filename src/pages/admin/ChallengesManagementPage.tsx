import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BaseChallenge } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';

const ChallengesManagementPage: React.FC = () => {
    const { challenges, addChallenge, updateChallenge, deleteChallenge } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChallenge, setEditingChallenge] = useState<BaseChallenge | null>(null);

    const openModalForNew = () => {
        setEditingChallenge(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (challenge: BaseChallenge) => {
        setEditingChallenge(challenge);
        setIsModalOpen(true);
    };

    const handleDelete = (challengeId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا التحدي؟')) {
            deleteChallenge(challengeId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">🏆 إدارة التحديات</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة تحدي جديد
                </button>
            </div>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الأيقونة</th>
                                <th className="p-4">العنوان</th>
                                <th className="p-4">النقاط</th>
                                <th className="p-4">المدة</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {challenges.map(challenge => (
                                <tr key={challenge.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 text-2xl">{challenge.icon}</td>
                                    <td className="p-4 font-semibold">{challenge.title}</td>
                                    <td className="p-4">{challenge.points}</td>
                                    <td className="p-4">{challenge.durationDays} أيام</td>
                                    <td className="p-4 space-x-2 space-x-reverse">
                                        <button onClick={() => openModalForEdit(challenge)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                        <button onClick={() => handleDelete(challenge.id)} className="text-red-400 hover:text-red-300">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <ChallengeFormModal
                    challenge={editingChallenge}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data) => {
                        if (editingChallenge) {
                            await updateChallenge({ ...editingChallenge, ...data });
                        } else {
                            await addChallenge(data as Omit<BaseChallenge, 'id'>);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const ChallengeFormModal: React.FC<{
    challenge: BaseChallenge | null;
    onClose: () => void;
    onSave: (data: Partial<BaseChallenge>) => void;
}> = ({ challenge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: challenge?.title || '',
        description: challenge?.description || '',
        icon: challenge?.icon || '🏆',
        points: challenge?.points || 100,
        durationDays: challenge?.durationDays || 7,
        target: challenge?.target || 7,
        tracking: challenge?.tracking || 'manual',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={challenge ? "تعديل التحدي" : "إضافة تحدي جديد"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <input name="title" value={formData.title} onChange={handleChange} placeholder="العنوان" className="w-full bg-black/30 p-2 rounded" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="الوصف" className="w-full bg-black/30 p-2 rounded" required />
                <div className="grid grid-cols-2 gap-4">
                    <input name="icon" value={formData.icon} onChange={handleChange} placeholder="الأيقونة (emoji)" className="w-full bg-black/30 p-2 rounded" required />
                    <input name="points" type="number" value={formData.points} onChange={handleChange} placeholder="النقاط" className="w-full bg-black/30 p-2 rounded" required />
                    <input name="durationDays" type="number" value={formData.durationDays} onChange={handleChange} placeholder="المدة (أيام)" className="w-full bg-black/30 p-2 rounded" required />
                    <input name="target" type="number" value={formData.target} onChange={handleChange} placeholder="الهدف (مرات)" className="w-full bg-black/30 p-2 rounded" required />
                </div>
                <select name="tracking" value={formData.tracking} onChange={handleChange} className="w-full bg-black/30 p-2 rounded">
                    <option value="manual">يدوي</option>
                    <option value="auto">تلقائي</option>
                </select>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default ChallengesManagementPage;
