import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { UserChallenge, UserProfile } from '../types';
import { CHALLENGES } from '../constants';

export const useUserChallenges = (profile: UserProfile | null): { 
    userChallenges: UserChallenge[]; 
    startChallenge: (challengeId: string) => Promise<boolean>;
    logManualChallengeProgress: (challengeId: string) => Promise<boolean>;
    updateAutoChallengeProgress: (challengeType: string | undefined, change: number) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    setUserChallenges: Function;
} => {
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const showNotification = (message: string, icon: string) => {
        // In a real app, you would use a context-based notification system.
        console.log(`[${icon}] ${message}`);
        // For now, we rely on the main hook's notification system.
    };

    useEffect(() => {
        if (!profile) {
            setIsLoading(false);
            return;
        }
        
        const loadChallenges = async () => {
             setIsLoading(true);
             setError(null);
            try {
                const { data, error: dbError } = await supabase
                    .from('user_challenges')
                    .select('*')
                    .eq('user_id', profile.id);

                if (dbError) throw dbError;
                setUserChallenges(data || []);
            } catch (err) {
                console.error("Failed to load user challenges:", err);
                const message = err instanceof Error ? err.message : "فشل تحميل بيانات التحديات";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };
       
        loadChallenges();

    }, [profile]);
    
    const handleSaveError = (error: unknown, context: string): void => {
        console.error(`Error in ${context}:`, error);
    };

    const startChallenge = async (challengeId: string): Promise<boolean> => {
        if (!profile) return false;
        if (userChallenges.some(c => c.challenge_id === challengeId)) {
            showNotification('لقد بدأت هذا التحدي بالفعل!', 'ℹ️');
            return false;
        }

        try {
            const { data, error } = await supabase
                .from('user_challenges')
                .insert({ user_id: profile.id, challenge_id: challengeId, status: 'active', progress: 0 })
                .select()
                .single();

            if (error) throw error;
            setUserChallenges(prev => [...prev, data]);
            showNotification(`بدأ تحدي جديد!`, '🚀');
            return true;
        } catch (error) {
            handleSaveError(error, "startChallenge");
            return false;
        }
    };
    
    const updateChallenge = async (challengeId: number, updates: Partial<UserChallenge>): Promise<boolean> => {
        const originalChallenges = [...userChallenges];
        setUserChallenges(prev => prev.map(c => c.id === challengeId ? { ...c, ...updates } : c));
        
        try {
            const { error } = await supabase
                .from('user_challenges')
                .update(updates)
                .eq('id', challengeId);
            if (error) throw error;
            return true;
        } catch(error) {
            handleSaveError(error, "updateChallenge");
            setUserChallenges(originalChallenges); // Revert on failure
            return false;
        }
    };

    const logManualChallengeProgress = async (challengeId: string): Promise<boolean> => {
        const userChallenge = userChallenges.find(c => c.challenge_id === challengeId && c.status === 'active');
        if (!userChallenge) return false;

        const baseChallenge = CHALLENGES.find(c => c.id === challengeId);
        if (!baseChallenge) return false;
        
        const todayKey = new Date().toISOString().split('T')[0];
        if(userChallenge.last_logged_date === todayKey) {
            showNotification('تم التسجيل لهذا اليوم بالفعل', 'ℹ️');
            return false;
        }

        const newProgress = (userChallenge.progress || 0) + 1;
        const newStatus = newProgress >= baseChallenge.target ? 'completed' : 'active';

        return await updateChallenge(userChallenge.id, {
            progress: newProgress,
            status: newStatus,
            last_logged_date: todayKey,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
        });
    };
    
    const updateAutoChallengeProgress = async (challengeType: string | undefined, change: number): Promise<void> => {
        if (!challengeType) return;
        
        const relevantChallenges = userChallenges.filter(uc => {
            const base = CHALLENGES.find(c => c.id === uc.challenge_id);
            return uc.status === 'active' && base?.relatedItem === challengeType;
        });

        for (const userChallenge of relevantChallenges) {
            const baseChallenge = CHALLENGES.find(c => c.id === userChallenge.challenge_id)!;
            const newProgress = Math.max(0, (userChallenge.progress || 0) + change);
            const newStatus = newProgress >= baseChallenge.target ? 'completed' : 'active';
            
            await updateChallenge(userChallenge.id, {
                progress: newProgress,
                status: newStatus,
                completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
            });
        }
    };


    return {
        userChallenges,
        startChallenge,
        logManualChallengeProgress,
        updateAutoChallengeProgress,
        isLoading,
        error,
        setUserChallenges, // Exposed for reset functionality
    };
};