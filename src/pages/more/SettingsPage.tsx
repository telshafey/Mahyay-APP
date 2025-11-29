import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePrayerTimesContext } from '../../contexts/PrayerTimesContext';
import { PRAYER_METHODS } from '../../constants';
import { Settings } from '../../types';
import GlassCard from '../../components/GlassCard';
import SettingsCard from '../../components/more/SettingsCard';
import PushNotificationManager from '../../components/more/PushNotificationManager';


const SettingsPage: React.FC = () => {
    const context = useAppContext();
    const authContext = useAuthContext();
    const [isResettingData, setIsResettingData] = useState(false);
    
    const { settings, updateSettings, resetAllData } = context;
    const { coordinates, locationError, detectLocation } = usePrayerTimesContext();
    const { profile, signOut } = authContext;
    
    const handleSettingsChange = (key: keyof Settings, value: any) => {
        updateSettings({ [key]: value });
    };

    const handleGoalChange = (change: number) => {
        const newGoal = Math.max(1, (settings.quranGoal || 10) + change);
        handleSettingsChange('quranGoal', newGoal);
    }
    
    const handleDataReset = async () => {
        if (!window.confirm("⚠️ تحذير! هل أنت متأكد من حذف جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.")) return;
        setIsResettingData(true);
        const success = await resetAllData();
        if (success) {
            // Optionally sign out or reload
            await signOut();
            alert("تم إعادة تعيين التطبيق بالكامل.");
        }
        setIsResettingData(false);
    }
    
    const handleSignOut = async () => {
        await signOut();
        // The AuthProvider will handle navigation to login page
    }

    return (
        <div className="space-y-6 text-white">
            <GlassCard>
                 <div className="flex flex-col items-center text-center gap-4">
                     <div className="relative">
                         <img 
                            src={profile?.picture || undefined} 
                            alt={profile?.name || 'User'} 
                            className="w-24 h-24 rounded-full border-4 border-white/50 object-cover shadow-lg"
                         />
                     </div>
                    <div className="w-full max-w-sm space-y-4">
                        <p className="w-full text-center text-xl font-bold bg-white/10 rounded-md py-2">{profile?.name}</p>
                        <p className="text-sm text-white/80">{profile?.email}</p>
                    </div>
                 </div>
            </GlassCard>

            <SettingsCard title="إعدادات الموقع" icon="📍">
                <div className="text-center space-y-2">
                    {coordinates && !locationError && (
                        <p className="text-green-300 font-semibold">✅ يتم استخدام موقعك الحالي لدقة المواقيت.</p>
                    )}
                    {locationError && (
                        <p className="text-yellow-300 text-sm font-semibold">{locationError}</p>
                    )}
                    <button
                        onClick={detectLocation}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        إعادة تحديد الموقع
                    </button>
                </div>
            </SettingsCard>
            
            <SettingsCard title="إعدادات التطبيق" icon="📱">
                <div className="flex items-center justify-between">
                    <label className="font-semibold">هدف القرآن اليومي (صفحات)</label>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleGoalChange(-1)} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20">-</button>
                        <span className="text-xl font-bold text-white w-8 text-center">{settings.quranGoal}</span>
                        <button onClick={() => handleGoalChange(1)} className="w-8 h-8 rounded-full bg-white/10 text-white font-bold hover:bg-white/20">+</button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <label htmlFor="prayer_method" className="text-sm font-semibold mb-2 block">طريقة حساب مواقيت الصلاة</label>
                    <select 
                        id="prayer_method" 
                        value={settings.prayerMethod} 
                        onChange={e => handleSettingsChange('prayerMethod', Number(e.target.value))} 
                        className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                        {PRAYER_METHODS.map(method => (
                            <option key={method.id} value={method.id} style={{ backgroundColor: '#2d5a47' }}>
                                {method.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-white/95 mb-2">تخصيص أوقات الأذكار</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="morning_azkar" className="text-sm font-semibold">بداية أذكار الصباح</label>
                            <input id="morning_azkar" type="time" value={settings.azkarMorningStart} onChange={e => handleSettingsChange('azkarMorningStart', e.target.value)} className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                         <div>
                            <label htmlFor="evening_azkar" className="text-sm font-semibold">بداية أذكار المساء</label>
                            <input id="evening_azkar" type="time" value={settings.azkarEveningStart} onChange={e => handleSettingsChange('azkarEveningStart', e.target.value)} className="w-full mt-1 bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="الإشعارات الداخلية" icon="🔔">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">تفعيل إشعارات الصلوات</span>
                    <input type="checkbox" checked={settings.notifications.prayers} onChange={e => handleSettingsChange('notifications', {...settings.notifications, prayers: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold">تفعيل إشعارات الأذكار</span>
                    <input type="checkbox" checked={settings.notifications.azkar} onChange={e => handleSettingsChange('notifications', {...settings.notifications, azkar: e.target.checked})} className="w-6 h-6 rounded accent-yellow-400"/>
                </label>
            </SettingsCard>
            
            <PushNotificationManager />

             <GlassCard>
                <button onClick={handleSignOut} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors">
                    تسجيل الخروج
                </button>
            </GlassCard>

             <div className="border-2 border-red-500/50 rounded-2xl p-4 space-y-4">
                <h4 className="text-lg font-bold text-center text-red-300">منطقة الخطر</h4>
                <button onClick={handleDataReset} disabled={isResettingData} className="w-full bg-red-800/80 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
                    {isResettingData ? 'جاري الحذف...' : '🗑️ إعادة تعيين التطبيق بالكامل'}
                </button>
                 <p className="text-xs text-center text-red-300">هذا الإجراء نهائي ولا يمكن التراجع عنه.</p>
            </div>
        </div>
    )
}

export default SettingsPage;
