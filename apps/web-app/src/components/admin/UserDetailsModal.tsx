import React, { useMemo } from 'react';
import { UserProfile, AppStats, calculateStats, MOCK_APP_DATA, MOCK_USER_CHALLENGES, CHALLENGES } from '@mahyay/core';
import Modal from '../ui/Modal';
import GlassCard from '../GlassCard';

interface UserDetailsModalProps {
    user: UserProfile;
    onClose: () => void;
}

const StatItem: React.FC<{ label: string; value: string | number; icon: string; }> = ({ label, value, icon }) => (
    <div className="p-3 bg-black/30 rounded-lg text-center">
        <p className="text-2xl font-bold text-white">{icon} {value}</p>
        <p className="text-xs font-semibold text-white/80">{label}</p>
    </div>
);


const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
    
    // NOTE FOR DEVELOPMENT:
    // In a real application, you would fetch the specific user's appData and userChallenges here.
    // For now, we are simulating this by reusing the mock data for every user to demonstrate the modal's functionality.
    const userStats: AppStats = useMemo(() => calculateStats(MOCK_APP_DATA, MOCK_USER_CHALLENGES, CHALLENGES), []);
    
    const activeChallenges = useMemo(() => {
        return MOCK_USER_CHALLENGES
            .filter(uc => uc.status === 'active')
            .map(uc => CHALLENGES.find(c => c.id === uc.challenge_id))
            .filter(Boolean); // Filter out any undefined results
    }, []);

    return (
        <Modal title={`ملف المستخدم: ${user.name}`} onClose={onClose}>
            <div className="space-y-4 text-white">
                <GlassCard className="!p-3 flex items-center gap-4">
                    <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
                    <div>
                        <h4 className="font-bold text-xl">{user.name}</h4>
                        <p className="text-sm text-white/80">{user.email}</p>
                        <span className={`mt-1 inline-block px-3 py-0.5 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-yellow-500 text-green-900' : 'bg-gray-500 text-white'}`}>
                            {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                        </span>
                    </div>
                </GlassCard>
                
                <GlassCard className="!p-3">
                    <h5 className="font-bold mb-2 text-center text-yellow-300">إحصائيات عامة (تجريبية)</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <StatItem label="النقاط" value={userStats.totalPoints} icon="🌟" />
                        <StatItem label="أيام متتالية" value={userStats.streak} icon="🔥" />
                        <StatItem label="صفحات القرآن" value={userStats.quranPages} icon="📖" />
                    </div>
                </GlassCard>
                
                <GlassCard className="!p-3">
                    <h5 className="font-bold mb-2 text-yellow-300">تحديات نشطة</h5>
                    {activeChallenges.length > 0 ? (
                         <ul className="space-y-2 text-sm">
                            {activeChallenges.map(challenge => (
                                <li key={challenge!.id} className="p-2 bg-black/20 rounded-md">
                                    {challenge!.icon} {challenge!.title}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-center text-white/70">لا توجد تحديات نشطة حاليًا.</p>
                    )}
                </GlassCard>

                <div className="text-center pt-2">
                    <button onClick={onClose} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-2 px-6 rounded-lg transition-colors">
                        إغلاق
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UserDetailsModal;