import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '@mahyay/core';
import GlassCard from '../components/GlassCard';

const LoginPage: React.FC = () => {
    const { session, signIn, signUp } = useAuthContext();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        if (session) {
            navigate('/', { replace: true });
        }
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const { error: authError } = isLogin 
            ? await signIn(email, password) 
            : await signUp(email, password);

        if (authError) {
            setError(authError.message);
        } else if (!isLogin) {
            setMessage('تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.');
            setIsLogin(true); // Switch to login view after successful signup
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="font-amiri text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
                    مَحيّاي
                </h1>
                <p className="text-xl mt-2 text-white/90">رفيقك الروحي اليومي</p>
            </div>

            <GlassCard className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-center text-white mb-4">
                    {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h2>
                {error && <p className="text-red-300 bg-red-900/50 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
                {message && <p className="text-green-300 bg-green-900/50 p-3 rounded-lg text-center text-sm mb-4">{message}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-1 text-white/90">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="password"className="block text-sm font-semibold mb-1 text-white/90">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-70 flex justify-center items-center gap-3"
                    >
                         {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div>
                        ) : (
                            isLogin ? 'دخول' : 'إنشاء حساب'
                        )}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-yellow-300 hover:text-yellow-200">
                        {isLogin ? 'ليس لديك حساب؟ إنشاء حساب جديد' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                </div>
            </GlassCard>

            <div className="text-xs text-white/60 mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <p className="mb-2">بالتسجيل، أنت توافق على شروط الاستخدام وسياسة الخصوصية.</p>
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
