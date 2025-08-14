import React from 'react';
import GlassCard from './GlassCard.tsx';
import { UserChallenge } from '../types.ts';

const ChallengeCard: React.FC<{ challenge: UserChallenge }> = ({ challenge }) => {
    const progressPercentage = (challenge.progress / challenge.total) * 100;
    const isCompleted = challenge.status === 'completed';

    return (
        <GlassCard className={`!bg-black/10 transition-all duration-300 ${isCompleted ? '!border-green-400/50' : challenge.status === 'active' ? '!border-yellow-400/50' : '!border-white/20'}`}>
            <div className="flex gap-4 items-start">
                <div className={`text-4xl p-3 rounded-xl bg-white/10 ${isCompleted ? 'grayscale' : ''}`}>{challenge.icon}</div>
                <div className="flex-grow text-white">
                    <h4 className="font-bold flex items-center gap-2">
                        <span>{challenge.title}</span>
                        {isCompleted && <span className="text-yellow-400 text-lg">🏆</span>}
                    </h4>
                    <p className={`text-sm opacity-80 ${isCompleted ? 'line-through' : ''}`}>{challenge.desc}</p>
                    <div className="mt-4">
                        <div className="flex justify-between items-center text-white text-sm mb-1">
                            <span>
                                {isCompleted ? 'مكتمل!' : `التقدم: ${challenge.progress} / ${challenge.total}`}
                            </span>
                            <span className="font-bold text-yellow-300">🎁 {challenge.reward}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${progressPercentage}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>
             {isCompleted && (
                 <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center pointer-events-none">
                    <span className="text-5xl font-bold text-green-400 transform -rotate-12 opacity-80">✅</span>
                 </div>
             )}
             {challenge.status === 'available' && (
                 <div className="mt-4 text-center">
                    <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors">
                        ابدأ التحدي
                    </button>
                 </div>
             )}
        </GlassCard>
    );
};

export default ChallengeCard;
