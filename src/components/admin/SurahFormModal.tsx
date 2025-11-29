
import React, { useState, useEffect } from 'react';
import { Surah } from '../../types';
import Modal from '../ui/Modal';
import FormField from './FormField';

interface SurahFormModalProps {
    surah: Surah | null;
    onClose: () => void;
    onSave: (data: Surah) => void;
}

const SurahFormModal: React.FC<SurahFormModalProps> = ({ surah, onClose, onSave }) => {
    const [formData, setFormData] = useState<Surah | null>(null);

    useEffect(() => {
        if (surah) {
            setFormData(surah);
        }
    }, [surah]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: type === 'number' ? Number(value) : value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    };

    return (
        <Modal title={`تعديل سورة ${surah?.name}`} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="الاسم الإنجليزي" name="englishName" value={formData.englishName} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="عدد الآيات" name="ayahs" value={formData.ayahs} onChange={handleChange} type="number" required />
                    <FormField label="صفحة البداية" name="startPage" value={formData.startPage} onChange={handleChange} type="number" required />
                </div>
                <FormField 
                    label="نوع النزول" 
                    name="revelationType" 
                    value={formData.revelationType} 
                    onChange={handleChange} 
                    type="select"
                    options={[
                        { value: 'Meccan', label: 'مكية' },
                        { value: 'Medinan', label: 'مدنية' },
                    ]}
                    required 
                />

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default SurahFormModal;
