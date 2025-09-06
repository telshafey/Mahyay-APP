import React, { useState } from 'react';
import { PersonalGoal, GoalType } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import GlassCard from '../../components/GlassCard';
import { getGoalInspiration } from '../../services/geminiService';

const GOAL_ICONS = ['🎯', '📖', '🤲', '❤️', '💰', '🏃‍♂️', '🌱', '⭐', '📿', '🕌'];

const GoalsPage: React.FC = () => {
    const { personalGoals, addPersonalGoal, goalProgress, updateTargetGoalProgress, toggleDailyGoalCompletion, dailyData, deletePersonalGoal, toggleGoalArchivedStatus } = useAppContext();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [goal, setGoal] = useState({ title: '', icon: GOAL_ICONS[0], type: 'daily' as GoalType, target: 1, unit: '', endDate: '' });
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    
    const [inspiration, setInspiration] = useState<{title: string; icon: string} | null>(null);
    const [isInspiring, setIsInspiring] = useState(false);
    const [inspirationError, setInspirationError] = useState<string | null>(null);
    const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
    
    const handleInspireMe = async () => {
        setIsInspiring(true);
        setInspiration(null);
        setInspirationError(null);
        const response = await getGoalInspiration();
        if (response.data) {
            setInspiration(response.data);
        } else {
            const userFriendlyError = response.error || "عذراً، لم نتمكن من جلب إلهام في الوقت الحالي. حاول مرة أخرى.";
            setInspirationError(userFriendlyError);
            console.error("Goal Inspiration Error:", response.error);
        }
        setIsInspiring(false);
    }

    const useInspiration = () => {
        if (!inspiration) return;
        setGoal(prev => ({
            ...prev,
            title: inspiration.title,
            icon: GOAL_ICONS.includes(inspiration.icon) ? inspiration.icon : prev.icon
        }));
        setInspiration(null);
        setIsFormVisible(true);
    }

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.title.trim()) {
            alert('الرجاء إدخال عنوان الهدف.');
            return;
        }
        const newGoal: Omit<PersonalGoal, 'id'|'createdAt'|'isArchived'|'completedAt'> = {
            title: goal.title,
            icon: goal.icon,
            type: goal.type,
            target: goal.type === 'daily' ? 1 : Number(goal.target),
            unit: goal.unit || undefined,
            endDate: goal.endDate || undefined,
        };
        const success = await addPersonalGoal(newGoal);
        if(success) {
            setGoal({ title: '', icon: GOAL_ICONS[0], type: 'daily', target: 1, unit: '', endDate: '' });
            setIsFormVisible(false);
        }
    };
    
    const handleDeleteGoal = async (goalId: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الهدف نهائيًا؟')) return;
        setIsUpdatingId(goalId);
        await deletePersonalGoal(goalId);
        setIsUpdatingId(null);
    }
    
    const handleToggleArchive = async (goalId: string) => {
        setIsUpdatingId(goalId);
        await toggleGoalArchivedStatus(goalId);
        setIsUpdatingId(null);
    }

    const activeGoals = personalGoals.filter(g => !g.isArchived);
    const completedGoals = personalGoals.filter(g => g.isArchived);
    const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

    return (
        <div className="space-y-6 text-white">
            <GlassCard className="!bg-gradient-to-tr !from-purple-500/20 !to-indigo-500/30 !border-purple-400/30">
                <div className="text-center space-y-3">
                    <h3 className="font-amiri text-xl text-white">هل تبحث عن هدف جديد؟</h3>
                    <p className="text-sm text-white/90">دع الذكاء الاصطناعي يقترح عليك هدفاً إيمانياً بسيطاً وملهمًا لتبدأ به.</p>
                    <button onClick={handleInspireMe} disabled={isInspiring} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait">
                        {isInspiring ? 'لحظات من فضلك...' : '💡 ألهمني بهدف'}
                    </button>
                    {inspiration && (
                        <div className="mt-4 p-4 bg-black/30 rounded-lg animate-fade-in text-center space-y-3">
                            <p className="text-2xl">{inspiration.icon}</p>
                            <p className="font-semibold text-lg text-white">"{inspiration.title}"</p>
                            <button onClick={useInspiration} className="bg-yellow-500 hover:bg-yellow-600 text-green-900 text-sm font-bold py-2 px-4 rounded-full transition-colors">
                                استخدام هذا الهدف
                            </button>
                        </div>
                    )}
                    {inspirationError && (
                        <div className="mt-4 p-3 bg-red-900/50 rounded-lg text-red-300 text-sm animate-fade-in">
                            {inspirationError}
                        </div>
                    )}
                </div>
            </GlassCard>

            {!isFormVisible && (
                <button onClick={() => setIsFormVisible(true)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-green-900 font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                    + إضافة هدف جديد
                </button>
            )}

            {isFormVisible && (
                <GlassCard className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4 text-center">هدف جديد</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">عنوان الهدف</label>
                            <input type="text" value={goal.title} onChange={e => setGoal({...goal, title: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" placeholder="مثال: الاستغفار 100 مرة" />
                        </div>
                        <div>
                             <label className="block text-sm font-semibold mb-1">اختر أيقونة</label>
                             <div className="flex flex-wrap gap-2 bg-black/20 p-2 rounded-lg">
                                {GOAL_ICONS.map(icon => (
                                    <button type="button" key={icon} onClick={() => setGoal({...goal, icon})} className={`w-10 h-10 text-2xl rounded-lg transition-all ${goal.icon === icon ? 'bg-yellow-400/50 ring-2 ring-yellow-300' : 'bg-white/10'}`}>{icon}</button>
                                ))}
                             </div>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold mb-1">نوع الهدف</label>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setGoal({...goal, type: 'daily'})} className={`flex-1 py-2 rounded-lg ${goal.type === 'daily' ? 'bg-teal-500' : 'bg-black/30'}`}>تكرار يومي</button>
                                <button type="button" onClick={() => setGoal({...goal, type: 'target'})} className={`flex-1 py-2 rounded-lg ${goal.type === 'target' ? 'bg-teal-500' : 'bg-black/30'}`}>كمية مستهدفة</button>
                            </div>
                        </div>
                        {goal.type === 'target' && (
                             <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                 <div>
                                    <label className="block text-sm font-semibold mb-1">الكمية</label>
                                    <input type="number" value={goal.target} min="1" onChange={e => setGoal({...goal, target: Number(e.target.value)})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1">الوحدة</label>
                                    <input type="text" value={goal.unit} onChange={e => setGoal({...goal, unit: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" placeholder="صفحة، مرة، جزء..."/>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-semibold mb-1">تاريخ الانتهاء (اختياري)</label>
                            <input type="date" value={goal.endDate} onChange={e => setGoal({...goal, endDate: e.target.value})} className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 font-bold py-3 rounded-lg">حفظ الهدف</button>
                            <button type="button" onClick={() => setIsFormVisible(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg">إلغاء</button>
                        </div>
                    </form>
                </GlassCard>
            )}

            <GlassCard className="!p-2">
                <div className="flex justify-around items-center">
                    <button onClick={() => setActiveTab('active')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'active' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                        أهداف نشطة ({activeGoals.length})
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${activeTab === 'completed' ? 'bg-yellow-400/80 text-green-900' : 'text-white/80 hover:bg-white/10'}`}>
                        أهداف مكتملة ({completedGoals.length})
                    </button>
                </div>
            </GlassCard>

            {displayedGoals.length > 0 ? (
                <div className="space-y-4">
                    {displayedGoals.map(g => {
                        const isCompletedToday = g.type === 'daily' && dailyData.dailyGoalProgress[g.id];
                        const currentProgress = g.type === 'target' ? (goalProgress[g.id] || 0) : 0;
                        const progressPercentage = g.type === 'target' ? (currentProgress / g.target) * 100 : (isCompletedToday ? 100 : 0);
                        const daysRemaining = g.endDate ? Math.ceil((new Date(g.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                        const isUpdatingThisGoal = isUpdatingId === g.id;

                        return (
                            <GlassCard key={g.id}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl p-3 rounded-xl bg-black/20">{g.icon}</div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg">{g.title}</h4>
                                        <div className="text-xs text-white/80 space-x-2 space-x-reverse">
                                            <span>{g.type === 'daily' ? 'هدف يومي' : `الهدف: ${g.target} ${g.unit || ''}`}</span>
                                            {daysRemaining !== null && daysRemaining >= 0 && !g.isArchived && <span className="text-yellow-300">| متبقي {daysRemaining} أيام</span>}
                                            {daysRemaining !== null && daysRemaining < 0 && !g.isArchived && <span className="text-red-400">| انتهى الوقت</span>}
                                            {g.completedAt && <span className="text-green-300">| أُنجز في: {new Date(g.completedAt).toLocaleDateString('ar-SA')}</span>}
                                        </div>
                                        {!g.isArchived && (
                                            <div className="w-full bg-black/20 rounded-full h-2.5 mt-2">
                                                <div className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full transition-all" style={{width: `${progressPercentage}%`}}></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={`mt-4 pt-4 border-t border-white/10 space-y-3 transition-opacity ${isUpdatingThisGoal ? 'opacity-50' : ''}`}>
                                    {g.isArchived ? (
                                        <div className="flex gap-4">
                                            <button onClick={() => handleToggleArchive(g.id)} disabled={isUpdatingThisGoal} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-lg text-sm disabled:cursor-not-allowed disabled:bg-gray-600">{isUpdatingThisGoal ? 'جاري الحفظ...' : '🔄 إعادة تفعيل'}</button>
                                            <button onClick={() => handleDeleteGoal(g.id)} disabled={isUpdatingThisGoal} className="flex-1 bg-red-800/80 hover:bg-red-800 text-white font-bold py-2 rounded-lg text-sm disabled:cursor-not-allowed disabled:bg-gray-600">{isUpdatingThisGoal ? 'جاري الحفظ...' : '🗑️ حذف نهائي'}</button>
                                        </div>
                                    ) : (
                                        <>
                                            {g.type === 'daily' ? (
                                                <button onClick={() => toggleDailyGoalCompletion(g.id)} disabled={isUpdatingThisGoal} className={`w-full py-3 rounded-lg font-semibold transition-colors ${isCompletedToday ? 'bg-teal-500' : 'bg-black/30'}`}>
                                                    {isCompletedToday ? '✅ تم إنجاز اليوم' : 'إنجاز اليوم'}
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-4">
                                                    <button onClick={() => updateTargetGoalProgress(g.id, currentProgress - 1)} disabled={isUpdatingThisGoal} className="w-10 h-10 rounded-full bg-white/10 text-xl hover:bg-white/20 disabled:opacity-50">-</button>
                                                    <span className="text-xl font-bold w-20 text-center">{currentProgress} / {g.target}</span>
                                                    <button onClick={() => updateTargetGoalProgress(g.id, currentProgress + 1)} disabled={isUpdatingThisGoal} className="w-10 h-10 rounded-full bg-white/10 text-xl hover:bg-white/20 disabled:opacity-50">+</button>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => handleToggleArchive(g.id)} disabled={isUpdatingThisGoal || (g.type === 'target' && currentProgress < g.target)} className="flex-grow bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg text-sm disabled:bg-gray-500/50 disabled:cursor-not-allowed">
                                                    {isUpdatingThisGoal ? 'جاري الحفظ...' : (g.type === 'target' && currentProgress < g.target ? 'أكمل الهدف أولاً' : '✅ إكمال ونقل للأرشيف')}
                                                </button>
                                                 <button onClick={() => handleDeleteGoal(g.id)} disabled={isUpdatingThisGoal} className="w-12 h-full bg-red-800/60 hover:bg-red-800/90 text-white font-bold py-2 rounded-lg text-lg disabled:cursor-not-allowed disabled:bg-gray-600">
                                                    {isUpdatingThisGoal ? '...' : '🗑️'}
                                                 </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </GlassCard>
                        )
                    })}
                </div>
            ) : (
                <GlassCard className="text-center text-white/80 py-8">
                    {activeTab === 'active' ? 'لا توجد أهداف نشطة. ابدأ بإضافة هدف جديد!' : 'لا توجد أهداف مكتملة بعد.'}
                </GlassCard>
            )}
        </div>
    );
};

export default GoalsPage;