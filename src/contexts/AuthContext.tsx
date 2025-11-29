
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, UserProfile, Session, AuthResponse, AuthError } from '../types';
import { safeLocalStorage } from '../utils';

// Mock user data
const MOCK_PROFILES: { [email: string]: UserProfile } = {
    'user@mahyay.app': {
        id: 'mock_user_id',
        name: 'مستخدم تجريبي',
        email: 'user@mahyay.app',
        picture: 'https://i.pravatar.cc/150?u=user@mahyay.app',
        role: 'user',
    },
    'admin@mahyay.app': {
        id: 'mock_admin_id',
        name: 'مدير تجريبي',
        email: 'admin@mahyay.app',
        picture: 'https://i.pravatar.cc/150?u=admin@mahyay.app',
        role: 'admin',
    }
};

// This is a partial mock of the Supabase Session object
interface MockSession extends Omit<Session, 'provider_token' | 'provider_refresh_token'> {
    provider_token?: string | null;
    provider_refresh_token?: string | null;
}


export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for a saved session in localStorage on initial load
        const savedSession = safeLocalStorage.getItem('mock_session');
        if (savedSession) {
            try {
                const parsedSession: MockSession = JSON.parse(savedSession);
                if (parsedSession?.user?.email && MOCK_PROFILES[parsedSession.user.email]) {
                    setSession(parsedSession as Session);
                    setProfile(MOCK_PROFILES[parsedSession.user.email]);
                }
            } catch (e) {
                console.error("Failed to parse mock session from storage", e);
                safeLocalStorage.removeItem('mock_session');
            }
        }
        setIsLoading(false);
    }, []);

    const signIn = async (email: string, password: string): Promise<AuthResponse> => {
        setIsLoading(true);
        // In this local mock, we only check the password for 'password123'
        if (MOCK_PROFILES[email] && password === 'password123') {
            const userProfile = MOCK_PROFILES[email];
            const mockSession: MockSession = {
                access_token: 'mock_access_token',
                token_type: 'bearer',
                user: {
                    id: userProfile.id,
                    app_metadata: {},
                    user_metadata: { name: userProfile.name, picture: userProfile.picture },
                    aud: 'authenticated',
                    created_at: new Date().toISOString(),
                    email: userProfile.email,
                },
                expires_at: Date.now() / 1000 + 3600,
                expires_in: 3600,
                refresh_token: 'mock_refresh_token',
            };

            setSession(mockSession as Session);
            setProfile(userProfile);
            safeLocalStorage.setItem('mock_session', JSON.stringify(mockSession));
            setIsLoading(false);
            
            // Supabase client returns this structure
            return { data: { session: mockSession as Session, user: mockSession.user }, error: null };
        } else {
            setIsLoading(false);
            const error: AuthError = {
                name: 'AuthApiError',
                message: 'بيانات الدخول غير صحيحة.',
                status: 400,
            };
            return { data: { session: null, user: null }, error };
        }
    };

    const signUp = async (email: string, password: string): Promise<AuthResponse> => {
        const error: AuthError = {
            name: 'AuthApiError',
            message: 'إنشاء حسابات جديدة معطل في الوضع المحلي.',
            status: 400,
        };
        return { data: { session: null, user: null }, error };
    };

    const signOut = async (): Promise<{ error: AuthError | null }> => {
        setSession(null);
        setProfile(null);
        safeLocalStorage.removeItem('mock_session');
        return { error: null };
    };
    
    // This is a mock function, it doesn't persist the role change anywhere permanently
    const toggleRole = async (): Promise<void> => {
        setProfile(p => {
            if (!p) return null;
            const newRole = p.role === 'admin' ? 'user' : 'admin';
            return { ...p, role: newRole };
        });
    };

    const value: AuthContextType = {
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        toggleRole
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
