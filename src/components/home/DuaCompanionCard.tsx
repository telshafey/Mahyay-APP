import React from 'react';
import { useAppContext } from '../../contexts/AppContext';
import GlassCard from '../GlassCard';

const DuaCompanionCard: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
    const { dailyDua } = useAppContext();
    return (
        <GlassCard className="!bg-gradient-to-tr !from-teal-500/20 !to-cyan-500/30 !border-teal-400/30">
            <h3 className="text-white text-xl font-semibold mb-4 text-center">💖 دعاء اليوم</h3>
            <div className="p-4 bg-black/25 rounded-lg border-r-4 border-teal-400 text-center mb-4">
                <p className="font-amiri text-lg text-white">"{dailyDua.text}"</p>
                <p className="text-sm text-teal-300 mt-2">{dailyDua.source}</p>
            </div>
            <p className="text-center text-sm text-white/90 mb-4">هل تحتاج لدعاء مخصص؟ دع الذكاء الاصطناعي يساعدك في مناجاة ربك.</p>
            <button onClick={onOpenModal} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                اطلب دعاءً مخصصًا
            </button>
        </GlassCard>
    );
};

export default DuaCompanionCard;
