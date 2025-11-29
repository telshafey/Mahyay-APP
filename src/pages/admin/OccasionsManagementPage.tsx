import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { IslamicOccasion } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';

const OccasionsManagementPage: React.FC = () => {
    const { islamicOccasions, addIslamicOccasion, updateIslamicOccasion, deleteIslamicOccasion } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOccasion, setEditingOccasion] = useState<IslamicOccasion | null>(null);

    const openModalForNew = () => {
        setEditingOccasion(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (occasion: IslamicOccasion) => {
        setEditingOccasion(occasion);
        setIsModalOpen(true);
    };

    const handleDelete = (occasionId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذه المناسبة؟')) {
            deleteIslamicOccasion(occasionId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">🗓️ إدارة المناسبات</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة مناسبة جديدة
                </button>
            </div>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">التاريخ الهجري</th>
                                <th className="p-4">الوصف</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {islamicOccasions.map(occasion => (
                                <tr key={occasion.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{occasion.name}</td>
                                    <td className="p-4">{occasion.hijriDay}/{occasion.hijriMonth}</td>
                                    <td className="p-4 text-sm">{occasion.description}</td>
                                    <td className="p-4 space-x-2 space-x-reverse">
                                        <button onClick={() => openModalForEdit(occasion)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                        <button onClick={() => handleDelete(occasion.id)} className="text-red-400 hover:text-red-300">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <OccasionFormModal
                    occasion={editingOccasion}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data) => {
                        if (editingOccasion) {
                            await updateIslamicOccasion({ ...editingOccasion, ...data });
                        } else {
                            await addIslamicOccasion(data as Omit<IslamicOccasion, 'id'>);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const OccasionFormModal: React.FC<{
    occasion: IslamicOccasion | null;
    onClose: () => void;
    onSave: (data: Partial<IslamicOccasion>) => void;
}> = ({ occasion, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: occasion?.name || '',
        description: occasion?.description || '',
        hijriDay: occasion?.hijriDay || 1,
        hijriMonth: occasion?.hijriMonth || 1,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal title={occasion ? "تعديل المناسبة" : "إضافة مناسبة جديدة"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="اسم المناسبة" className="w-full bg-black/30 p-2 rounded" required />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="الوصف" className="w-full bg-black/30 p-2 rounded" required />
                <div className="grid grid-cols-2 gap-4">
                    <input name="hijriDay" type="number" value={formData.hijriDay} onChange={handleChange} placeholder="اليوم" min="1" max="30" className="w-full bg-black/30 p-2 rounded" required />
                    <input name="hijriMonth" type="number" value={formData.hijriMonth} onChange={handleChange} placeholder="الشهر" min="1" max="12" className="w-full bg-black/30 p-2 rounded" required />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default OccasionsManagementPage;
