import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, AuthContextType } from '../types';

const PROFILE_KEY = 'mahyay_userProfile';

export const AuthContext = createContext<AuthContextType | null>(null);

const getDefaultProfile = (name = 'مشرف'): UserProfile => ({
    id: 'localUser',
    name: name,
    picture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`,
    role: 'admin'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedProfile = localStorage.getItem(PROFILE_KEY);
            if (storedProfile) {
                const parsedProfile = JSON.parse(storedProfile);
                if (!parsedProfile.role) {
                    parsedProfile.role = 'admin';
                }
                setProfile(parsedProfile);
            }
            // If no profile is stored, 'profile' remains null, prompting login.
        } catch (error) {
            console.error("Failed to load profile from localStorage", error);
            // On error, profile also remains null.
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
        setProfile(null); // Set profile to null to trigger logout and redirect to login page.
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
