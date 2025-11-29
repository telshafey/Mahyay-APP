import React from 'react';
import { useAppContext } from '@mahyay/core';
import GlassCard from '../../components/GlassCard';
import Checkbox from '../../components/ui/Checkbox';

const GeneralSettingsPage: React.FC = () => {
    const { settings, updateFeatureToggles } = useAppContext();
    const { featureToggles } = settings;

    const handleToggle = (feature: keyof typeof featureToggles) => {
        const newToggles = { ...featureToggles, [feature]: !featureToggles[feature] };
        updateFeatureToggles(newToggles);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">🔧 الإعدادات العامة</h2>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    🚀 تفعيل/إلغاء الميزات
                </h3>
                <div className="space-y-4">
                    <div 
                        onClick={() => handleToggle('challenges')} 
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                    >
                        <span className="font-semibold text-white">تفعيل صفحة التحديات</span>
                        <Checkbox
                            checked={featureToggles.challenges}
                            onChange={() => handleToggle('challenges')}
                        />
                    </div>
                    <div 
                        onClick={() => handleToggle('community')}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                    >
                        <span className="font-semibold text-white">تفعيل صفحة المجتمع (قريبًا)</span>
                         <Checkbox
                            checked={featureToggles.community}
                            onChange={() => handleToggle('community')}
                        />
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                 <h3 className="text-xl font-bold text-white mb-4">خيارات أخرى</h3>
                 <p className="text-white/80 text-center py-4">سيتم إضافة المزيد من الإعدادات العامة هنا في المستقبل.</p>
            </GlassCard>
        </div>
    );
};

export default GeneralSettingsPage;
