
import React, { useState, useEffect } from 'react';
import { Nawafil } from '../../types';
import Modal from '../ui/Modal';
import FormField from './FormField';

interface NawafilFormModalProps {
    nawafil: Nawafil | null;
    onClose: () => void;
    onSave: (data: Nawafil) => void;
}

const NawafilFormModal: React.FC<NawafilFormModalProps> = ({ nawafil, onClose, onSave }) => {
    const [formData, setFormData] = useState<Nawafil | null>(null);

    useEffect(() => {
        if (nawafil) {
            setFormData(nawafil);
        }
    }, [nawafil]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleOptionChange = (index: number, field: 'count' | 'evidence', value: string | number) => {
        setFormData(prev => {
            if (!prev || !prev.options) return prev;
            const newOptions = [...prev.options];
            newOptions[index] = { ...newOptions[index], [field]: typeof value === 'string' ? value : Number(value) };
            return { ...prev, options: newOptions };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <Modal title={`تعديل صلاة ${nawafil?.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="الأيقونة" name="emoji" value={formData.emoji} onChange={handleChange} required />
                <FormField label="الدليل/الفضل العام" name="evidence" value={formData.evidence} onChange={handleChange} type="textarea" required />

                {formData.options && formData.options.length > 0 && (
                     <div className="p-3 border border-white/20 rounded-lg space-y-4">
                        <h4 className="font-bold text-yellow-300">الخيارات</h4>
                        {formData.options.map((option, index) => (
                            <div key={index} className="p-2 bg-black/20 rounded-md space-y-2">
                                <FormField 
                                    label={`خيار ${index + 1}: عدد الركعات`}
                                    name={`option_count_${index}`} 
                                    value={option.count}
                                    onChange={(e) => handleOptionChange(index, 'count', Number(e.target.value))}
                                    type="number" 
                                />
                                <FormField 
                                    label={`خيار ${index + 1}: الدليل`}
                                    name={`option_evidence_${index}`}
                                    value={option.evidence}
                                    onChange={(e) => handleOptionChange(index, 'evidence', e.target.value)}
                                />
                            </div>
                        ))}
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

export default NawafilFormModal;
