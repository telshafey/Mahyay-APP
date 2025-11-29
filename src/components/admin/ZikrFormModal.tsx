
import React, { useState } from 'react';
import { Zikr, AzkarCategory } from '../../types';
import Modal from '../ui/Modal';
import FormField from './FormField';

interface ZikrFormModalProps {
    zikr: Zikr | null;
    categoryName: AzkarCategory['name'] | null;
    onClose: () => void;
    onSave: (data: Omit<Zikr, 'id' | 'category'>) => void;
}

const ZikrFormModal: React.FC<ZikrFormModalProps> = ({ zikr, categoryName, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        text: zikr?.text || '',
        repeat: zikr?.repeat || 1,
        reference: zikr?.reference || '',
        notes: zikr?.notes || '',
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
        <Modal title={zikr ? "تعديل الذكر" : `إضافة ذكر جديد إلى ${categoryName}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="نص الذكر" name="text" value={formData.text} onChange={handleChange} type="textarea" rows={5} required />
                <FormField label="المرجع" name="reference" value={formData.reference} onChange={handleChange} required />
                <FormField label="ملاحظات (اختياري)" name="notes" value={formData.notes} onChange={handleChange} />
                <FormField label="التكرار" name="repeat" value={formData.repeat} onChange={handleChange} type="number" required />
                
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default ZikrFormModal;
