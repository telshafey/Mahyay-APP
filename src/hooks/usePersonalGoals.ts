import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { PersonalGoal, PersonalGoalsContextType, UserProfile } from '../types';

export const usePersonalGoals = (profile: UserProfile | null): PersonalGoalsContextType & { isLoading: boolean, error: string | null, setPersonalGoals: Function, setGoalProgress: Function } => {
    const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
    const [goalProgress, setGoalProgress] = useState<{ [goalId: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) {
            setIsLoading(false);
            return;
        }

        const loadGoalsData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch goals and progress in parallel
                const [{ data: goalsData, error: goalsError }, { data: progressData, error: progressError }] = await Promise.all([
                    supabase.from('personal_goals').select('*').eq('user_id', profile.id),
                    supabase.from('goal_progress').select('*').eq('user_id', profile.id)
                ]);

                if (goalsError) throw goalsError;
                if (progressError) throw progressError;

                setPersonalGoals(goalsData || []);
                const progressMap = Object.fromEntries(
                    (progressData || []).map(p => [p.goal_id, p.progress])
                );
                setGoalProgress(progressMap);

            } catch (err) {
                console.error('Failed to load goals data:', err);
                const message = err instanceof Error ? err.message : "فشل تحميل الأهداف الشخصية";
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        loadGoalsData();
    }, [profile]);
    
    const handleSaveError = (error: unknown, context: string): void => {
        console.error(`Error in ${context}:`, error);
        // In a real app, you'd show a notification to the user here.
    };
    
    const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>): Promise<boolean> => {
        if (!profile) return false;
        
        try {
            const { data, error } = await supabase.from('personal_goals').insert({
                ...goal,
                user_id: profile.id
            }).select().single();

            if (error) throw error;
            if (data) setPersonalGoals(prev => [...prev, data]);
            return true;
        } catch (error) {
            handleSaveError(error, "addPersonalGoal");
            return false;
        }
    };
    
    const deletePersonalGoal = async (goalId: string): Promise<boolean> => {
        if (!profile) return false;
        const originalGoals = [...personalGoals];
        setPersonalGoals(prev => prev.filter(g => g.id !== goalId)); // Optimistic delete
        try {
            // Also delete any progress associated with this goal
            await Promise.all([
                supabase.from('personal_goals').delete().eq('id', goalId),
                supabase.from('goal_progress').delete().eq('goal_id', goalId)
            ]);
            // No need to throw error for progress deletion failure, main goal deletion is key
            return true;
        } catch (error) {
            handleSaveError(error, "deletePersonalGoal");
            setPersonalGoals(originalGoals); // Revert on failure
            return false;
        }
    };

    const toggleGoalArchivedStatus = async (goalId: string): Promise<boolean> => {
        const goal = personalGoals.find(g => g.id === goalId);
        if (!goal) return false;

        const updatedStatus = !goal.is_archived;
        const originalGoals = [...personalGoals];
        setPersonalGoals(prev => prev.map(g => g.id === goalId ? { ...g, is_archived: updatedStatus, completed_at: updatedStatus ? new Date().toISOString() : null } : g));

        try {
            const { error } = await supabase.from('personal_goals')
                .update({ is_archived: updatedStatus, completed_at: updatedStatus ? new Date().toISOString() : null })
                .eq('id', goalId);
            if (error) throw error;
            return true;
        } catch (error) {
            handleSaveError(error, "toggleGoalArchivedStatus");
            setPersonalGoals(originalGoals); // Revert
            return false;
        }
    };
    
    const updateTargetGoalProgress = async (goalId: string, newValue: number): Promise<boolean> => {
        if (!profile) return false;
        const originalProgress = { ...goalProgress };
        const newProgressValue = Math.max(0, newValue);
        setGoalProgress(prev => ({ ...prev, [goalId]: newProgressValue }));

        try {
            const { error } = await supabase.from('goal_progress').upsert({
                user_id: profile.id,
                goal_id: goalId,
                progress: newProgressValue
            }, { onConflict: 'user_id, goal_id' });
            if (error) throw error;
            return true;
        } catch (error) {
            handleSaveError(error, "updateTargetGoalProgress");
            setGoalProgress(originalProgress); // Revert
            return false;
        }
    };

    // This is a special case. Daily goal completion is part of the `daily_entries` table,
    // not the `personal_goals` table. So it's passed down to be handled by `useAppData`.
    // We provide a placeholder here, the real implementation is in `useAppData`.
    // Fix: Made the function async to match the type definition '(goalId: string) => Promise<void>'.
    const toggleDailyGoalCompletion = async (_goalId: string) => {
        // This function's logic is implemented in useAppData as it modifies daily data.
        console.warn("toggleDailyGoalCompletion should be handled by the main app data hook.");
    };

    return {
        personalGoals,
        goalProgress,
        addPersonalGoal,
        updateTargetGoalProgress,
        toggleDailyGoalCompletion, // Placeholder, see note above
        deletePersonalGoal,
        toggleGoalArchivedStatus,
        isLoading,
        error,
        setPersonalGoals, // Exposed for reset functionality
        setGoalProgress,  // Exposed for reset functionality
    };
};