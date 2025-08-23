import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';

const LoginPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [formMode, setFormMode] = useState<'login' | 'signup' | 'reset_password'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    const clearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMessage('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setFormLoading(true);
        try {
            if (formMode === 'signup') {
                await authContext?.signUpWithEmail(name, email, password);
                setSuccessMessage("تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتفعيل حسابك قبل تسجيل الدخول.");
                setFormMode('login');
                setName('');
                setPassword('');
            } else { // login
                await authContext?.signInWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ ما.');
        } finally {
            setFormLoading(false);
        }
    };
    
    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setFormLoading(true);
        try {
            await authContext?.sendPasswordResetEmail(email);
            setSuccessMessage("تم إرسال رابط إعادة التعيين. يرجى التحقق من بريدك الإلكتروني (بما في ذلك مجلد الرسائل غير المرغوب فيها).");
        } catch(err: any) {
            setError(err.message);
        } finally {
            setFormLoading(false);
        }
    }

    const renderFormContent = () => {
        if(formMode === 'reset_password') {
            return (
                 <>
                    <h2 className="text-2xl font-semibold text-center mb-4">
                        إعادة تعيين كلمة المرور
                    </h2>
                     {error && <p className="text-red-300 bg-red-900/50 p-2 text-center rounded-lg text-sm">{error}</p>}
                     {successMessage && <p className="text-green-300 bg-green-900/50 p-2 text-center rounded-lg text-sm">{successMessage}</p>}
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                         <div>
                            <label className="text-sm text-white/80">البريد الإلكتروني</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                         </div>
                         <button type="submit" disabled={formLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 rounded-lg transition-colors disabled:bg-yellow-500/50">
                             {formLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                         </button>
                    </form>
                    <p className="text-center text-sm">
                        <button onClick={() => { setFormMode('login'); clearForm(); }} className="font-semibold text-yellow-300 hover:text-yellow-400 px-2">
                             العودة لتسجيل الدخول
                         </button>
                    </p>
                 </>
            );
        }

        // Login & Signup
        return (
             <>
                <h2 className="text-2xl font-semibold text-center mb-4">
                    {formMode === 'signup' ? 'إنشاء حساب جديد' : 'مرحباً بعودتك'}
                 </h2>
                 
                 {error && <p className="text-red-300 bg-red-900/50 p-2 text-center rounded-lg text-sm">{error}</p>}
                 {successMessage && <p className="text-green-300 bg-green-900/50 p-2 text-center rounded-lg text-sm">{successMessage}</p>}

                 <form onSubmit={handleSubmit} className="space-y-4">
                     {formMode === 'signup' && (
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
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full mt-1 bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                     </div>
                     {formMode === 'login' && (
                        <div className="text-right">
                             <button type="button" onClick={() => { setFormMode('reset_password'); clearForm(); }} className="text-xs font-semibold text-yellow-300 hover:text-yellow-400">
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                     )}
                     <button type="submit" disabled={formLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 rounded-lg transition-colors disabled:bg-yellow-500/50">
                         {formLoading ? 'جاري...' : (formMode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول')}
                     </button>
                 </form>
                 
                 <p className="text-center text-sm">
                     {formMode === 'signup' ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
                     <button onClick={() => { setFormMode(formMode === 'signup' ? 'login' : 'signup'); clearForm(); }} className="font-semibold text-yellow-300 hover:text-yellow-400 px-2">
                         {formMode === 'signup' ? 'سجل الدخول' : 'أنشئ حساباً'}
                     </button>
                 </p>
             </>
        )
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
                    {renderFormContent()}

                    {formMode !== 'reset_password' && (
                        <>
                            <div className="flex items-center gap-4 text-white/60">
                                <hr className="flex-grow border-t border-white/30" />
                                <span>أو</span>
                                <hr className="flex-grow border-t border-white/30" />
                            </div>
                            
                            <button
                                onClick={() => authContext?.signInAsGuest()}
                                className="w-full bg-transparent border-2 border-white/30 hover:bg-white/10 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <span>👤</span>
                                <span>الدخول كضيف</span>
                            </button>

                            <button
                                onClick={() => authContext?.signInWithGoogle()}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                                <span>المتابعة باستخدام جوجل</span>
                            </button>
                        </>
                    )}
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