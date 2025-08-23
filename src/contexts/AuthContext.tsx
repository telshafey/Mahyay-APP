import React, { createContext, useState, useEffect } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { UserProfile, AuthContextType } from '../types.ts';
import { supabase, Database } from '../supabase.ts';

const ADMIN_EMAIL = 'elshafey.tamer@gmail.com';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // This function immediately checks the current session and fetches the user profile.
        // It's the most reliable way to prevent the app from getting stuck on the loading screen.
        const initializeSession = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error("Error getting session:", sessionError);
                setIsLoading(false);
                return;
            }

            const currentUser = session?.user;
            setUser(currentUser ?? null);

            if (currentUser) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                
                if (error && error.code !== 'PGRST116') {
                    console.error('Error fetching profile on initial load:', error);
                } else {
                    const userProfile = data as unknown as UserProfile | null;
                    setProfile(userProfile);
                    setIsAdmin(userProfile?.email?.toLowerCase() === ADMIN_EMAIL);
                }
            }
            
            setIsLoading(false);
        };

        initializeSession();

        // After the initial check, we set up a listener for any subsequent auth changes (e.g., login, logout).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            setUser(currentUser ?? null);

            if (currentUser) {
                 const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                
                 if (!error || error.code === 'PGRST116') {
                    const userProfile = data as unknown as UserProfile | null;
                    setProfile(userProfile);
                    setIsAdmin(userProfile?.email?.toLowerCase() === ADMIN_EMAIL);
                 }
            } else {
                setProfile(null);
                setIsAdmin(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                queryParams: {
                    prompt: 'select_account',
                },
            },
        });
        if (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };
    
    const signUpWithEmail = async (name: string, email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
                }
            }
        });
        if (error) {
            console.error('Error signing up:', error);
            if(error.message.toLowerCase().includes("user already registered")) {
                 throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
            }
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            console.error('Error signing in:', error);
            if (error.message.toLowerCase().includes("invalid login credentials")) {
                throw new Error("بريد إلكتروني أو كلمة مرور غير صحيحة.");
            }
            if (error.message.toLowerCase().includes("email not confirmed")) {
                throw new Error("لم يتم تأكيد بريدك الإلكتروني. يرجى التحقق من بريدك الوارد واتباع رابط التفعيل.");
            }
            throw error;
        }
    };
    
    const signInAsGuest = () => {
        const guestUser = {
            id: 'guest',
            app_metadata: { provider: 'guest' },
            user_metadata: {
                name: 'ضيف',
                picture: `https://api.dicebear.com/8.x/initials/svg?seed=ضيف`,
            },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: '',
        } as unknown as SupabaseUser;

        const guestProfile: UserProfile = {
            id: 'guest',
            name: 'ضيف',
            email: '',
            picture: `https://api.dicebear.com/8.x/initials/svg?seed=ضيف`,
        };
        
        setUser(guestUser);
        setProfile(guestProfile);
        setIsAdmin(false);
        setIsLoading(false);
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    };
    
    const updateUserProfile = async (name: string, picture?: string) => {
        if (!user || !profile) return;
        
        const updates: Database['public']['Tables']['profiles']['Update'] = {
            name,
        };
        if(picture) updates.picture = picture;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
            
        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        setProfile(data as unknown as UserProfile | null);
        if (picture) {
             alert("تم تحديث الصورة الشخصية بنجاح.");
        } else {
             alert("تم تحديث الاسم بنجاح.");
        }
    };

    const updateUserProfilePicture = async (file: File) => {
        if (!user || !profile) {
            throw new Error("يجب أن تكون مسجلاً للدخول لتحديث صورتك.");
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension)) {
            throw new Error("يرجى اختيار ملف صورة صالح (png, jpg, jpeg, webp).");
        }
        
        const filePath = `${user.id}/avatar.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true,
            });

        if (uploadError) {
            console.error('Error uploading avatar:', JSON.stringify(uploadError, null, 2));
            if (uploadError.message.includes('syntax error')) {
                 throw new Error("فشل رفع الصورة بسبب خطأ في إعدادات قاعدة البيانات. يرجى التواصل مع الدعم الفني وتزويدهم بالخطأ: 'Storage RLS syntax error'.");
            }
            if (uploadError.message.includes('policy') || uploadError.message.includes('RLS')) {
                throw new Error("فشل رفع الصورة بسبب سياسات الأمان. هذا يعني أن إعدادات الصلاحيات في قاعدة البيانات غير صحيحة. يرجى التأكد من تشغيل أحدث نص برمجي SQL لإصلاحها.");
            }
            throw new Error("حدث خطأ غير متوقع أثناء رفع الصورة.");
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        if (!data.publicUrl) {
             throw new Error("لم نتمكن من الحصول على رابط الصورة بعد رفعها.");
        }
        
        const publicUrlWithCacheBuster = `${data.publicUrl}?t=${new Date().getTime()}`;

        await updateUserProfile(profile.name || '', publicUrlWithCacheBuster);
    };
    
    const deleteAccount = async () => {
        if (!user) return;
        if (!window.confirm("⚠️ تحذير! هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع بياناتك نهائياً ولا يمكن استعادتها.")) return;
        
        const { error } = await supabase.rpc('delete_user_account');
        if (error) {
            console.error('Error deleting account:', error);
            alert("حدث خطأ أثناء حذف الحساب.");
            throw error;
        }
        
        await supabase.auth.signOut();
        alert("تم حذف الحساب وجميع البيانات بنجاح.");
    };
    
    const sendPasswordResetEmail = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin, // Redirect to the app's base URL
        });
        if (error) {
            console.error('Error sending password reset email:', error);
            throw new Error("حدث خطأ أثناء إرسال رابط إعادة التعيين.");
        }
    };


    return (
        <AuthContext.Provider value={{
            user,
            profile,
            isLoading,
            isAdmin,
            logout,
            signInWithGoogle,
            signUpWithEmail,
            signInWithEmail,
            signInAsGuest,
            updateUserProfile,
            updateUserProfilePicture,
            deleteAccount,
            sendPasswordResetEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
};