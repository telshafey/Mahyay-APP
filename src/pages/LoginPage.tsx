import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

const LoginPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const { profile, signIn, signUp } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (profile) {
            navigate('/', { replace: true });
        }
    }, [profile, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const action = isSignUp ? signUp : signIn;
        const { error: authError } = await action(email, password);

        if (authError) {
            let userFriendlyError = 'حدث خطأ ما. يرجى المحاولة مرة أخرى.';
            if (authError.message.includes('Invalid login credentials')) {
                userFriendlyError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            } else if (authError.message.includes('Email not confirmed')) {
                userFriendlyError = 'الحساب موجود ولكن لم يتم تفعيله. يرجى التحقق من بريدك الإلكتروني والضغط على رابط التفعيل.';
            } else if (authError.message.includes('User already registered')) {
                userFriendlyError = 'هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.';
            } else if (authError.message.includes('Password should be at least 6 characters')) {
                userFriendlyError = 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.';
            } else {
                // If the error is unknown, show the actual message from the server for better debugging.
                userFriendlyError = authError.message;
            }
            setError(userFriendlyError);
        } else if (isSignUp) {
            alert("تم إنشاء حسابك بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب ثم تسجيل الدخول.");
            setIsSignUp(false); // Switch to login view after successful signup
        }
        // On successful login, the onAuthStateChange listener will handle the redirect.

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
                 <div className="flex justify-center mb-6 border-b-2 border-white/10">
                    <button 
                        onClick={() => { setIsSignUp(false); setError(null); }}
                        className={`py-2 px-6 font-semibold transition-colors w-1/2 ${!isSignUp ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70'}`}
                    >
                        تسجيل الدخول
                    </button>
                    <button 
                        onClick={() => { setIsSignUp(true); setError(null); }}
                        className={`py-2 px-6 font-semibold transition-colors w-1/2 ${isSignUp ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70'}`}
                    >
                        إنشاء حساب
                    </button>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-6">
                    {isSignUp ? 'حساب جديد' : 'مرحباً بعودتك'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && <p className="text-red-300 bg-red-900/50 p-3 rounded-lg text-center text-sm">{error}</p>}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-white/90">
                            البريد الإلكتروني
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@email.com"
                            className="w-full text-lg bg-black/30 rounded-lg py-2 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/60"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-white/90">
                            كلمة المرور
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full text-lg bg-black/30 rounded-lg py-2 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/60"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <label htmlFor="remember-me" className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded accent-yellow-400 bg-black/30 border-white/20 focus:ring-yellow-400"
                            />
                            تذكرني
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 flex justify-center items-center"
                        disabled={loading || !email.trim() || !password.trim()}
                    >
                        {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-900"></div> : (isSignUp ? 'إنشاء حساب' : 'دخول')}
                    </button>
                </form>
            </GlassCard>
            <div className="text-xs text-white/60 mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                <p className="mb-2">بياناتك محمية ومشفّرة بالكامل.</p>
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