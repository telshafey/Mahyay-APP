import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { QURAN_SURAHS, QURAN_TOTAL_PAGES } from '../constants';
import { getAbsolutePageApproximation, getSurahFromPage } from '../utils';
import GlassCard from '../components/GlassCard';

// عدد الصفحات المتاحة للعرض التجريبي
const DEMO_PAGE_LIMIT = 3;

const QuranPage: React.FC = () => {
    const { settings, dailyData, updateKhatmaPosition } = useAppContext();
    
    // حساب الصفحة المحفوظة، مع التأكد من أنها ضمن النطاق التجريبي
    const savedPage = useMemo(() => {
        const page = getAbsolutePageApproximation(settings.khatmaPosition || { surah: 1, ayah: 1 });
        return page > DEMO_PAGE_LIMIT ? 1 : page;
    }, [settings.khatmaPosition]);
    
    const [currentPage, setCurrentPage] = useState<number>(savedPage);
    const [isSaving, setIsSaving] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        setCurrentPage(savedPage);
    }, [savedPage]);

    // التنقل (محدود بـ 3 صفحات)
    const handleNextPage = () => {
        if (currentPage < DEMO_PAGE_LIMIT) {
            setCurrentPage(prev => prev + 1);
            setImageLoading(true);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            setImageLoading(true);
        }
    };

    const handleSaveBookmark = async () => {
        setIsSaving(true);
        const position = getSurahFromPage(currentPage);
        await updateKhatmaPosition(position);
        setIsSaving(false);
    };

    const currentSurahInfo = useMemo(() => getSurahFromPage(currentPage), [currentPage]);
    const currentSurahName = QURAN_SURAHS.find(s => s.id === currentSurahInfo.surah)?.name;

    // دالة لتنسيق رقم الصفحة (001, 002, ...)
    const padPage = (num: number) => num.toString().padStart(3, '0');
    
    // استخدام مصدر بديل ومستقر (EveryAyah)
    const imageUrl = `https://everyayah.com/data/images_png/${padPage(currentPage)}.png`;

    const isBookmarkHere = currentPage === savedPage;

    // حساب النسب المئوية
    const dailyGoal = settings.quranGoal || 1;
    const dailyRead = dailyData.quranPagesRead || 0;
    const dailyPercentage = Math.min(100, Math.round((dailyRead / dailyGoal) * 100));
    
    // حساب نسبة الختمة
    const khatmaPercentage = ((currentPage / QURAN_TOTAL_PAGES) * 100).toFixed(1);

    return (
        <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <GlassCard className="!p-3 flex justify-between items-center z-10 shrink-0">
                <div className="text-white">
                    <p className="text-xs text-white/70">سورة</p>
                    <p className="font-amiri font-bold text-lg">{currentSurahName}</p>
                </div>
                
                <div className="flex flex-col items-center">
                     <p className="text-xs text-white/70">صفحة</p>
                     <p className="font-bold text-yellow-300 text-xl">{currentPage}</p>
                </div>

                <button
                    onClick={handleSaveBookmark}
                    disabled={isBookmarkHere || isSaving}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                        isBookmarkHere 
                        ? 'text-green-400 bg-green-900/30 cursor-default' 
                        : 'text-white bg-yellow-600 hover:bg-yellow-500 shadow-lg animate-pulse'
                    }`}
                >
                    <span className="text-2xl">{isBookmarkHere ? '🔖' : '💾'}</span>
                    <span className="text-[10px] font-bold mt-1">
                        {isSaving ? '...' : (isBookmarkHere ? 'محفوظ' : 'حفظ')}
                    </span>
                </button>
            </GlassCard>

            {/* Progress Bars */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
                <GlassCard className="!p-2 !bg-black/40 flex flex-col items-center justify-center">
                    <div className="flex justify-between w-full text-[10px] text-white/70 mb-1">
                        <span>الورد اليومي</span>
                        <span>{dailyRead}/{dailyGoal}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-green-400 h-full rounded-full transition-all duration-500" style={{ width: `${dailyPercentage}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-green-300 mt-1">{dailyPercentage}%</p>
                </GlassCard>
                <GlassCard className="!p-2 !bg-black/40 flex flex-col items-center justify-center">
                    <div className="flex justify-between w-full text-[10px] text-white/70 mb-1">
                        <span>ختمة المصحف</span>
                        <span>{currentPage}/{QURAN_TOTAL_PAGES}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${khatmaPercentage}%` }}></div>
                    </div>
                    <p className="text-xs font-bold text-yellow-300 mt-1">{khatmaPercentage}%</p>
                </GlassCard>
            </div>

            {/* Image Viewer */}
            <div className="relative flex-grow flex items-center justify-center bg-[#fdfbf7] rounded-xl overflow-hidden shadow-2xl border-4 border-[#2d5a47]">
                
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e4d3b] z-0">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                            <p className="text-white text-sm">جاري تحميل الصفحة...</p>
                        </div>
                    </div>
                )}

                <img 
                    src={imageUrl} 
                    alt={`Quran Page ${currentPage}`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                        console.error("Image failed to load: " + imageUrl);
                        setImageLoading(false);
                    }}
                />

                {/* Bookmark Ribbon */}
                {isBookmarkHere && !imageLoading && (
                    <div className="absolute top-0 left-8 z-10">
                        <div className="w-6 h-10 bg-red-600 shadow-md relative">
                            <div className="absolute bottom-0 left-0 border-l-[12px] border-r-[12px] border-b-[8px] border-l-transparent border-r-transparent border-b-[#fdfbf7]"></div>
                        </div>
                    </div>
                )}

                {/* Navigation Touch Zones */}
                <div className="absolute inset-0 flex justify-between items-stretch z-20">
                    <button 
                        onClick={handleNextPage} 
                        disabled={currentPage >= DEMO_PAGE_LIMIT}
                        className="w-20 bg-transparent flex items-center justify-start pl-2 focus:outline-none"
                    >
                        {/* Invisible click area */}
                    </button>
                    <button 
                        onClick={handlePrevPage} 
                        disabled={currentPage <= 1}
                        className="w-20 bg-transparent flex items-center justify-end pr-2 focus:outline-none"
                    >
                        {/* Invisible click area */}
                    </button>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-between gap-4 shrink-0">
                <button 
                    onClick={handleNextPage}
                    className="flex-1 bg-black/40 hover:bg-black/60 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={currentPage >= DEMO_PAGE_LIMIT}
                >
                    {currentPage >= DEMO_PAGE_LIMIT ? 'نهاية المعاينة' : 'الصفحة التالية'}
                </button>
                
                <button 
                    onClick={handlePrevPage}
                    className="flex-1 bg-black/40 hover:bg-black/60 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={currentPage <= 1}
                >
                    الصفحة السابقة
                </button>
            </div>
        </div>
    );
};

export default QuranPage;