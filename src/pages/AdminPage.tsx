import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { AuthContext } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

const DATA_KEYS = ['mahyay_appData', 'mahyay_settings', 'mahyay_userProfile', 'mahyay_personalGoals', 'mahyay_goalProgress'];

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
                
                const requiredKeys = ['mahyay_appData', 'mahyay_settings', 'mahyay_userProfile'];
                const hasAllKeys = requiredKeys.every(key => Object.prototype.hasOwnProperty.call(importedData, key));

                if (!hasAllKeys) {
                    throw new Error("ملف النسخ الاحتياطي غير صالح أو تالف.");
                }

                if (window.confirm("⚠️ هل أنت متأكد من استيراد هذه البيانات؟ سيتم الكتابة فوق جميع بياناتك الحالية.")) {
                    Object.keys(importedData).forEach(key => {
                         if (DATA_KEYS.includes(key)) {
                            localStorage.setItem(key, JSON.stringify(importedData[key]));
                         }
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

    const renderApiKeyStatus = () => {
        const key = process.env.API_KEY;
        let statusText: string;
        let colorClass: string;

        if (key && key.trim().length > 5 && key !== "undefined") {
            statusText = '✅ تم العثور على مفتاح API بنجاح وجاهز للاستخدام.';
            colorClass = 'bg-green-900/50 text-green-300';
        } else if (key === "undefined") {
            statusText = '❌ خطأ: لم يتم العثور على متغير البيئة (Environment Variable) باسم VITE_API_KEY في إعدادات النشر على Vercel. يرجى إضافته.';
            colorClass = 'bg-red-900/50 text-red-300';
        } else if (!key || key.trim().length === 0) {
            statusText = '⚠️ تنبيه: تم العثور على متغير البيئة VITE_API_KEY ولكنه فارغ. يرجى إدخال قيمة مفتاح Gemini API الخاص بك.';
            colorClass = 'bg-yellow-900/50 text-yellow-300';
        } else {
             statusText = '❌ خطأ: مفتاح API الذي تم إدخاله قصير جداً أو غير صالح. يرجى التحقق منه في إعدادات Vercel.';
             colorClass = 'bg-red-900/50 text-red-300';
        }

        return (
             <div className={`p-3 rounded-lg text-center font-semibold ${colorClass}`}>
                {statusText}
            </div>
        )
    }

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
                <h3 className="text-xl font-bold mb-4">🩺 تشخيص النظام</h3>
                {renderApiKeyStatus()}
                <p className="text-xs text-center mt-3 text-white/70">
                   هذه الأداة تساعدك على التأكد من أن مفتاح API الخاص بخدمات الذكاء الاصطناعي تم إعداده بشكل صحيح في بيئة النشر (Vercel).
                </p>
            </GlassCard>

             <GlassCard className="!bg-blue-900/30 !border-blue-400/50">
                <div className="flex items-center gap-4 text-white">
                    <span className="text-4xl">💡</span>
                    <div>
                        <h4 className="font-bold">نصيحة للحفاظ على بياناتك</h4>
                        <p className="text-sm text-white/90">نوصي بتصدير نسخة احتياطية من بياناتك بشكل دوري (أسبوعياً مثلاً) وحفظها في مكان آمن. هذا يضمن عدم ضياع سجل إنجازاتك عند تغيير الجهاز أو حذف بيانات المتصفح.</p>
                    </div>
                </div>
            </GlassCard>

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