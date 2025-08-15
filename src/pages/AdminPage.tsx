import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { UserProfile } from '../types.ts';
import GlassCard from '../components/GlassCard.tsx';
import { supabase } from '../supabase.ts';

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
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            if (authContext?.isAdmin) {
                setIsLoading(true);
                const { data, error } = await supabase.from('profiles').select('*');
                if (error) {
                    console.error("Error fetching users for admin:", error);
                    alert("Failed to fetch users.");
                } else {
                    setAllUsers((data as unknown as UserProfile[]) || []);
                }
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [authContext?.isAdmin]);

    if (!authContext?.isAdmin) {
        return <p className="text-center text-red-400">غير مصرح لك بالدخول.</p>;
    }

    const totalUsers = allUsers.length;
    const emailUsers = allUsers.filter(u => u.email && u.email.includes('@')).length;
    const googleUsers = totalUsers - emailUsers;

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-3xl font-bold text-center font-amiri">👑 لوحة تحكم الأدمن</h2>
            
            <section>
                <h3 className="text-xl font-semibold mb-3">📊 نظرة عامة على النظام</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="إجمالي المستخدمين" value={totalUsers} icon="👥" />
                    <StatCard title="حسابات البريد الإلكتروني" value={emailUsers} icon="📧" />
                    <StatCard title="حسابات جوجل" value={googleUsers} icon="🇬" />
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
                                    <th scope="col" className="px-6 py-3 text-left">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan={4} className="text-center p-4">جاري تحميل المستخدمين...</td></tr>
                                ) : allUsers.map(user => (
                                    <tr key={user.id} className={`border-b border-white/10`}>
                                        <td className="px-6 py-2">
                                            <img src={user.picture || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name || 'User Avatar'} className="w-10 h-10 rounded-full" />
                                        </td>
                                        <th scope="row" className="px-6 py-2 font-medium whitespace-nowrap">{user.name || 'لا يوجد اسم'}</th>
                                        <td className="px-6 py-2">{user.email || 'غير متوفر'}</td>
                                        <td className="px-6 py-2 text-left">
                                            <div className="flex gap-4">
                                                <button disabled className="font-semibold text-yellow-400/50 cursor-not-allowed">تعديل</button>
                                                <button disabled className="font-semibold text-red-400/50 cursor-not-allowed">حذف</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
                <p className="text-xs text-center text-yellow-300/80 mt-2">ميزات التعديل والحذف تتطلب وظائف سحابية آمنة (Supabase Edge Functions) وهي قيد التطوير.</p>
            </section>
             <section>
                <h3 className="text-xl font-semibold mb-3">💾 عرض البيانات الخام</h3>
                <GlassCard>
                    <p className="text-xs text-white/70 mb-2">بيانات المستخدمين من جدول `profiles`:</p>
                    <pre className="text-xs bg-black/30 p-4 rounded-lg overflow-auto max-h-64">
                        {isLoading ? "جاري التحميل..." : JSON.stringify(allUsers, null, 2)}
                    </pre>
                </GlassCard>
            </section>
        </div>
    );
};

export default AdminPage;
