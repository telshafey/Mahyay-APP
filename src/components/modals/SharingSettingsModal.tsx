
import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext.ts';
import { Group, GroupSharingSettings } from '../../types.ts';

const SharingSettingsModal: React.FC<{ group: Group; onClose: () => void; }> = ({ group, onClose }) => {
    const context = useContext(AppContext);
    const [currentSettings, setCurrentSettings] = useState<GroupSharingSettings>(
        context?.sharingSettings[group.id] || { activity: true, stats: true, challenges: true }
    );
    
    if (!context) return null;
    const { updateSharingSettings } = context;

    const handleToggle = (key: keyof GroupSharingSettings) => {
        setCurrentSettings(prev => ({...prev, [key]: !prev[key]}));
    };

    const handleSave = () => {
        updateSharingSettings(group.id, currentSettings);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e4d3b] to-[#2d5a47] border border-white/20" onClick={e => e.stopPropagation()}>
                <h3 className="p-4 text-white text-xl text-center font-bold border-b border-white/10">إعدادات المشاركة لمجموعة "{group.name}"</h3>
                <div className="p-6 space-y-4 text-white">
                    <label className="flex items-center justify-between cursor-pointer p-3 bg-black/20 rounded-lg">
                        <span>مشاركة نشاطي اليومي</span>
                        <input type="checkbox" checked={currentSettings.activity} onChange={() => handleToggle('activity')} className="w-6 h-6 rounded accent-yellow-400"/>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-3 bg-black/20 rounded-lg">
                        <span>مشاركة إحصائياتي</span>
                        <input type="checkbox" checked={currentSettings.stats} onChange={() => handleToggle('stats')} className="w-6 h-6 rounded accent-yellow-400"/>
                    </label>
                     <label className="flex items-center justify-between cursor-pointer p-3 bg-black/20 rounded-lg">
                        <span>مشاركة تقدم التحديات</span>
                        <input type="checkbox" checked={currentSettings.challenges} onChange={() => handleToggle('challenges')} className="w-6 h-6 rounded accent-yellow-400"/>
                    </label>
                </div>
                 <div className="p-4 border-t border-white/10 flex justify-center gap-4">
                    <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors">حفظ</button>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-colors">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default SharingSettingsModal;
