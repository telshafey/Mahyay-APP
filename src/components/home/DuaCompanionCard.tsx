import React from 'react';
import GlassCard from '../GlassCard';

interface DuaCompanionCardProps {
    onOpen: () => void;
}

const DuaCompanionCard: React.FC<DuaCompanionCardProps> = ({ onOpen }) => {
    return (
        <GlassCard 
            onClick={onOpen}
            className="!bg-gradient-to-tr !from-teal-500/20 !to-cyan-500/30 !border-teal-400/30 cursor-pointer hover:!border-teal-300 transition-all transform hover:-translate-y-1"
        >
            <div className="text-center text-white">
                <h3 className="text-xl font-semibold mb-2">💖 رفيق الدعاء</h3>
                <p className="text-sm mb-4 text-white/90">اكتب ما في قلبك، ودع الذكاء الاصطناعي يساعدك في صياغة دعاء مؤثر من وحي القرآن والسنة.</p>
                <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full transition-colors">
                    افتح رفيق الدعاء
                </button>
            </div>
        </GlassCard>
    );
};

export default DuaCompanionCard;