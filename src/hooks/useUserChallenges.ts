import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { UserChallenge, UserProfile, AppData, BaseChallenge, PrayerStatus, DailyData } from '../types';
import { MOCK_USER_CHALLENGES } from '../mockData';
import { AZKAR_DATA } from '../constants';
import { safeLocalStorage } from '../utils';

interface UseUserChallengesReturn {
    userChallenges: UserChallenge[];
    isLoading: boolean;
    error: string | null;
    startChallenge: (challengeId: string) => Promise<boolean>;
    logManualChallengeProgress: (challengeId: string) => Promise<boolean>;
    setUserChallenges: Dispatch<SetStateAction<UserChallenge[]>>;
    updateAutoTrackedChallenges: (appData: AppData, todayKey: string) => void;
}

export const useUserChallenges = (profile: UserProfile | null, challenges: BaseChallenge[]): UseUserChallengesReturn => {
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const saveData = useCallback((data: UserChallenge[]) => {
        if (profile) {
            safeLocalStorage.setItem(`userChallenges_${profile.id}`, JSON.stringify(data));
        }
    }, [profile]);
    
    useEffect(() => {
        if (!profile) {
            setIsLoading(false);
            return;
        }
        
        try {
            setIsLoading(true);
            const savedChallenges = safeLocalStorage.getItem(`userChallenges_${profile.id}`);
            if (savedChallenges) {
                setUserChallenges(JSON.parse(savedChallenges));
            } else {
                setUserChallenges(MOCK_USER_CHALLENGES);
            }
        } catch (e) {
            console.error("Failed to load user challenges", e);
            setError("Failed to load user challenges");
        } finally {
            setIsLoading(false);
        }
    }, [profile]);

    const startChallenge = async (challengeId: string): Promise<boolean> => {
        if (!profile) return false;
        
        if (userChallenges.some(uc => uc.challenge_id === challengeId)) {
            console.warn("Challenge already started");
            return false;
        }

        const baseChallenge = challenges.find(c => c.id === challengeId);
        if (!baseChallenge) return false;

        const newChallenge: UserChallenge = {
            id: Date.now(),
            user_id: profile.id,
            challenge_id: challengeId,
            started_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
        };

        const updatedChallenges = [...userChallenges, newChallenge];
        setUserChallenges(updatedChallenges);
        saveData(updatedChallenges);
        return true;
    };
    
    const logManualChallengeProgress = async (challengeId: string): Promise<boolean> => {
        if (!profile) return false;

        let challengeCompleted = false;
        const updatedChallenges = userChallenges.map(uc => {
            if (uc.challenge_id === challengeId && uc.status === 'active') {
                const baseChallenge = challenges.find(c => c.id === challengeId);
                if (!baseChallenge) return uc;

                const newProgress = uc.progress + 1;
                const isCompleted = newProgress >= baseChallenge.target;
                if(isCompleted) challengeCompleted = true;

                return { 
                    ...uc, 
                    progress: newProgress, 
                    last_logged_date: new Date().toISOString().split('T')[0],
                    status: isCompleted ? 'completed' : 'active',
                    completed_at: isCompleted ? new Date().toISOString() : undefined,
                };
            }
            return uc;
        });
        
        setUserChallenges(updatedChallenges);
        saveData(updatedChallenges);
        return challengeCompleted;
    };
    
    const updateAutoTrackedChallenges = useCallback((appData: AppData, todayKey: string) => {
        const todayData = appData[todayKey];
        if (!todayData) return;

        const activeAutoChallenges = userChallenges.filter(c => {
            const base = challenges.find(bc => bc.id === c.challenge_id);
            return c.status === 'active' && base?.tracking === 'auto';
        });

        if (activeAutoChallenges.length === 0) return;

        let hasChanged = false;
        const updatedChallenges = userChallenges.map(uc => {
            const baseChallenge = challenges.find(bc => bc.id === uc.challenge_id);
            if (!baseChallenge || uc.status !== 'active' || baseChallenge.tracking !== 'auto') {
                return uc;
            }

            let newProgress = uc.progress;
            
            if (baseChallenge.relatedItem === 'quran' && todayData.quranPagesRead !== undefined) {
                 // Quran challenge progress is total pages read
                // FIX: Add type annotation for `day` to resolve error.
                newProgress = Object.values(appData).reduce((sum, day: Partial<DailyData>) => sum + (day.quranPagesRead || 0), 0);
            } else if (baseChallenge.relatedItem === 'azkar_morning' && todayData.azkarStatus?.['أذكار الصباح']) {
                const category = AZKAR_DATA.find(c => c.name === 'أذكار الصباح');
                const progress = todayData.azkarStatus['أذكار الصباح'];
                if(category && progress && category.items.every(item => (progress[item.id] || 0) >= item.repeat)) {
                    if (uc.last_logged_date !== todayKey) {
                        newProgress = uc.progress + 1;
                        hasChanged = true;
                    }
                }
            }
             // Add other auto-tracking logic here...

            if (newProgress > uc.progress) {
                hasChanged = true;
                const isCompleted = newProgress >= baseChallenge.target;
                return {
                    ...uc,
                    progress: newProgress,
                    last_logged_date: todayKey,
                    status: isCompleted ? 'completed' : 'active',
                    completed_at: isCompleted ? new Date().toISOString() : undefined,
                };
            }

            return uc;
        });
        
        if (hasChanged) {
            setUserChallenges(updatedChallenges);
            saveData(updatedChallenges);
        }

    }, [userChallenges, saveData, challenges]);

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