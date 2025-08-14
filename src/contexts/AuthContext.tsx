import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, AuthContextType } from '../types.ts';

// @ts-ignore
const google = window.google;
const USER_DB_KEY = 'mahyayi_user_database'; // Unified key for all users
const ADMIN_EMAIL = 'elshafey.tamer@gmail.com';

export const AuthContext = createContext<AuthContextType | null>(null);

// WARNING: This is a simple, non-secure hashing function for demonstration purposes ONLY.
// In a real-world application, NEVER store passwords this way. Use a strong, salted hashing algorithm like bcrypt.
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConfigured, setIsConfigured] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // This effect runs once to pre-populate the user database for demo purposes.
    useEffect(() => {
        const dbString = localStorage.getItem(USER_DB_KEY);
        if (!dbString || JSON.parse(dbString).length === 0) {
            const initialUsers = [
                { id: `email_${Date.now() + 1}`, name: 'Tamer Elshafey', email: 'elshafey.tamer@gmail.com', passwordHash: simpleHash('112233'), picture: `https://i.pravatar.cc/150?u=email_elshafey.tamer@gmail.com` },
                { id: `email_${Date.now() + 2}`, name: 'Fatima Ahmed', email: 'fatima.ahmed@example.com', passwordHash: simpleHash('password123'), picture: `https://i.pravatar.cc/150?u=email_fatima.ahmed@example.com` },
                { id: `email_${Date.now() + 3}`, name: 'Youssef Ibrahim', email: 'youssef.ibrahim@example.com', passwordHash: simpleHash('password123'), picture: `https://i.pravatar.cc/150?u=email_youssef.ibrahim@example.com` },
                { id: `email_${Date.now() + 4}`, name: 'Aisha Hassan', email: 'aisha.hassan@example.com', passwordHash: simpleHash('password123'), picture: `https://i.pravatar.cc/150?u=email_aisha.hassan@example.com` },
                { id: `email_${Date.now() + 5}`, name: 'Omar Mahmoud', email: 'omar.mahmoud@example.com', passwordHash: simpleHash('password123'), picture: `https://i.pravatar.cc/150?u=email_omar.mahmoud@example.com` },
                { id: `email_${Date.now() + 6}`, name: 'Khadija Ali', email: 'khadija.ali@example.com', passwordHash: simpleHash('password123'), picture: `https://i.pravatar.cc/150?u=email_khadija.ali@example.com` },
            ];
            localStorage.setItem(USER_DB_KEY, JSON.stringify(initialUsers));
        }
    }, []);

    const loginUser = (userData: User) => {
        localStorage.setItem('mahyayi_user', JSON.stringify(userData));
        setUser(userData);
        if (userData?.email && userData.email.toLowerCase() === ADMIN_EMAIL) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    };

    const handleGoogleCredentialResponse = (response: any) => {
        const decoded: { sub: string, name: string, email: string, picture: string } = jwtDecode(response.credential);
        const userData: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture
        };
        loginUser(userData);

        // Also add Google user to the main user DB if they don't exist
        const dbString = localStorage.getItem(USER_DB_KEY);
        const db = dbString ? JSON.parse(dbString) : [];
        const userExists = db.some((u: any) => u.id === userData.id);
        if (!userExists) {
            db.push(userData);
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
        }
    };
    
    const loginAsGuest = () => {
        const guestUser: User = {
            id: 'guest_user',
            name: 'زائر',
        };
        loginUser(guestUser);
    };

    const logout = () => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('mahyayi_user');
        if (google?.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
    };

    const signUpWithEmail = async (name: string, email: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            const dbString = localStorage.getItem(USER_DB_KEY);
            const db = dbString ? JSON.parse(dbString) : [];
            const emailExists = db.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());

            if (emailExists) {
                return reject(new Error("هذا البريد الإلكتروني مسجل بالفعل."));
            }

            const passwordHash = simpleHash(password);
            const newUser: User & { passwordHash: string } = {
                id: `email_${Date.now()}`,
                name,
                email,
                picture: `https://i.pravatar.cc/150?u=email_${email}`, // Placeholder avatar
                passwordHash
            };
            
            db.push(newUser);
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));

            const { passwordHash: _, ...userToLogin } = newUser;
            loginUser(userToLogin);
            resolve();
        });
    };

    const signInWithEmail = async (email: string, password: string): Promise<void> => {
         return new Promise((resolve, reject) => {
            const dbString = localStorage.getItem(USER_DB_KEY);
            if (!dbString) {
                return reject(new Error("بريد إلكتروني أو كلمة مرور غير صحيحة."));
            }
            
            const db = JSON.parse(dbString);
            const foundUser = db.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());
            
            if (!foundUser || !foundUser.passwordHash) {
                return reject(new Error("بريد إلكتروني أو كلمة مرور غير صحيحة."));
            }

            const passwordHash = simpleHash(password);
            if (foundUser.passwordHash !== passwordHash) {
                return reject(new Error("بريد إلكتروني أو كلمة مرور غير صحيحة."));
            }
            
            const { passwordHash: _, ...userToLogin } = foundUser;
            loginUser(userToLogin);
            resolve();
        });
    };
    
    const renderGoogleButton = (element: HTMLElement | null) => {
        if (!isInitialized || !element || user) {
            return;
        }
        if (google?.accounts?.id) {
            google.accounts.id.renderButton(
                element,
                { theme: "filled_black", size: "large", text: "continue_with", shape: "rectangular", logo_alignment: "left", 'locale': 'ar' }
            );
        }
    };
    
    const updateUserProfile = (name: string) => {
        if (!user || !user.id.startsWith('email_')) {
            alert("لا يمكن تغيير الاسم إلا للحسابات التي تم إنشاؤها بالبريد الإلكتروني.");
            return;
        }

        const updatedUser = { ...user, name };
        loginUser(updatedUser); // Update current session

        // Update in the main users database
        const dbString = localStorage.getItem(USER_DB_KEY);
        if (dbString) {
            let db = JSON.parse(dbString);
            const userIndex = db.findIndex((u: any) => u.id === user.id);
            if (userIndex > -1) {
                db[userIndex].name = name;
                db[userIndex].picture = `https://i.pravatar.cc/150?u=email_${user.email}`; // Update picture if name changes it
                localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
            }
        }
        alert("تم تحديث الملف الشخصي بنجاح.");
    };

    const updateUserProfilePicture = () => {
        if (!user) return;
        
        // Generate a new random picture. The timestamp ensures it's unique.
        const newPicture = `https://i.pravatar.cc/150?u=${Date.now()}`;
        const updatedUser = { ...user, picture: newPicture };
        loginUser(updatedUser); // Update current session
    
        // Update in the main users database
        const dbString = localStorage.getItem(USER_DB_KEY);
        if (dbString) {
            let db = JSON.parse(dbString);
            const userIndex = db.findIndex((u: any) => u.id === user.id);
            if (userIndex > -1) {
                db[userIndex].picture = newPicture;
                localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
            }
        }
        alert("تم تحديث الصورة الرمزية بنجاح.");
    };

    const deleteAccount = () => {
        if (!user) return;
        
        // Remove user from the main DB
        const dbString = localStorage.getItem(USER_DB_KEY);
         if (dbString) {
            let db = JSON.parse(dbString);
            db = db.filter((u: any) => u.id !== user.id);
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
         }
        
        const keys = [`mahyayi_appData_${user.id}`, `mahyayi_settings_${user.id}`, `mahyayi_friends_${user.id}`, `mahyayi_groups_${user.id}`, `mahyayi_invitations_${user.id}`, `mahyayi_sharing_${user.id}`];
        keys.forEach(key => localStorage.removeItem(key));
        
        logout();
        alert("تم حذف الحساب وجميع البيانات بنجاح.");
    };

    const getAllUsersForAdmin = (): (User & { id: string; email?: string | undefined; })[] => {
        if (!isAdmin) return [];
        const dbString = localStorage.getItem(USER_DB_KEY);
        if (!dbString) return [];
        const db = JSON.parse(dbString);
        return db.map((u: any) => {
            const { passwordHash, ...userToReturn } = u;
            return userToReturn;
        });
    };

    const updateUserForAdmin = (userId: string, newName: string, newEmail?: string) => {
        if (!isAdmin) return;
        const dbString = localStorage.getItem(USER_DB_KEY);
        if (!dbString) return;

        let db = JSON.parse(dbString);
        const userIndex = db.findIndex((u: any) => u.id === userId);

        if (userIndex > -1) {
            db[userIndex].name = newName;
            if (newEmail !== undefined && db[userIndex].id.startsWith('email_')) {
                db[userIndex].email = newEmail;
            }
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
        }
    };

    const deleteUserForAdmin = (userId: string) => {
        if (!isAdmin) return;
        if (user?.id === userId) {
            alert("لا يمكنك حذف حسابك الخاص من لوحة التحكم.");
            return;
        }

        const dbString = localStorage.getItem(USER_DB_KEY);
        if (dbString) {
            let db = JSON.parse(dbString);
            db = db.filter((u: any) => u.id !== userId);
            localStorage.setItem(USER_DB_KEY, JSON.stringify(db));
        }
        
        const keys = [`mahyayi_appData_${userId}`, `mahyayi_settings_${userId}`, `mahyayi_friends_${userId}`, `mahyayi_groups_${userId}`, `mahyayi_invitations_${userId}`, `mahyayi_sharing_${userId}`];
        keys.forEach(key => localStorage.removeItem(key));
    };


    useEffect(() => {
        setIsLoading(true);
        const storedUser = localStorage.getItem('mahyayi_user');

        if (storedUser) {
            loginUser(JSON.parse(storedUser));
        }

        const clientIdMeta = document.querySelector('meta[name="google-signin-client_id"]');
        const clientId = clientIdMeta ? clientIdMeta.getAttribute('content') : null;

        if (clientId && clientId !== "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
            setIsConfigured(true);
             if (google?.accounts?.id) {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                });
                setIsInitialized(true);
            } else {
                 console.error("Google Identity Services script not loaded.");
            }
        } else {
            setIsConfigured(false);
            console.warn("Google Client ID not found. Authentication will not work.");
        }
        setIsLoading(false);

    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            isConfigured, 
            isAdmin, 
            logout, 
            loginAsGuest, 
            signUpWithEmail, 
            signInWithEmail, 
            renderGoogleButton, 
            updateUserProfile, 
            updateUserProfilePicture, 
            deleteAccount, 
            getAllUsersForAdmin,
            updateUserForAdmin,
            deleteUserForAdmin 
        }}>
            {children}
        </AuthContext.Provider>
    );
};