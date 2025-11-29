import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

// Google Icon SVG
const GoogleIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 36.49 44 30.686 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);


const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`py-3 px-6 font-semibold transition-colors w-1/2 text-lg ${isActive ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70 hover:text-white'}`}
    >
        {label}
    </button>
);

// New component for the login button
const GoogleLogin: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { signInWithGoogle } = useAuthContext();
    
    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        const { error: authError } = await signInWithGoogle();
        if (authError) {
            setError(authError.message);
            setLoading(false);
        }
        // On success, Supabase redirects, so no need to setLoading(false)
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-center text-white mb-2">
                {isAdmin ? 'دخول لوحة التحكم' : 'مرحباً بك في مَحيّاي'}
            </h2>
            <p className="text-center text-white/80 mb-6 text-sm">
                {isAdmin 
                    ? 'استخدم حساب جوجل الخاص بالمدير للوصول.' 
                    : 'سجّل دخولك بسرعة وأمان باستخدام حسابك في جوجل.'
                }
            </p>
            {error && <p className="text-red-300 bg-red-900/50 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-70 flex justify-center items-center gap-3"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                ) : (
                    <>
                        <GoogleIcon />
                        <span>{isAdmin ? 'الدخول كمدير عبر جوجل' : 'الدخول عبر جوجل'}</span>
                    </>
                )}
            </button>
        </div>
    );
};


const LoginPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
    const { profile } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (profile) {
            const destination = profile.role === 'admin' ? '/admin' : '/';
            navigate(destination, { replace: true });
        }
    }, [profile, navigate]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="font-amiri text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
                    مَحيّاي
                </h1>
                <p className="text-xl mt-2 text-white/90">رفيقك الروحي اليومي</p>
            </div>

            <GlassCard className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="flex justify-center border-b-2 border-white/10">
                    <TabButton label="تسجيل دخول المستخدم" isActive={activeTab === 'user'} onClick={() => setActiveTab('user')} />
                    <TabButton label="تسجيل دخول المدير" isActive={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
                </div>
                
                {activeTab === 'user' ? <GoogleLogin isAdmin={false} /> : <GoogleLogin isAdmin={true} />}

            </GlassCard>

            <div className="text-xs text-white/60 mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <p className="mb-2">بالدخول، أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
                <div className="flex justify-center items-center gap-4">
                     <Link to="/more/terms" className="hover:text-white underline">شروط الاستخدام</Link>
                     <span>-</span>
                     <Link to="/more/privacy" className="hover:text-white underline">سياسة الخصوصية</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
