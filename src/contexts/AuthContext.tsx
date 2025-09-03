import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, AuthContextType } from '../types.ts';

const PROFILE_KEY = 'mahyay_userProfile';

export const AuthContext = createContext<AuthContextType | null>(null);

const getDefaultProfile = (name = 'زائر'): UserProfile => ({
    id: 'localUser',
    name: name,
    picture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedProfile = localStorage.getItem(PROFILE_KEY);
            if (storedProfile) {
                setProfile(JSON.parse(storedProfile));
            } else {
                const defaultProfile = getDefaultProfile();
                setProfile(defaultProfile);
                localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
            }
        } catch (error) {
            console.error("Failed to load profile from localStorage", error);
            setProfile(getDefaultProfile());
        }
        setIsLoading(false);
    }, []);

    const updateUserProfile = useCallback((name: string) => {
        const newProfile = getDefaultProfile(name);
        setProfile(newProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    }, []);
    
    const resetProfile = useCallback(() => {
        localStorage.removeItem(PROFILE_KEY);
        const defaultProfile = getDefaultProfile();
        setProfile(defaultProfile);
        localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    }, []);

    return (
        <AuthContext.Provider value={{
            profile,
            isLoading,
            updateUserProfile,
            resetProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};
