





import { useState, useEffect } from 'react';
// FIX: Import PersonalGoalsContextType to resolve the type error.
import { PersonalGoal, PersonalGoalsContextType, UserProfile } from '../types';
import { MOCK_PERSONAL_GOALS, MOCK_GOAL_PROGRESS } from '../mockData';

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

        const loadMockGoals = () => {
            setIsLoading(true);
            setError(null);
            setPersonalGoals(MOCK_PERSONAL_GOALS);
            setGoalProgress(MOCK_GOAL_PROGRESS);
            setIsLoading(false);
        };

        loadMockGoals();
    }, [profile]);
    
    const handleSaveError = (error: unknown, context: string): void => {
        console.error(`Error in ${context}:`, error);
        // In a real app, you'd show a notification to the user here.
    };
    
    const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>): Promise<boolean> => {
        if (!profile) return false;
        
        const newGoal: PersonalGoal = {
            ...goal,
            id: `mock_${new Date().getTime()}`,
            user_id: profile.id,
            created_at: new Date().toISOString(),
            is_archived: false,
            completed_at: null,
        };
        setPersonalGoals(prev => [...prev, newGoal]);
        console.log("Mock: Added new personal goal", newGoal);
        return true;
    };
    
    const deletePersonalGoal = async (goalId: string): Promise<boolean> => {
        if (!profile) return false;
        setPersonalGoals(prev => prev.filter(g => g.id !== goalId));
        setGoalProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[goalId];
            return newProgress;
        });
        console.log("Mock: Deleted personal goal", goalId);
        return true;
    };

    const toggleGoalArchivedStatus = async (goalId: string): Promise<boolean> => {
        const goal = personalGoals.find(g => g.id === goalId);
        if (!goal) return false;

        const updatedStatus = !goal.is_archived;
        setPersonalGoals(prev => prev.map(g => g.id === goalId ? { ...g, is_archived: updatedStatus, completed_at: updatedStatus ? new Date().toISOString() : null } : g));
        console.log(`Mock: Toggled archive status for goal ${goalId} to ${updatedStatus}`);
        return true;
    };
    
    const updateTargetGoalProgress = async (goalId: string, newValue: number): Promise<boolean> => {
        if (!profile) return false;
        const newProgressValue = Math.max(0, newValue);
        setGoalProgress(prev => ({ ...prev, [goalId]: newProgressValue }));
        console.log(`Mock: Updated progress for goal ${goalId} to ${newProgressValue}`);
        return true;
    };

    const toggleDailyGoalCompletion = (goalId: string): void => {
        console.warn("toggleDailyGoalCompletion should be handled by the main app data hook.");
    };

    return {
        personalGoals,
        goalProgress,
        addPersonalGoal,
        updateTargetGoalProgress,
        toggleDailyGoalCompletion,
        deletePersonalGoal,
        toggleGoalArchivedStatus,
        isLoading,
        error,
        setPersonalGoals,
        setGoalProgress,
    };
};
