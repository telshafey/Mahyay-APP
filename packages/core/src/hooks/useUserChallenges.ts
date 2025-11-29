import { useState, useEffect, useCallback } from 'react';
import { UserChallenge, UserProfile, AppData, BaseChallenge, DailyData, PrayerStatus } from '../types';
import { MOCK_USER_CHALLENGES } from '../mockData';
import { AZKAR_DATA } from '../constants';
import { storage } from '../utils';

export const useUserChallenges = (profile: UserProfile | null, challenges: BaseChallenge[]) => {
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const saveData = useCallback(async (data: UserChallenge[]) => {
        if (profile) {
            await storage.setItem(`userChallenges_${profile.id}`, JSON.stringify(data));
        }
    }, [profile]);
    
    useEffect(() => {
        const loadChallenges = async () => {
            if (!profile) {
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const savedChallenges = await storage.getItem(`userChallenges_${profile.id}`);
                setUserChallenges(savedChallenges ? JSON.parse(savedChallenges) : MOCK_USER_CHALLENGES);
            } catch (e) {
                console.error("Failed to load user challenges", e);
                setError("Failed to load user challenges");
            } finally {
                setIsLoading(false);
            }
        };
        loadChallenges();
    }, [profile]);
    
    useEffect(() => {
        saveData(userChallenges);
    }, [userChallenges, saveData]);

    const startChallenge = async (challengeId: string): Promise<boolean> => {
        if (!profile || userChallenges.some(uc => uc.challenge_id === challengeId)) return false;
        
        const newChallenge: UserChallenge = {
            id: `uc_${Date.now()}`,
            user_id: profile.id,
            challenge_id: challengeId,
            started_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
        };
        setUserChallenges(prev => [...prev, newChallenge]);
        return true;
    };
    
    const logManualChallengeProgress = async (challengeId: string): Promise<boolean> => {
        let challengeCompleted = false;
        setUserChallenges(prev => prev.map(uc => {
            if (uc.challenge_id === challengeId && uc.status === 'active') {
                const base = challenges.find(c => c.id === challengeId);
                if (!base) return uc;
                const newProgress = uc.progress + 1;
                const isCompleted = newProgress >= base.target;
                if (isCompleted) challengeCompleted = true;
                return { 
                    ...uc, 
                    progress: newProgress, 
                    status: isCompleted ? 'completed' : 'active',
                    completed_at: isCompleted ? new Date().toISOString() : undefined,
                    last_logged_date: new Date().toISOString().split('T')[0],
                };
            }
            return uc;
        }));
        return challengeCompleted;
    };
    
    const updateAutoTrackedChallenges = useCallback((appData: AppData, todayKey: string) => {
        const todayData = appData[todayKey];
        if (!todayData) return;

        setUserChallenges(prevChallenges => {
            let hasChanged = false;
            const updatedChallenges = prevChallenges.map(uc => {
                const base = challenges.find(bc => bc.id === uc.challenge_id);
                if (!base || uc.status !== 'active' || base.tracking !== 'auto') return uc;

                let newProgress = uc.progress;
                let shouldLogToday = false;

                switch(base.relatedItem) {
                    case 'quran':
                        newProgress = Object.values(appData).reduce((sum, day: Partial<DailyData>) => sum + (day.quranPagesRead || 0), 0);
                        break;
                    case 'azkar_morning':
                    case 'azkar_evening':
                        const categoryName = base.relatedItem === 'azkar_morning' ? 'أذكار الصباح' : 'أذكار المساء';
                        const category = AZKAR_DATA.find(c => c.name === categoryName);
                        const progress = todayData.azkarStatus?.[categoryName];
                        if(category && progress && category.items.every(item => (progress[item.id] || 0) >= item.repeat)) {
                             if (uc.last_logged_date !== todayKey) {
                                newProgress = uc.progress + 1;
                                shouldLogToday = true;
                            }
                        }
                        break;
                    case 'prayer':
                         const prayersToday = Object.values(todayData.prayerData || {}).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length;
                         // This part needs more specific logic based on the challenge.
                         break;
                }

                if (newProgress !== uc.progress || (shouldLogToday && uc.last_logged_date !== todayKey)) {
                    hasChanged = true;
                    const isCompleted = newProgress >= base.target;
                    return {
                        ...uc,
                        progress: newProgress,
                        status: isCompleted ? 'completed' : 'active',
                        completed_at: isCompleted ? new Date().toISOString() : undefined,
                        last_logged_date: shouldLogToday ? todayKey : uc.last_logged_date,
                    };
                }
                return uc;
            });

            return hasChanged ? updatedChallenges : prevChallenges;
        });
    }, [challenges]);

    return {
        userChallenges,
        isLoading,
        error,
        startChallenge,
        logManualChallengeProgress,
        setUserChallenges,
        updateAutoTrackedChallenges,
    };
};
