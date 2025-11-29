import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DisplayChallenge } from '../types';
import { CHALLENGES } from '../constants';
import GlassCard from '../components/GlassCard';
import ChallengeCard from '../components/ChallengeCard';

const ChallengesPage: React.FC = () => {
    const { userChallenges, startChallenge } = useAppContext();
    const [activeTab, setActiveTab] = useState<'active' | 'available' | 'completed'>('active');

    const categorizedChallenges = useMemo(() => {
        const active: DisplayChallenge[] = [];
        const completed: DisplayChallenge[] = [];
        const available: DisplayChallenge[] = [];

        for (const baseChallenge of CHALLENGES) {
            const userProgress = userChallenges.find(uc => uc.challenge_id === baseChallenge.id);
            const progress = userProgress ? userProgress.progress : 0;
            const challengeWithProgress: DisplayChallenge = { ...baseChallenge, progress, userProgress };

            if (userProgress) {
                if (userProgress.status === 'completed') {
                    completed.push(challengeWithProgress);
                } else {
                    active.push(challengeWithProgress);
                }
            } else {
                available.push(challengeWithProgress);
            }
        }
        return { active, completed, available };
    }, [userChallenges]);


    const displayedChallenges = {
        active: categorizedChallenges.active,
        available: categorizedChallenges.available,
        completed: categorizedChallenges.completed
    }[activeTab];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">🏆 التحديات الإيمانية</h2>
            
            <GlassCard>
                 <div className="text-center text-white">
                    <p>انضم إلى التحديات لبناء عادات إيمانية قوية، واكسب النقاط، وعزز من التزامك اليومي.</p>
                </div>
            </GlassCard>

            <div className="space-y-4">
                <GlassCard className="!p-2">
                    <div className="flex justify-around items-center">
                        <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                            نشطة ({categorizedChallenges.active.length})
                        </button>
                        <button onClick={() => setActiveTab('available')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'available' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                            متاحة ({categorizedChallenges.available.length})
                        </button>
                        <button onClick={() => setActiveTab('completed')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'completed' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                            مكتملة ({categorizedChallenges.completed.length})
                        </button>
                    </div>
                </GlassCard>

                {displayedChallenges.length > 0 ? (
                    displayedChallenges.map((c, index) => (
                        <div 
                            key={c.id} 
                            className="animate-fade-in" 
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <ChallengeCard challenge={c} onStartChallenge={startChallenge} />
                        </div>
                    ))
                ) : (
                    <GlassCard className="text-center text-white/80 py-8">
                        لا توجد تحديات في هذا القسم حالياً.
                    </GlassCard>
                )}
            </div>
        </div>
    );
};

export default ChallengesPage;
