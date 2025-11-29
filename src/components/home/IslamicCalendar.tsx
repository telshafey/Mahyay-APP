import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import GlassCard from '../GlassCard';
import { HIJRI_MONTHS_INFO } from '../../constants';

const IslamicCalendar: React.FC = () => {
    const { currentHijriMonthInfo, nextIslamicOccasion, hijriYearInfo } = useAppContext();

    if (!currentHijriMonthInfo) {
        return <GlassCard><p className="text-center text-white/80">جاري تحميل التقويم الإسلامي...</p></GlassCard>;
    }
    
    return (
        <GlassCard>
            <div className="text-center text-white mb-4">
                <h3 className="font-amiri text-2xl font-bold">{currentHijriMonthInfo.name}</h3>
                <p className="text-white/95 mb-2">{hijriYearInfo?.year} هـ</p>
                <p className="text-sm text-white/95 max-w-md mx-auto">{currentHijriMonthInfo.definition}</p>
            </div>
            
            <div className="mt-4 mb-4 p-3 bg-black/20 rounded-lg text-xs text-center text-white space-y-2">
                <p>أنت في عام <span className="font-bold text-yellow-300">{hijriYearInfo?.year || '...'}</span> هجريًا، والذي يبلغ طوله حوالي <span className="font-bold text-yellow-300">{hijriYearInfo?.length || '354'}</span> يومًا.</p>
                <p className="font-amiri">"إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا ... مِنْهَا أَرْبَعَةٌ حُرُمٌ"</p>
                <p className="text-white/85">(التوبة: 36)</p>
            </div>

            {nextIslamicOccasion && (
                 <div className="bg-yellow-400/20 border-2 border-yellow-400/50 rounded-xl p-4 mb-4 text-center">
                    <h4 className="font-bold text-yellow-200 text-sm">أقرب مناسبة قادمة</h4>
                    <p className="text-white font-bold text-lg">{nextIslamicOccasion.name}</p>
                    <p className="text-yellow-300 text-sm">{nextIslamicOccasion.hijriDay} {HIJRI_MONTHS_INFO[nextIslamicOccasion.hijriMonth]?.name}</p>
                    <p className="text-white text-xs mt-1">{nextIslamicOccasion.description}</p>
                </div>
            )}
            
            <div>
                <h4 className="font-bold text-white mb-2">مناسبات هذا الشهر:</h4>
                {currentHijriMonthInfo.occasions.length > 0 ? (
                     <ul className="space-y-2">
                        {currentHijriMonthInfo.occasions.map(occasion => (
                             <li key={occasion.id} className="p-2 bg-black/20 rounded-md flex items-start gap-2">
                                <span className="text-yellow-400 pt-1">⭐</span>
                                <div>
                                    <p className="text-sm font-semibold text-white">{occasion.name} - {occasion.hijriDay} {currentHijriMonthInfo.name}</p>
                                    <p className="text-xs text-white/90">{occasion.description}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-white/85 py-2">لا توجد مناسبات بارزة في هذا الشهر.</p>
                )}
            </div>
        </GlassCard>
    );
};

export default React.memo(IslamicCalendar);