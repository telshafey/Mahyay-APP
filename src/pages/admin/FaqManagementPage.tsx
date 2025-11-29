
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { FAQ } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/admin/FormField';

const FaqManagementPage: React.FC = () => {
    const { faqs, addFaq, updateFaq, deleteFaq } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const openModalForNew = () => {
        setEditingFaq(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setIsModalOpen(true);
    };

    const handleDelete = (faqId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            deleteFaq(faqId);
        }
    };

    const handleSave = async (data: Omit<FAQ, 'id'> | FAQ) => {
        if ('id' in data) {
            await updateFaq(data);
        } else {
            await addFaq(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">🆘 إدارة الأسئلة الشائعة</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة سؤال جديد
                </button>
            </div>
            
            <GlassCard>
                <div className="space-y-4">
                    {faqs.map(faq => (
                        <div key={faq.id} className="p-4 bg-black/20 rounded-lg">
                            <p className="font-bold text-white">{faq.q}</p>
                            <p className="text-white/80 mt-2">{faq.a}</p>
                            <div className="flex justify-end gap-4 mt-4 pt-2 border-t border-white/10">
                                <button onClick={() => openModalForEdit(faq)} className="text-yellow-400 hover:text-yellow-300 font-semibold">تعديل</button>
                                <button onClick={() => handleDelete(faq.id)} className="text-red-400 hover:text-red-300 font-semibold">حذف</button>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {isModalOpen && (
                <FaqFormModal
                    faq={editingFaq}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const FaqFormModal: React.FC<{
    faq: FAQ | null;
    onClose: () => void;
    onSave: (data: Omit<FAQ, 'id'> | FAQ) => void;
}> = ({ faq, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        q: faq?.q || '',
        a: faq?.a || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (faq) {
            onSave({ ...faq, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <Modal title={faq ? "تعديل السؤال" : "إضافة سؤال جديد"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <FormField label="السؤال" name="q" value={formData.q} onChange={handleChange} required />
                <FormField label="الإجابة" name="a" value={formData.a} onChange={handleChange} type="textarea" required />
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default FaqManagementPage;
