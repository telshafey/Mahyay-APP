import React from 'react';
import GlassCard from '../GlassCard';

const DuaCompanionCard: React.FC<{ onOpen: () => void; }> = ({ onOpen }) => {
    return (
        <GlassCard onClick={onOpen} className="cursor-pointer hover:!bg-purple-500/30 transition-colors">
            <div className="text-center space-y-2">
                <div className="text-5xl">✨</div>
                <h3 className="font-amiri text-2xl font-bold text-white">رفيق الدعاء</h3>
                <p className="text-white/90">هل تحتاج إلى دعاء لموقف معين؟ دع الذكاء الاصطناعي يساعدك في صياغة دعاء من وحي القرآن والسنة.</p>
                <div className="inline-block mt-2 bg-yellow-500 text-green-900 font-bold py-2 px-5 rounded-full">
                    جرب الآن
                </div>
            </div>
        </GlassCard>
    );
};

export default DuaCompanionCard;
