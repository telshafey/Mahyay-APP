import React from 'react';
import { DisplayChallenge } from '../types';
import GlassCard from './GlassCard';
import { useAppContext } from '../contexts/AppContext';

interface ChallengeCardProps {
    challenge: DisplayChallenge;
    onStartChallenge: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onStartChallenge }) => {
    const { logManualChallengeProgress } = useAppContext();
    const progressPercentage = challenge.target > 0 ? (challenge.progress / challenge.target) * 100 : 0;
    const isCompleted = challenge.userProgress?.status === 'completed';
    const isActive = challenge.userProgress?.status === 'active';
    const isSaving = typeof challenge.userProgress?.id === 'string'; // Check for temporary ID from optimistic update

    const todayKey = new Date().toISOString().split('T')[0];
    const hasLoggedToday = challenge.userProgress?.lastLoggedDate === todayKey;

    let manualAction = {
        enabled: true,
        text: "تسجيل الإنجاز"
    };

    if (challenge.tracking === 'manual' && isActive) {
        if (hasLoggedToday) {
            manualAction = { enabled: false, text: "تم التسجيل اليوم" };
        } else if (challenge.id === 'c5' && new Date().getDay() !== 5) { // In JavaScript, Sunday is 0, Monday is 1, ..., Friday is 5.
             manualAction = { enabled: false, text: "متاح يوم الجمعة" };
        } else if (challenge.id === 'c7' && challenge.progress >= challenge.target) { // Weekly charity
             manualAction = { enabled: false, text: "تم إنجاز الأسبوع" };
        }
    }


    return (
        <GlassCard className={`!p-4 transition-all ${isCompleted ? '!bg-green-500/20 !border-green-400/30' : ''}`}>
            <div className="flex items-start gap-4">
                <div className="text-4xl p-2 bg-black/20 rounded-lg">{challenge.icon}</div>
                <div className="flex-grow">
                    <h4 className="font-bold text-white text-lg">{challenge.title}</h4>
                    <p className="text-xs text-white/80 mt-1">{challenge.description}</p>
                    <p className="text-xs font-bold text-yellow-300 mt-2">+{challenge.points} نقطة | {challenge.durationDays} أيام</p>
                </div>
                {!isActive && !isCompleted && (
                    <button 
                        onClick={(e) => { e.preventDefault(); onStartChallenge(challenge.id); }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-4 rounded-full text-sm whitespace-nowrap transition-transform transform hover:scale-105"
                    >
                        ابدأ التحدي
                    </button>
                )}
            </div>
            {isActive && challenge.tracking === 'auto' && (
                <div className="mt-4">
                    <div className="flex justify-between items-center text-sm text-white mb-1">
                        <span>التقدم</span>
                        <span>{Math.min(challenge.progress, challenge.target)} / {challenge.target}</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-2.5">
                        <div 
                            className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}
            {isActive && challenge.tracking === 'manual' && (
                 <div className="mt-4 flex flex-col items-center gap-2">
                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isSaving) {
                                logManualChallengeProgress(challenge.id);
                            }
                        }}
                        disabled={!manualAction.enabled || isSaving}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                       {isSaving ? '...جاري الحفظ' : manualAction.text}
                    </button>
                    <p className="text-white text-sm font-semibold">{challenge.progress} / {challenge.target}</p>
                </div>
            )}
            {isCompleted && (
                <div className="mt-4 text-center text-green-300 font-bold animate-fade-in">🎉 مكتمل!</div>
            )}
        </GlassCard>
    );
};

export default ChallengeCard;