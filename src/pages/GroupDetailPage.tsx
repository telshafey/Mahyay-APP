import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';
import GlassCard from '../components/GlassCard.tsx';
import SharingSettingsModal from '../components/modals/SharingSettingsModal.tsx';
import { timeAgo } from '../utils.ts';
import { GroupActivity, UserChallenge, UserStats } from '../types.ts';


interface MemberProgressData {
    stats: UserStats | null;
    challenges: UserChallenge[] | null;
}

const GroupDetailPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const context = useContext(AppContext);
    const auth = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'feed' | 'members' | 'progress'>('feed');
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    const [feed, setFeed] = useState<GroupActivity[]>([]);
    const [isFeedLoading, setFeedLoading] = useState(true);
    const [memberProgress, setMemberProgress] = useState<Record<string, MemberProgressData>>({});
    const [isProgressLoading, setProgressLoading] = useState(false);

    const group = useMemo(() => context?.groups.find(g => g.id === groupId), [context?.groups, groupId]);
    
    useEffect(() => {
        let isMounted = true;
        if (group && context && activeTab === 'feed') {
            setFeedLoading(true);
            context.getGroupFeed(group).then(data => {
                if (isMounted) {
                    setFeed(data);
                    setFeedLoading(false);
                }
            });
        }
        return () => { isMounted = false; };
    }, [group, context, activeTab]);

    useEffect(() => {
        let isMounted = true;
        const fetchProgressData = async () => {
            if (activeTab === 'progress' && group && context && groupId) {
                setProgressLoading(true);
                const progressDataPromises = group.members.map(async (member) => {
                    const [stats, challenges] = await Promise.all([
                        context.getGroupMemberStats(member.id, groupId),
                        context.getGroupMemberChallenges(member.id, groupId)
                    ]);
                    return { userId: member.id, stats, challenges };
                });
                
                const progressData = await Promise.all(progressDataPromises);
                
                if (isMounted) {
                    const progressMap = progressData.reduce((acc, data) => {
                        acc[data.userId] = { stats: data.stats, challenges: data.challenges };
                        return acc;
                    }, {} as Record<string, MemberProgressData>);

                    setMemberProgress(progressMap);
                    setProgressLoading(false);
                }
            }
        };
        fetchProgressData();
        return () => { isMounted = false; };
    }, [activeTab, group, context, groupId]);

    if (!context || !auth?.user || !group) {
        return <div className="text-center text-white p-8">جاري تحميل المجموعة...</div>;
    }
    
    const renderContent = () => {
        switch (activeTab) {
            case 'feed':
                if (isFeedLoading) return <p className="text-center text-white/70 py-4">جاري تحميل الأنشطة...</p>;
                if (feed.length === 0) {
                    return <p className="text-center text-white/70 py-4">لا يوجد نشاط لعرضه بعد.</p>;
                }
                return (
                    <div className="space-y-4">
                        {feed.map(activity => (
                             <div key={activity.id} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
                                <div className="bg-white/10 p-2 rounded-full text-xl">{activity.icon}</div>
                                <div className="flex-1">
                                    <p className="text-white text-sm" dangerouslySetInnerHTML={{ __html: activity.message.replace(activity.user.name ?? '', `<strong>${activity.user.name}</strong>`) }}></p>
                                    <p className="text-xs text-white/60">{timeAgo(activity.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'members':
                return (
                    <div className="space-y-3">
                        {group.members.map(member => (
                            <div key={member.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg">
                                <img src={member.picture || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name || 'User'} className="w-10 h-10 rounded-full" />
                                <span className="text-white font-semibold">{member.name || 'مستخدم'}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'progress':
                if (isProgressLoading) return <p className="text-center text-white/70 py-4">جاري تحميل تقدم الأعضاء...</p>;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">📊 الإحصائيات</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right text-white">
                                    <thead className="text-xs text-yellow-300 uppercase bg-black/20">
                                        <tr>
                                            <th scope="col" className="px-4 py-2">العضو</th>
                                            <th scope="col" className="px-2 py-2">النقاط</th>
                                            <th scope="col" className="px-2 py-2">الأيام</th>
                                            <th scope="col" className="px-2 py-2">الصلوات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.members.map(m => {
                                            const progress = memberProgress[m.id];
                                            const canShow = progress && progress.stats !== null;
                                            return (
                                                <tr key={m.id} className="bg-black/10 border-b border-gray-700">
                                                    <th scope="row" className="px-4 py-2 font-medium whitespace-nowrap">{m.name || 'مستخدم'}</th>
                                                    <td className="px-2 py-2">{canShow ? progress.stats?.totalPoints : '🔒'}</td>
                                                    <td className="px-2 py-2">{canShow ? progress.stats?.streak : '🔒'}</td>
                                                    <td className="px-2 py-2">{canShow ? progress.stats?.monthlyPrayers : '🔒'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-white mb-2">🏆 التحديات</h4>
                             {group.members.map(m => {
                                const progress = memberProgress[m.id];
                                const challenges = progress?.challenges;
                                const canShow = challenges !== null;
                                return (
                                    <div key={m.id} className="p-3 bg-black/20 rounded-lg mb-3">
                                        <p className="font-semibold text-white mb-2">{m.name || 'مستخدم'}</p>
                                        {canShow && challenges ? (
                                            challenges.length > 0 ? (
                                                <div className="space-y-2">
                                                    {challenges.map(c => (
                                                        <div key={c.id}>
                                                            <p className="text-xs text-white/80">{c.icon} {c.title}</p>
                                                            <div className="w-full bg-gray-600 rounded-full h-1.5"><div className="bg-yellow-400 h-1.5 rounded-full" style={{width: `${(c.progress/c.total)*100}%`}}></div></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : <p className="text-center text-sm text-white/60">لا توجد تحديات نشطة.</p>
                                        ) : <p className="text-center text-sm text-white/60">🔒 إحصائيات التحديات خاصة</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Link to="/community" className="text-white text-sm py-2 px-4 rounded-full bg-white/10 hover:bg-white/20">
                    → العودة للمجتمع
                </Link>
                <button onClick={() => setSettingsOpen(true)} className="text-white text-sm py-2 px-4 rounded-full bg-white/10 hover:bg-white/20">
                    ⚙️ إعدادات المشاركة
                </button>
            </div>
            
            <GlassCard>
                <div className="text-center text-white mb-6">
                    <h2 className="text-3xl font-bold font-amiri">{group.type === 'family' ? '👨‍👩‍👧‍👦' : '🤝'} {group.name}</h2>
                    <p className="opacity-80">{group.members.length} أعضاء</p>
                </div>
                <div className="flex justify-center border-b border-white/10 mb-4">
                    <button onClick={() => setActiveTab('feed')} className={`px-4 py-2 font-semibold ${activeTab === 'feed' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70'}`}>الأنشطة</button>
                    <button onClick={() => setActiveTab('members')} className={`px-4 py-2 font-semibold ${activeTab === 'members' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70'}`}>الأعضاء</button>
                    <button onClick={() => setActiveTab('progress')} className={`px-4 py-2 font-semibold ${activeTab === 'progress' ? 'text-yellow-300 border-b-2 border-yellow-300' : 'text-white/70'}`}>التقدم</button>
                </div>
                <div>{renderContent()}</div>
            </GlassCard>

            {isSettingsOpen && <SharingSettingsModal group={group} onClose={() => setSettingsOpen(false)} />}
        </div>
    );
};

export default GroupDetailPage;