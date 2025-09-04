import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AuthContext } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

const DATA_KEYS = ['mahyay_appData', 'mahyay_settings', 'mahyay_userProfile'];

const AdminPage: React.FC = () => {
    const appContext = useContext(AppContext);
    const authContext = useContext(AuthContext);
    const [raw_data, setRawData] = useState<string>('');

    const handleExport = () => {
        try {
            const dataToExport: Record<string, any> = {};
            DATA_KEYS.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    dataToExport[key] = JSON.parse(data);
                }
            });
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `mahyay-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            // Fix: Add guard for appContext before calling showNotification.
            appContext?.showNotification('✅ تم تصدير البيانات بنجاح', '💾');
        } catch (error) {
            console.error('Failed to export data', error);
            alert('حدث خطأ أثناء تصدير البيانات.');
        }
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable");
                
                const importedData = JSON.parse(text);

                const hasAllKeys = DATA_KEYS.every(key => Object.prototype.hasOwnProperty.call(importedData, key));
                if (!hasAllKeys) {
                    throw new Error("ملف النسخ الاحتياطي غير صالح أو تالف.");
                }

                if (window.confirm("⚠️ هل أنت متأكد من استيراد هذه البيانات؟ سيتم الكتابة فوق جميع بياناتك الحالية.")) {
                    DATA_KEYS.forEach(key => {
                         localStorage.setItem(key, JSON.stringify(importedData[key]));
                    });
                    alert("تم استيراد البيانات بنجاح! سيتم إعادة تحميل التطبيق الآن.");
                    window.location.reload();
                }
            } catch (error) {
                 console.error('Failed to import data', error);
                 alert(`فشل استيراد البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };
    
    const viewRawData = () => {
        try {
             const allData: Record<string, any> = {};
             DATA_KEYS.forEach(key => {
                 const data = localStorage.getItem(key);
                 if (data) {
                     allData[key] = JSON.parse(data);
                 }
             });
             setRawData(JSON.stringify(allData, null, 2));
        } catch (error) {
             setRawData("فشل في قراءة البيانات.");
        }
    }

    // Fix: Add a guard for contexts.
    if (!appContext || !authContext) {
        return (
            <div className="space-y-6 text-white">
                <h2 className="text-3xl font-bold text-center font-amiri">👑 لوحة تحكم المشرف</h2>
                <GlassCard>
                    <p>جاري تحميل البيانات...</p>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-3xl font-bold text-center font-amiri">👑 لوحة تحكم المشرف</h2>
            
            <GlassCard>
                <h3 className="text-xl font-bold mb-4">💾 إدارة البيانات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleExport} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                        تصدير البيانات (نسخ احتياطي)
                    </button>
                     <label className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-center cursor-pointer">
                        استيراد البيانات
                        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </label>
                </div>
                <p className="text-xs text-center mt-3 text-white/70">
                    استخدم هذه الميزة لأخذ نسخة احتياطية من بياناتك أو نقلها إلى جهاز آخر.
                </p>
            </GlassCard>

            <GlassCard>
                <h3 className="text-xl font-bold mb-4">📋 عرض البيانات الخام</h3>
                <button onClick={viewRawData} className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors mb-4">
                    عرض بيانات LocalStorage
                </button>
                {raw_data && (
                    <textarea 
                        readOnly 
                        value={raw_data} 
                        className="w-full h-64 bg-black/30 p-2 rounded-lg font-mono text-sm border border-white/20"
                        aria-label="Raw LocalStorage Data"
                    ></textarea>
                )}
            </GlassCard>

             <GlassCard>
                <h3 className="text-xl font-bold mb-4">🛠️ أدوات النظام</h3>
                <button 
                    onClick={() => appContext.showNotification('🔔 هذا إشعار اختباري!', '🧪')}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    اختبار الإشعارات
                </button>
            </GlassCard>

        </div>
    );
};

export default AdminPage;