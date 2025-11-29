import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { AuthContextType, UserProfile } from '../types';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<AuthContextType['session']>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewAsUser, setViewAsUser] = useState(true);
    
    useEffect(() => {
        const getInitialSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting session:", error);
            } else {
                setSession(data.session);
                if(data.session?.user) {
                    await fetchProfile(data.session.user.id);
                }
            }
            setIsLoading(false);
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
         try {
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`*`)
                .eq('id', userId)
                .single();

            if (error && status !== 406) {
                throw error;
            }
            
            if (data) {
                setProfile({
                    id: data.id,
                    name: data.full_name,
                    email: data.email,
                    picture: data.avatar_url,
                    role: data.role || 'user',
                });
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };
    
    const toggleRole = async () => {
        if (!profile) return;
        
        const newRole = profile.role === 'admin' ? 'user' : 'admin';
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', profile.id);

            if (error) throw error;
            setProfile(p => p ? { ...p, role: newRole } : null);

        } catch (error) {
            console.error(`Error toggling role to ${newRole}:`, error);
        }
    }

    const toggleViewMode = () => {
        if (profile?.role === 'admin') {
            setViewAsUser(prev => !prev);
        }
    };

    const value: AuthContextType = {
        session,
        profile,
        isLoading,
        // FIX: Changed `pass` parameter to `password` to match usage.
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        // FIX: Changed `pass` parameter to `password` to match usage.
        signUp: (email, password) => supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    // Default name, user can change it later
                    full_name: email.split('@')[0]
                }
            }
        }),
        signOut: () => supabase.auth.signOut(),
        viewAsUser,
        toggleViewMode,
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