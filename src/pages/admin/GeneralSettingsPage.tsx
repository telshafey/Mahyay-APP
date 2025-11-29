import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import GlassCard from '../../components/GlassCard';
import Checkbox from '../../components/ui/Checkbox';

const GeneralSettingsPage: React.FC = () => {
    const { settings, updateFeatureToggles, prayerLocations, updateSettings } = useAppContext();
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
                 <h3 className="text-xl font-bold text-white mb-4">🌍 إعدادات المواقيت الاحتياطية</h3>
                 <div className="space-y-2">
                    <label htmlFor="default_location" className="text-sm font-semibold mb-2 block">الموقع الاحتياطي</label>
                    <select 
                        id="default_location" 
                        value={settings.defaultLocationId || ''} 
                        onChange={e => updateSettings({ defaultLocationId: e.target.value })} 
                        className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                        <option value="" disabled style={{ backgroundColor: '#1e4d3b' }}>اختر موقعًا احتياطيًا...</option>
                        {prayerLocations.map(loc => (
                            <option key={loc.id} value={loc.id} style={{ backgroundColor: '#1e4d3b' }}>
                                {loc.city}, {loc.country}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-white/70 mt-1">سيتم استخدام هذا الموقع في حال فشل جلب المواقيت تلقائيًا.</p>
                 </div>
            </GlassCard>
        </div>
    );
};

export default GeneralSettingsPage;