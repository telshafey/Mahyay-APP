import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { PrayerLocation } from '../../types';
import GlassCard from '../../components/GlassCard';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/admin/FormField';

const PrayerLocationFormModal: React.FC<{
    location: PrayerLocation | null;
    onClose: () => void;
    onSave: (data: Omit<PrayerLocation, 'id'> | PrayerLocation) => void;
}> = ({ location, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        city: location?.city || '',
        country: location?.country || '',
        times: location?.times || { Fajr: '00:00', Dhuhr: '00:00', Asr: '00:00', Maghrib: '00:00', Isha: '00:00' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, times: { ...prev.times, [name]: value } }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            city: formData.city,
            country: formData.country,
            times: formData.times,
        };
        if (location) {
            onSave({ ...location, ...finalData });
        } else {
            onSave(finalData);
        }
    };

    return (
        <Modal title={location ? "تعديل الموقع" : "إضافة موقع جديد"} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4 text-white">
                <div className="grid grid-cols-2 gap-4">
                    <FormField label="المدينة" name="city" value={formData.city} onChange={handleChange} required />
                    <FormField label="الدولة" name="country" value={formData.country} onChange={handleChange} required />
                </div>
                
                <div className="p-3 border border-white/20 rounded-lg space-y-3">
                    <h4 className="font-bold text-yellow-300 text-center">أوقات الصلاة (تنسيق 24 ساعة)</h4>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <FormField label="الفجر" name="Fajr" value={formData.times.Fajr} onChange={handleTimeChange} type="time" required />
                        <FormField label="الظهر" name="Dhuhr" value={formData.times.Dhuhr} onChange={handleTimeChange} type="time" required />
                        <FormField label="العصر" name="Asr" value={formData.times.Asr} onChange={handleTimeChange} type="time" required />
                        <FormField label="المغرب" name="Maghrib" value={formData.times.Maghrib} onChange={handleTimeChange} type="time" required />
                        <FormField label="العشاء" name="Isha" value={formData.times.Isha} onChange={handleTimeChange} type="time" required />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded">إلغاء</button>
                    <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};


const PrayerLocationsManagementPage: React.FC = () => {
    const { prayerLocations, addPrayerLocation, updatePrayerLocation, deletePrayerLocation } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<PrayerLocation | null>(null);

    const openModalForNew = () => {
        setEditingLocation(null);
        setIsModalOpen(true);
    };

    const openModalForEdit = (location: PrayerLocation) => {
        setEditingLocation(location);
        setIsModalOpen(true);
    };

    const handleDelete = (locationId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الموقع؟')) {
            deletePrayerLocation(locationId);
        }
    };
    
    const handleSave = async (data: Omit<PrayerLocation, 'id'> | PrayerLocation) => {
        if ('id' in data) {
            await updatePrayerLocation(data);
        } else {
            await addPrayerLocation(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white font-amiri">🌍 إدارة المواقيت</h2>
                <button onClick={openModalForNew} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-lg transition-colors">
                    + إضافة موقع جديد
                </button>
            </div>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">المدينة</th>
                                <th className="p-4">الدولة</th>
                                <th className="p-4">وقت الفجر</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {prayerLocations.map(loc => (
                                <tr key={loc.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{loc.city}</td>
                                    <td className="p-4">{loc.country}</td>
                                    <td className="p-4 text-sm font-mono">{loc.times?.Fajr || '-'}</td>
                                    <td className="p-4 space-x-2 space-x-reverse">
                                        <button onClick={() => openModalForEdit(loc)} className="text-yellow-400 hover:text-yellow-300">تعديل</button>
                                        <button onClick={() => handleDelete(loc.id)} className="text-red-400 hover:text-red-300">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

            {isModalOpen && (
                <PrayerLocationFormModal
                    location={editingLocation}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default PrayerLocationsManagementPage;