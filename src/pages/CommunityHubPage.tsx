import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.ts';
import GlassCard from '../components/GlassCard.tsx';
import AddFriendModal from '../components/modals/AddFriendModal.tsx';
import CreateGroupModal from '../components/modals/CreateGroupModal.tsx';

const CommunityHubPage: React.FC = () => {
    const context = useContext(AppContext);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isAddFriendModalOpen, setAddFriendModalOpen] = useState(false);

    if (context?.isCommunityLoading) {
      return <div className="text-center text-white p-8">جاري تحميل المجتمع...</div>;
    }

    if (!context) return <div className="text-center text-white p-8">حدث خطأ أثناء تحميل بيانات المجتمع.</div>;

    const { groups, invitations, respondToInvitation, friends, friendRequests, respondToFriendRequest } = context;

    const ActionableCard: React.FC<{title: string, children: React.ReactNode, count: number}> = ({title, children, count}) => {
        if(count === 0) return null;
        return (
             <GlassCard className="!bg-yellow-400/20 !border-yellow-300/30 animate-fade-in">
                <h3 className="text-xl font-semibold text-white mb-3">{title} ({count})</h3>
                <div className="space-y-3">
                    {children}
                </div>
            </GlassCard>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center font-amiri">🤝 مجتمع مَحيّاي</h2>

            <ActionableCard title="طلبات الصداقة" count={friendRequests.length}>
                {friendRequests.map(req => (
                    <div key={req.id} className="p-3 bg-black/20 rounded-lg text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                             <img src={req.picture || `https://i.pravatar.cc/150?u=${req.id}`} alt={req.name} className="w-10 h-10 rounded-full" />
                            <p><span className="font-bold">{req.name}</span> يريد إضافتك كصديق.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => respondToFriendRequest(req.id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm">قبول</button>
                            <button onClick={() => respondToFriendRequest(req.id, 'declined')} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-1 rounded-full text-sm">رفض</button>
                        </div>
                    </div>
                ))}
            </ActionableCard>
            
            <ActionableCard title="دعوات المجموعات" count={invitations.length}>
                {invitations.map(inv => (
                    <div key={inv.id} className="p-3 bg-black/20 rounded-lg text-white">
                        <p className="mb-2">
                            <span className="font-bold">{inv.inviter_name}</span> دعاك للانضمام إلى مجموعة <span className="font-bold">"{inv.group_name}"</span>.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => respondToInvitation(inv.id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm">قبول</button>
                            <button onClick={() => respondToInvitation(inv.id, 'declined')} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-1 rounded-full text-sm">رفض</button>
                        </div>
                    </div>
                ))}
            </ActionableCard>

            <GlassCard>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">مجموعاتي</h3>
                    <button onClick={() => setCreateModalOpen(true)} className="bg-yellow-400/80 hover:bg-yellow-400 text-green-900 font-bold py-1 px-4 rounded-full transition-colors text-sm">
                        + إنشاء مجموعة
                    </button>
                </div>
                {groups.length > 0 ? (
                    <div className="space-y-3">
                        {groups.map(group => (
                            <Link to={`/community/group/${group.id}`} key={group.id} className="block p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors">
                                <div className="flex items-center justify-between text-white">
                                    <div>
                                        <h4 className="text-lg font-bold">{group.type === 'family' ? '👨‍👩‍👧‍👦' : '🤝'} {group.name}</h4>
                                        <p className="text-xs opacity-70">{group.members.length} أعضاء</p>
                                    </div>
                                    <div className="flex -space-x-4">
                                        {group.members.slice(0, 4).map(m => <img key={m.id} src={m.picture || `https://i.pravatar.cc/150?u=${m.id}`} alt={m.name} className="w-8 h-8 rounded-full border-2 border-gray-600" />)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/70 py-4">لم تنضم إلى أي مجموعات بعد. قم بإنشاء مجموعة جديدة!</p>
                )}
            </GlassCard>

             <GlassCard>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-white">أصدقائي ({friends.length})</h3>
                    <button onClick={() => setAddFriendModalOpen(true)} className="bg-blue-500/80 hover:bg-blue-500 text-white font-bold py-1 px-4 rounded-full transition-colors text-sm">
                        + اكتشاف أصدقاء
                    </button>
                </div>
                {friends.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {friends.map(friend => (
                             <div key={friend.id} className="flex flex-col items-center gap-1">
                                <img src={friend.picture || `https://i.pravatar.cc/150?u=${friend.id}`} alt={friend.name} className="w-12 h-12 rounded-full border-2 border-white/30" />
                                <span className="text-xs text-white/80">{friend.name.split(' ')[0]}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-white/70 py-4">لم تقم بإضافة أصدقاء بعد.</p>
                )}
            </GlassCard>

            {isCreateModalOpen && <CreateGroupModal onClose={() => setCreateModalOpen(false)} />}
            {isAddFriendModalOpen && <AddFriendModal onClose={() => setAddFriendModalOpen(false)} />}
        </div>
    );
};

export default CommunityHubPage;