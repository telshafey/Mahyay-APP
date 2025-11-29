import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, UserProfile } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // FIX: Add state for toggling admin view mode.
    // جعلنا القيمة الافتراضية true ليبدأ التطبيق بواجعة المستخدم حتى للمدير
    const [viewAsUser, setViewAsUser] = useState(true);

    useEffect(() => {
        // Mock implementation to auto-login as admin for development.
        const mockProfile: UserProfile = {
            id: 'admin-user-id',
            name: 'المدير العام',
            email: 'admin@mahyay.app',
            picture: 'https://placehold.co/100x100/d4af37/1e4d3b/png?text=A',
            role: 'admin'
        };
        setProfile(mockProfile);
        setIsLoading(false);
    }, []);

    // FIX: Implement the view mode toggle function for admins.
    const toggleViewMode = () => {
        if (profile?.role === 'admin') {
            setViewAsUser(prev => !prev);
        }
    };

    const value: AuthContextType = {
        session: null,
        profile,
        isLoading,
        signIn: async (email, password) => { 
            console.log('Mock signIn called with:', email, password);
            // Simulate login
            const mockProfile: UserProfile = {
                id: 'admin-user-id',
                name: 'المدير العام',
                email: 'admin@mahyay.app',
                picture: 'https://placehold.co/100x100/d4af37/1e4d3b/png?text=A',
                role: 'admin'
            };
            setProfile(mockProfile);
            return { error: null }; 
        },
        signUp: async (email, password) => { 
            console.log('Mock signUp called with:', email, password);
            return { error: null }; 
        },
        signOut: async () => { 
            console.log('Mock signOut called');
            setProfile(null);
            return { error: null }; 
        },
        viewAsUser,
        toggleViewMode,
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