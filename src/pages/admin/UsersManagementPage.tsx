import React from 'react';
import GlassCard from '../../components/GlassCard';
import { useAuthContext } from '../../contexts/AuthContext';

const UsersManagementPage: React.FC = () => {
    const { profile } = useAuthContext();
    
    // Mock data for display purposes
    const users = [
        { id: profile?.id, name: profile?.name, email: profile?.email, role: profile?.role }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">👥 إدارة المستخدمين</h2>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">الاسم</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">الصلاحية</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user?.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">{user?.name}</td>
                                    <td className="p-4">{user?.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${user?.role === 'admin' ? 'bg-yellow-500 text-green-900' : 'bg-gray-500'}`}>
                                            {user?.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button className="text-yellow-400 hover:text-yellow-300">تعديل الصلاحية</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default UsersManagementPage;
