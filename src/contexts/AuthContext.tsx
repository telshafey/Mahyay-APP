
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AuthContextType, UserProfile } from '../types';
import { safeLocalStorage } from '../utils';

const MOCK_PROFILE: UserProfile = {
    id: 'local_dev_user', // A single ID for all local storage
    name: 'المطور',
    email: 'dev@mahyay.app',
    picture: `https://i.pravatar.cc/150?u=dev@mahyay.app`,
    role: 'admin', // The "underlying" user is an admin to allow toggling
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile] = useState<UserProfile>(MOCK_PROFILE);
    const [isLoading, setIsLoading] = useState(true);

    // 'viewAsUser' is the toggle state. true = user view, false = admin view.
    const [viewAsUser, setViewAsUser] = useState<boolean>(() => {
        const savedMode = safeLocalStorage.getItem('dev_view_as_user');
        // Default to user view for a better "first run" experience
        return savedMode ? JSON.parse(savedMode) : true;
    });

    useEffect(() => {
        // Simulate auth loading
        setTimeout(() => setIsLoading(false), 300);
    }, []);

    const toggleViewMode = useCallback(() => {
        setViewAsUser(prev => {
            const newMode = !prev;
            safeLocalStorage.setItem('dev_view_as_user', JSON.stringify(newMode));
            return newMode;
        });
    }, []);

    const signOut = useCallback(async (): Promise<void> => {
        console.log("Signing out...");
        safeLocalStorage.removeItem('dev_view_as_user');
        // A full page reload is a simple way to reset state and mimic logout.
        window.location.reload(); 
    }, []);

    // Mock for LoginPage
    const signInWithGoogle = async (): Promise<{ error: Error | null; }> => {
        console.log("Mock signInWithGoogle called");
        alert("This is a mock login. You are already logged in as the developer.");
        return { error: null };
    };

    const value: AuthContextType = {
        profile,
        viewAsUser,
        toggleViewMode,
        signOut,
        isLoading,
        signInWithGoogle,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
