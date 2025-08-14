
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext.ts';

const AddFriendModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const context = useContext(AppContext);
    if (!context) return null;
    const { discoverableUsers, addFriend } = context;

    return (
         <div className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl overflow-hidden bg-gradient-to-br from-[#1e4d3b] to-[#2d5a47] border border-white/20" onClick={e => e.stopPropagation()}>
                <h3 className="p-4 text-white text-xl text-center font-bold border-b border-white/10">اكتشاف أصدقاء</h3>
                <div className="overflow-y-auto p-4 space-y-3">
                    {discoverableUsers.length > 0 ? discoverableUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                <span className="text-white font-semibold">{user.name}</span>
                            </div>
                            <button onClick={() => addFriend(user.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm">إضافة</button>
                        </div>
                    )) : (
                        <p className="text-center text-white/70 py-4">لا يوجد أصدقاء جدد لاكتشافهم حالياً.</p>
                    )}
                </div>
                <div className="p-4 border-t border-white/10 flex justify-center">
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full transition-colors">إغلاق</button>
                </div>
            </div>
         </div>
    );
};

export default AddFriendModal;
