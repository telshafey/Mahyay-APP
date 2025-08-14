import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { User } from '../types.ts';
import GlassCard from '../components/GlassCard.tsx';

const StatCard: React.FC<{ title: string, value: string | number, icon: string }> = ({ title, value, icon }) => (
    <GlassCard>
        <div className="flex items-center gap-4">
            <span className="text-4xl">{icon}</span>
            <div>
                <p className="text-white/80">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    </GlassCard>
);

const AdminPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [allUsers, setAllUsers] = useState<(User & { email?: string, id: string })[]>([]);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editedUserData, setEditedUserData] = useState<{ name: string; email?: string }>({ name: '' });

    const refreshUsers = () => {
        if (authContext?.isAdmin) {
            setAllUsers(authContext.getAllUsersForAdmin());
        }
    };

    useEffect(() => {
        refreshUsers();
    }, [authContext]);

    if (!authContext?.isAdmin) {
        return <p className="text-center text-red-400">غير مصرح لك بالدخول.</p>;
    }
    
    const handleEdit = (user: User & { id: string, email?: string }) => {
        setEditingUserId(user.id);
        setEditedUserData({ name: user.name, email: user.email });
    };

    const handleCancel = () => {
        setEditingUserId(null);
        setEditedUserData({ name: '' });
    };

    const handleSave = () => {
        if (!editingUserId || !authContext) return;
        authContext.updateUserForAdmin(editingUserId, editedUserData.name, editedUserData.email);
        refreshUsers();
        handleCancel();
    };

    const handleDelete = (userId: string) => {
        if (!authContext) return;
        if (window.confirm(`هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.`)) {
            authContext.deleteUserForAdmin(userId);
            refreshUsers();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditedUserData(prev => ({ ...prev, [name]: value }));
    };

    const totalUsers = allUsers.length;
    const emailUsers = allUsers.filter(u => u.id.startsWith('email_')).length;
    const googleUsers = allUsers.filter(u => !u.id.startsWith('email_') && u.id !== 'guest_user').length;

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-3xl font-bold text-center font-amiri">👑 لوحة تحكم الأدمن</h2>
            
            <section>
                <h3 className="text-xl font-semibold mb-3">📊 نظرة عامة على النظام</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="إجمالي المستخدمين" value={totalUsers} icon="👥" />
                    <StatCard title="حسابات البريد الإلكتروني" value={emailUsers} icon="📧" />
                    <StatCard title="حسابات جوجل" value={googleUsers} icon="🇬" />
                    <StatCard title="حالة النظام" value={authContext.isConfigured ? '✅ متصل' : '⚠️ غير متصل'} icon="⚙️" />
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-3">👤 إدارة المستخدمين</h3>
                <GlassCard className="!p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-yellow-300 uppercase bg-black/20">
                                <tr>
                                    <th scope="col" className="px-6 py-3">الصورة</th>
                                    <th scope="col" className="px-6 py-3">الاسم</th>
                                    <th scope="col" className="px-6 py-3">البريد الإلكتروني</th>
                                    <th scope="col" className="px-6 py-3">نوع الحساب</th>
                                    <th scope="col" className="px-6 py-3 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(user => (
                                    <tr key={user.id} className={`border-b border-white/10 transition-colors ${editingUserId === user.id ? 'bg-yellow-400/10' : 'hover:bg-white/5'}`}>
                                        <td className="px-6 py-2">
                                            <img src={user.picture || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-10 h-10 rounded-full" />
                                        </td>
                                        {editingUserId === user.id ? (
                                            <>
                                                <td className="px-6 py-2">
                                                    <input name="name" value={editedUserData.name} onChange={handleInputChange} className="bg-transparent border-b border-yellow-400/50 w-full p-1 focus:outline-none" />
                                                </td>
                                                <td className="px-6 py-2">
                                                    <input name="email" value={editedUserData.email || ''} onChange={handleInputChange} className="bg-transparent border-b border-yellow-400/50 w-full p-1 focus:outline-none" disabled={!user.id.startsWith('email_')} />
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <th scope="row" className="px-6 py-2 font-medium whitespace-nowrap">{user.name}</th>
                                                <td className="px-6 py-2">{user.email || 'غير متوفر'}</td>
                                            </>
                                        )}
                                        <td className="px-6 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.id.startsWith('email_') ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-200'}`}>
                                                {user.id.startsWith('email_') ? 'بريد إلكتروني' : (user.id === 'guest_user' ? 'زائر' : 'جوجل')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-2 text-left">
                                            {editingUserId === user.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={handleSave} className="font-semibold text-green-400 hover:text-green-300">حفظ</button>
                                                    <button onClick={handleCancel} className="font-semibold text-gray-400 hover:text-gray-200">إلغاء</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleEdit(user)} className="font-semibold text-yellow-400 hover:text-yellow-300">تعديل</button>
                                                    <button 
                                                        onClick={() => handleDelete(user.id)} 
                                                        className="font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={user.id === authContext?.user?.id}
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </section>
             <section>
                <h3 className="text-xl font-semibold mb-3">💾 عرض البيانات الخام</h3>
                <GlassCard>
                    <p className="text-xs text-white/70 mb-2">محتوى `mahyayi_user_database` في LocalStorage:</p>
                    <pre className="text-xs bg-black/30 p-4 rounded-lg overflow-auto max-h-64">
                        {JSON.stringify(allUsers, null, 2)}
                    </pre>
                </GlassCard>
            </section>
        </div>
    );
};

export default AdminPage;