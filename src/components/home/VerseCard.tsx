import React from 'react';
import GlassCard from '../GlassCard';

const VerseCard: React.FC = () => {
    const verse = "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ";
    const source = "سورة الأنعام - آية 162";
    
    return (
        <GlassCard className="text-center !bg-gradient-to-br !from-yellow-300/20 !to-yellow-500/30 !border-yellow-400/30">
            <p className="font-amiri text-2xl md:text-3xl leading-relaxed text-white font-bold mb-4">"{verse}"</p>
            <p className="text-yellow-300 font-semibold mb-2">{source}</p>
        </GlassCard>
    );
}

export default VerseCard;
