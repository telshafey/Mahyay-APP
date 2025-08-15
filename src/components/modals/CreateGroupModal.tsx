import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext.ts';
import { GroupType } from '../../types.ts';

const CreateGroupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useContext(AppContext);
    const [groupName, setGroupName] = useState('');
    const [groupType, setGroupType] = useState<GroupType>('friends');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    if (!context) return null;
    const { friends, createGroup } = context;
    const acceptedFriends = friends.filter(f => (f as any).status === 'accepted' || f.hasOwnProperty('status') === false);


    const handleSelectFriend = (friendId: string) => {
        setSelectedFriends(prev => 
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleCreateGroup = () => {
        if (!groupName.trim()) {
            alert("يرجى إدخال اسم للمجموعة.");
            return;
        }
        createGroup(groupName, groupType, selectedFriends);
        onClose();
    };
    
    return (
         <div className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e4d3b] to-[#2d5a47] border border-white/20" onClick={e => e.stopPropagation()}>
                <h3 className="p-4 text-white text-xl text-center font-bold border-b border-white/10">إنشاء مجموعة جديدة</h3>
                <div className="overflow-y-auto p-4 space-y-4">
                    <input type="text" placeholder="اسم المجموعة" value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full bg-black/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <div className="flex gap-4">
                        <button onClick={() => setGroupType('family')} className={`w-full py-2 rounded-lg font-semibold ${groupType === 'family' ? 'bg-yellow-400 text-green-900' : 'bg-white/10 text-white'}`}>👨‍👩‍👧‍👦 عائلة</button>
                        <button onClick={() => setGroupType('friends')} className={`w-full py-2 rounded-lg font-semibold ${groupType === 'friends' ? 'bg-yellow-400 text-green-900' : 'bg-white/10 text-white'}`}>🤝 أصدقاء</button>
                    </div>
                    <div>
                        <h4 className="text-white mb-2">دعوة أصدقاء:</h4>
                         {acceptedFriends.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {acceptedFriends.map(friend => (
                                    <div key={friend.id} onClick={() => handleSelectFriend(friend.id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedFriends.includes(friend.id) ? 'bg-yellow-400/30' : 'bg-black/20'}`}>
                                        <img src={friend.picture || `https://i.pravatar.cc/150?u=${friend.id}`} alt={friend.name} className="w-8 h-8 rounded-full" />
                                        <span className="text-white">{friend.name}</span>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <p className="text-sm text-center text-white/60 py-2">أضف أصدقاء أولاً لتتمكن من دعوتهم.</p>
                         )}
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 flex justify-center gap-4">
                    <button onClick={handleCreateGroup} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors">إنشاء وإرسال الدعوات</button>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-colors">إلغاء</button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;