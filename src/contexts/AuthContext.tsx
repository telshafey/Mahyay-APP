import React, { createContext, useState, useEffect, useContext } from 'react';
import type { UserProfile, AuthContextType } from '../types';
import { supabase } from '../supabase';
import { Session } from '@supabase/supabase-js';

const ADMIN_EMAILS = ['elshafey.tamer@gmail.com']; // Admin list

export const AuthContext = createContext<AuthContextType | null>(null);

const createProfileFromSession = (session: Session | null): UserProfile | null => {
    if (!session?.user) {
        return null;
    }

    const user = session.user;
    const email = user.email || '';
    const name = user.user_metadata?.name || email.split('@')[0] || 'مستخدم جديد';
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    
    return {
        id: user.id,
        name: name,
        email: user.email,
        picture: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=d4af37`,
        role: role
    };
};


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setProfile(createProfileFromSession(session));
            setIsLoading(false);
        };
        
        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setProfile(createProfileFromSession(session));
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, pass: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        return { error };
    };

    const signUp = async (email: string, pass: string) => {
        // Simplify the call to eliminate potential issues with metadata.
        // The database trigger is already configured to handle a missing name.
        const { error } = await supabase.auth.signUp({
            email,
            password: pass,
        });
        return { error };
    };
    
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return (
        <AuthContext.Provider value={{
            session,
            profile,
            isLoading,
            signIn,
            signUp,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuthContext must be used within an AuthProvider. Make sure your component is a child of AuthProvider.");
    }
    return context;
};