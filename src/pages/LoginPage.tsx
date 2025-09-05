import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import GlassCard from '../components/GlassCard';

const LoginPage: React.FC = () => {
    const [name, setName] = useState('');
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // If user is already logged in (e.g., re-visiting /login URL), redirect to home
        if (authContext?.profile) {
            navigate('/', { replace: true });
        }
    }, [authContext?.profile, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && authContext) {
            authContext.updateUserProfile(name.trim());
            // The navigation to '/' will be handled automatically by the router state change
        } else {
            alert("الرجاء إدخال اسمك للمتابعة.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-[#1e4d3b] to-[#2d5a47] text-white">
            <div className="text-center mb-8 animate-fade-in">
                <h1 className="font-amiri text-6xl font-bold bg-gradient-to-r from-white to-[#d4af37] bg-clip-text text-transparent">
                    مَحيّاي
                </h1>
                <p className="text-xl mt-2 text-white/90">رفيقك الروحي اليومي</p>
            </div>

            <GlassCard className="w-full max-w-sm animate-fade-in" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-center text-white mb-6">مرحباً بك</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold mb-2 text-white/90 text-center">
                            كيف نُناديك؟
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="اكتب اسمك هنا"
                            className="w-full text-center text-lg bg-black/30 rounded-lg py-3 px-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-white/60"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50"
                        disabled={!name.trim()}
                    >
                        دخول
                    </button>
                </form>
            </GlassCard>
            <p className="text-xs text-white/60 mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
                بياناتك تُحفظ على جهازك بأمان وخصوصية تامة.
            </p>
        </div>
    );
};

export default LoginPage;
