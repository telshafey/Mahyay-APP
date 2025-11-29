import React from 'react';
import { useAppContext } from '../../../../../packages/core/src';
import GlassCard from '../GlassCard';

const DailyWisdomCard: React.FC = () => {
    const { dailyWisdom } = useAppContext();
    if (!dailyWisdom) {
        return <GlassCard><p className="text-center text-white/80">جاري تحميل حكمة اليوم...</p></GlassCard>;
    }
    return (
        <GlassCard className="!bg-gradient-to-tr !from-purple-500/20 !to-indigo-500/30 !border-purple-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💡 حكمة اليوم</h3>
            <p className="font-amiri text-lg md:text-xl leading-relaxed text-white font-bold mb-4 text-center">"{dailyWisdom.text}"</p>
            <p className="text-purple-300 font-semibold text-center">{dailyWisdom.source}</p>
        </GlassCard>
    );
}

export default React.memo(DailyWisdomCard);