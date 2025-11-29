import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { PrayerMethod } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';

const PrayerMethodsManagementPage: React.FC = () => {
    const { prayerMethods, addPrayerMethod, updatePrayerMethod, deletePrayerMethod } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PrayerMethod | null>(null);

    const openModalForNew = () => {
        setEditingMethod(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (method: PrayerMethod) => {
        setEditingMethod(method);
        setIsModalOpen(true);
    };

    const handleDelete = (methodId: number) => {
        if (window.confirm('هل أنت متأكد من حذف طريقة الحساب هذه؟')) {
            deletePrayerMethod(methodId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">⚙️ إدارة طرق الحساب</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة طريقة جديدة
                </button>
            </div>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prayerMethods.map(method => (
                                <tr key={method.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{method.name}</td>
                                    <td className="p-4 space-x-2 space-x-reverse">
                                        <button onClick={() => openModalForEdit(method)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                        <button onClick={() => handleDelete(method.id)} className="text-red-400 hover:text-red-300">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <MethodFormModal
                    method={editingMethod}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (data) => {
                        if (editingMethod) {
                            await updatePrayerMethod({ ...editingMethod, ...data });
                        } else {
                            await addPrayerMethod(data as Omit<PrayerMethod, 'id'>);
                        }
                        setIsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const MethodFormModal: React.FC<{
    method: PrayerMethod | null;
    onClose: () => void;
    onSave: (data: Partial<PrayerMethod>) => void;
}> = ({ method, onClose, onSave }) => {
    const [name, setName] = useState(method?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({ name });
        }
    };

    return (
        <Modal title={method ? "تعديل طريقة الحساب" : "إضافة طريقة جديدة"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم طريقة الحساب" className="w-full bg-black/30 p-2 rounded" required />
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default PrayerMethodsManagementPage;
