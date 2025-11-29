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

        try {
            const { error: authError } = isLogin 
                ? await signIn(email, password) 
                : await signUp(email, password);

            if (authError) {
                // Translate common Supabase errors
                if (authError.message.includes("Invalid login")) {
                    setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
                } else if (authError.message.includes("Email not confirmed")) {
                    setError("الرجاء تأكيد البريد الإلكتروني أولاً.");
                } else if (authError.message.includes("already registered")) {
                    setError("هذا البريد الإلكتروني مسجل بالفعل.");
                } else if (authError.message.includes("Password should be")) {
                    setError("كلمة المرور ضعيفة. يجب أن تكون 6 أحرف على الأقل.");
                } else {
                    setError(authError.message);
                }
            } else if (!isLogin) {
                setMessage('تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب.');
                setEmail('');
                setPassword('');
            }
        } catch (err) {
            setError("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="font-amiri text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent drop-shadow-md">
                    مَحيّاي
                </h1>
                <p className="text-xl mt-2 text-white/90">رفيقك الروحي اليومي</p>
            </div>

            <GlassCard className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-center text-white mb-6 border-b border-white/10 pb-4">
                    {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </h2>
                
                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg text-center text-sm mb-4 text-red-200 animate-pulse">
                        ⚠️ {error}
                    </div>
                )}
                
                {message && (
                    <div className="bg-green-500/20 border border-green-500/50 p-3 rounded-lg text-center text-sm mb-4 text-green-200">
                        ✅ {message}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white/90">البريد الإلكتروني</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="password"className="block text-sm font-semibold mb-2 text-white/90">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-green-900 font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-wait flex justify-center items-center shadow-lg mt-6"
                    >
                         {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div>
                        ) : (
                            isLogin ? 'دخول' : 'إنشاء حساب'
                        )}
                    </button>
                </form>

                <div className="text-center mt-6 pt-4 border-t border-white/10">
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
                        className="text-sm text-yellow-300 hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                    >
                        {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً الآن' : 'لديك حساب بالفعل؟ تسجيل الدخول'}
                    </button>
                </div>
            </GlassCard>

            <div className="text-xs text-white/50 mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <p className="mb-2">باستخدام التطبيق، أنت توافق على:</p>
                <div className="flex justify-center items-center gap-4">
                     <Link to="/more/terms" className="hover:text-yellow-300 transition-colors">شروط الاستخدام</Link>
                     <span>•</span>
                     <Link to="/more/privacy" className="hover:text-yellow-300 transition-colors">سياسة الخصوصية</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
