

import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
// FIX: Import renamed PrayerMethod type
import { PrayerMethod } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/admin/FormField';

const PrayerMethodsManagementPage: React.FC = () => {
    // FIX: Use correct property names from context
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
    
    // FIX: Simplify handleSave logic
    const handleSave = async (data: PrayerMethod) => {
        if (editingMethod) {
            await updatePrayerMethod({ ...editingMethod, ...data });
        } else {
            await addPrayerMethod(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">⚙️ إدارة طرق حساب الصلاة</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة طريقة جديدة
                </button>
            </div>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prayerMethods.map(method => (
                                <tr key={method.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{method.id}</td>
                                    <td className="p-4">{method.name}</td>
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
                <PrayerMethodFormModal
                    method={editingMethod}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const PrayerMethodFormModal: React.FC<{
    method: PrayerMethod | null;
    onClose: () => void;
    // FIX: Simplify onSave prop type
    onSave: (data: PrayerMethod) => void;
}> = ({ method, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: method?.name || '',
        id: method?.id || 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Simplify submission logic
        onSave(formData);
    };

    return (
        <Modal title={method ? "تعديل طريقة الحساب" : "إضافة طريقة حساب جديدة"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="ID" name="id" value={formData.id} onChange={handleChange} type="number" required />
                <FormField label="الاسم" name="name" value={formData.name} onChange={handleChange} required />
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default PrayerMethodsManagementPage;