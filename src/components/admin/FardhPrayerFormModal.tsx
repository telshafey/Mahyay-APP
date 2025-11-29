
import React, { useState, useEffect } from 'react';
import { Prayer } from '../../types';
import Modal from '../ui/Modal';
import FormField from './FormField';

interface FardhPrayerFormModalProps {
    prayer: Prayer | null;
    onClose: () => void;
    onSave: (data: Prayer) => void;
}

const FardhPrayerFormModal: React.FC<FardhPrayerFormModalProps> = ({ prayer, onClose, onSave }) => {
    const [formData, setFormData] = useState<Prayer | null>(null);

    useEffect(() => {
        if (prayer) {
            setFormData(prayer);
        }
    }, [prayer]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => {
                if (!prev) return null;
                const parentData = prev[parent as keyof Prayer] as { count: number; evidence: string } | undefined;
                return {
                    ...prev,
                    [parent]: {
                        ...parentData,
                        [child]: type === 'number' ? Number(value) : value
                    }
                };
            });
        } else {
            setFormData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <Modal title={`تعديل صلاة ${prayer?.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="الأيقونة" name="emoji" value={formData.emoji} onChange={handleChange} required />
                <FormField label="الفضل" name="virtue" value={formData.virtue} onChange={handleChange} type="textarea" required />

                {formData.sunnahBefore !== undefined && (
                    <div className="p-3 border border-white/20 rounded-lg space-y-3">
                        <h4 className="font-bold text-yellow-300">السنة القبلية</h4>
                        <FormField label="عدد الركعات" name="sunnahBefore.count" value={formData.sunnahBefore?.count || 0} onChange={handleChange} type="number" />
                        <FormField label="الدليل" name="sunnahBefore.evidence" value={formData.sunnahBefore?.evidence || ''} onChange={handleChange} />
                    </div>
                )}
                
                {formData.sunnahAfter !== undefined && (
                    <div className="p-3 border border-white/20 rounded-lg space-y-3">
                        <h4 className="font-bold text-yellow-300">السنة البعدية</h4>
                        <FormField label="عدد الركعات" name="sunnahAfter.count" value={formData.sunnahAfter?.count || 0} onChange={handleChange} type="number" />
                        <FormField label="الدليل" name="sunnahAfter.evidence" value={formData.sunnahAfter?.evidence || ''} onChange={handleChange} />
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default FardhPrayerFormModal;
