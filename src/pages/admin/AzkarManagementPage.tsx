import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { AzkarCategory, Zikr } from '../../types';
import GlassCard from '../../components/GlassCard';
import Accordion from '../../components/ui/Accordion';
import ZikrFormModal from '../../components/admin/ZikrFormModal';

const AzkarManagementPage: React.FC = () => {
    const { azkarData, addZikr, updateZikr, deleteZikr, addAzkarCategory, deleteAzkarCategory } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZikr, setEditingZikr] = useState<Zikr | null>(null);
    const [currentCategory, setCurrentCategory] = useState<AzkarCategory['name'] | null>(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    const openModalForNew = (categoryName: AzkarCategory['name']) => {
        setEditingZikr(null);
        setCurrentCategory(categoryName);
        setIsModalOpen(true);
    };

    const openModalForEdit = (zikr: Zikr, categoryName: AzkarCategory['name']) => {
        setEditingZikr(zikr);
        setCurrentCategory(categoryName);
        setIsModalOpen(true);
    };

    const handleDelete = (zikrId: number, categoryName: AzkarCategory['name']) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الذكر؟')) {
            deleteZikr(categoryName, zikrId);
        }
    };
    
    const handleSave = async (data: Omit<Zikr, 'id'|'category'>) => {
        if (editingZikr && currentCategory) {
            await updateZikr(currentCategory, {...editingZikr, ...data});
        } else if (currentCategory) {
            await addZikr(currentCategory, data);
        }
        setIsModalOpen(false);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            await addAzkarCategory(newCategoryName as AzkarCategory['name']);
            setNewCategoryName('');
        }
    };
    
    const handleDeleteCategory = async (name: AzkarCategory['name']) => {
        if(window.confirm(`هل أنت متأكد من حذف فئة "${name}" وكل الأذكار بداخلها؟`)){
            await deleteAzkarCategory(name);
        }
    }


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">📿 إدارة الأذكار</h2>

             <GlassCard>
                <form onSubmit={handleAddCategory} className="flex gap-4">
                    <input 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="اسم الفئة الجديدة..."
                        className="flex-grow bg-black/30 p-2 rounded border border-white/20"
                    />
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg">
                        + إضافة فئة
                    </button>
                </form>
            </GlassCard>
            
            <div className="space-y-4">
                {azkarData.map(category => (
                    <GlassCard key={category.name}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">{category.name}</h3>
                            <div>
                                <button onClick={() => openModalForNew(category.name)} className="text-yellow-400 hover:text-yellow-300 font-semibold mr-4">+ ذكر جديد</button>
                                <button onClick={() => handleDeleteCategory(category.name)} className="text-red-400 hover:text-red-300 font-semibold">حذف الفئة</button>
                            </div>
                        </div>
                        {category.items.map(zikr => (
                             <Accordion key={zikr.id} title={<span className="font-semibold">{zikr.text.substring(0, 50)}...</span>}>
                                <div className="p-4 pt-0 text-white/90 border-t border-white/10 space-y-3">
                                    <p className="font-amiri text-lg leading-relaxed text-white whitespace-pre-wrap">{zikr.text}</p>
                                    <p className="text-xs text-yellow-300 font-amiri pr-2 border-r-2 border-yellow-400/50">{zikr.reference}</p>
                                    <p className="text-sm font-bold">التكرار: {zikr.repeat}</p>
                                    {zikr.notes && <p className="text-sm">ملاحظات: {zikr.notes}</p>}
                                    <div className="flex justify-end gap-4 pt-2 border-t border-white/10">
                                        <button onClick={() => openModalForEdit(zikr, category.name)} className="text-yellow-400 hover:text-yellow-300 font-semibold">تعديل</button>
                                        <button onClick={() => handleDelete(zikr.id, category.name)} className="text-red-400 hover:text-red-300 font-semibold">حذف</button>
                                    </div>
                                </div>
                             </Accordion>
                        ))}
                    </GlassCard>
                ))}
            </div>

            {isModalOpen && (
                <ZikrFormModal
                    zikr={editingZikr}
                    categoryName={currentCategory}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default AzkarManagementPage;
