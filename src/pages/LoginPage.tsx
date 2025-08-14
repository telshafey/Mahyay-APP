import React, { useEffect, useContext, useRef, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';

const LoginPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (authContext?.isConfigured && googleButtonRef.current) {
            authContext.renderGoogleButton(googleButtonRef.current);
        }
    }, [authContext, authContext?.isConfigured, isSignUp]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFormLoading(true);
        try {
            if (isSignUp) {
                await authContext?.signUpWithEmail(name, email, password);
            } else {
                await authContext?.signInWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ ما.');
        } finally {
            setFormLoading(false);
        }
    };

    const toggleFormMode = () => {
        setIsSignUp(!isSignUp);
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] p-4 text-white">
            <div className="text-center mb-8">
                <h1 className="font-amiri text-6xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent mb-2">
                    مَحيّاي
                </h1>
                <p className="text-lg opacity-80">رفيقك الروحي اليومي</p>
            </div>

            <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 md:p-8">
                <div className="space-y-4">
                     <h2 className="text-2xl font-semibold text-center mb-4">
                        {isSignUp ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}
                     </h2>
                     
                     {error && <p className="text-red-300 bg-red-900/50 p-2 text-center rounded-lg text-sm">{error}</p>}

                     <form onSubmit={handleSubmit} className="space-y-4">
                         {isSignUp && (
                            <div>
                                <label className="text-sm text-white/80">الاسم</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                            </div>
                         )}
                         <div>
                            <label className="text-sm text-white/80">البريد الإلكتروني</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                         </div>
                         <div>
                            <label className="text-sm text-white/80">كلمة المرور</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full mt-1 bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                         </div>
                         <button type="submit" disabled={formLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 rounded-lg transition-colors disabled:bg-yellow-500/50">
                             {formLoading ? 'جاري...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
                         </button>
                     </form>
                     
                     <p className="text-center text-sm">
                         {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
                         <button onClick={toggleFormMode} className="font-semibold text-yellow-300 hover:text-yellow-400 px-2">
                             {isSignUp ? 'سجل الدخول' : 'أنشئ حساباً'}
                         </button>
                     </p>

                     <div className="flex items-center gap-4 text-white/60">
                        <hr className="flex-grow border-t border-white/30" />
                        <span>أو</span>
                        <hr className="flex-grow border-t border-white/30" />
                    </div>

                     {authContext?.isConfigured ? (
                         <>
                            <div ref={googleButtonRef} className="flex justify-center h-[45px] items-center">
                                {/* The Google Sign-In button will be rendered here. */}
                                 <div className="g_id_signin"></div>
                            </div>
                         </>
                     ) : (
                         <div className="text-center text-yellow-300 bg-red-900/50 p-3 rounded-lg border border-yellow-400">
                             <p className="text-sm">
                                تسجيل الدخول بحساب جوجل غير متاح حالياً بسبب خطأ في الإعدادات.
                             </p>
                         </div>
                     )}


                    <button 
                        onClick={() => authContext?.loginAsGuest()}
                        className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors">
                        👤 المتابعة كزائر
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-5 text-center text-xs text-white/50 px-4">
                 <p>
                    "قُلْ إِنَّ صَلَاتِي وَنُسُكِي وَمَحْيَايَ وَمَمَاتِي لِلَّهِ رَبِّ الْعَالَمِينَ"
                 </p>
            </div>
        </div>
    );
};

export default LoginPage;