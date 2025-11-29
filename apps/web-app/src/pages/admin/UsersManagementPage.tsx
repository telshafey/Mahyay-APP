import React, { useState } from 'react';
import GlassCard from '../../components/GlassCard';
import { useAuthContext, UserProfile } from '@mahyay/core';
import UserDetailsModal from '../../components/admin/UserDetailsModal';

const UsersManagementPage: React.FC = () => {
    const { profile, toggleRole } = useAuthContext();
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    
    // Mock data for display purposes
    const MOCK_USERS: UserProfile[] = [
        // Ensure the current user from context is in the list with their actual data
        { id: 'user_1', name: 'المطور', email: 'dev@mahyay.app', picture: 'https://i.pravatar.cc/150?u=dev@mahyay.app', role: 'admin' },
        { id: 'user_2', name: 'علي محمد', email: 'ali.m@example.com', picture: 'https://i.pravatar.cc/150?u=user_2', role: 'user' },
        { id: 'user_3', name: 'فاطمة أحمد', email: 'fatima.a@example.com', picture: 'https://i.pravatar.cc/150?u=user_3', role: 'user' },
        { id: 'user_4', name: 'خالد عبدالله', email: 'khaled.ab@example.com', picture: 'https://i.pravatar.cc/150?u=user_4', role: 'admin' },
    ];

    const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);

    const handleToggleRole = (userId: string) => {
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId
                    ? { ...user, role: user.role === 'admin' ? 'user' : 'admin' }
                    : user
            )
        );
        // In a real app, you would call a function to update the role in the database.
        // For example: `updateUserRole(userId, newRole);`
        if (profile && userId === profile.id) {
            toggleRole(); // This toggles the current user's role
        }
    };
    
    const handleViewDetails = (user: UserProfile) => {
        setSelectedUser(user);
        setIsDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-amiri">👥 إدارة المستخدمين</h2>
            
            <GlassCard>
                <div className="overflow-x-auto">
                    <table className="w-full text-right text-white">
                        <thead className="border-b border-white/20">
                            <tr>
                                <th className="p-4">المستخدم</th>
                                <th className="p-4">البريد الإلكتروني</th>
                                <th className="p-4">الصلاحية</th>
                                <th className="p-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                                    <td className="p-4 font-semibold">
                                        <button onClick={() => handleViewDetails(user)} className="flex items-center gap-3 text-left hover:text-yellow-300 transition-colors">
                                            <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                            <span>{user.name}</span>
                                        </button>
                                    </td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${user.role === 'admin' ? 'bg-yellow-500 text-green-900' : 'bg-gray-500 text-white'}`}>
                                            {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleToggleRole(user.id)}
                                            className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                                        >
                                            {user.role === 'admin' ? 'تغيير إلى مستخدم' : 'ترقية إلى مدير'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
            
            {isDetailsModalOpen && selectedUser && (
                <UserDetailsModal 
                    user={selectedUser}
                    onClose={() => setIsDetailsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default UsersManagementPage;
