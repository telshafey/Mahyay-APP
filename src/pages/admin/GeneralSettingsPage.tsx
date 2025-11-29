import React from 'react';
import GlassCard from '../../components/GlassCard';

const GeneralSettingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">🔧 الإعدادات العامة</h2>
            
            <GlassCard>
                <h3 className="text-xl font-bold text-white mb-4">تفعيل الميزات (Feature Toggles)</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <span className="font-semibold text-white">ميزة التحديات</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                     <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <span className="font-semibold text-white">ميزة الأهداف الشخصية</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                    </div>
                </div>
                 <p className="text-xs text-white/70 mt-4 text-center">هذه الميزة قيد التطوير. التغييرات هنا لا تؤثر على التطبيق حاليًا.</p>
            </GlassCard>
        </div>
    );
};

export default GeneralSettingsPage;
