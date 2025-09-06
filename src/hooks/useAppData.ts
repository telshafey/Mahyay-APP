
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    AppContextType, DailyData, Settings, PrayerFardStatus, UserStats,
    PersonalGoal, UserChallenge, HijriMonthInfo, IslamicOccasion, PrayerStatus
} from '../types';
import { PRAYERS, CHALLENGES, AZKAR_DATA, HIJRI_MONTHS_DETAILS } from '../constants';
import { calculateStats, getMaxCount } from '../utils';
import { supabase } from '../supabase';
import { useAuthContext } from '../contexts/AuthContext';

const getDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const defaultSettings: Settings = {
    quranGoal: 10,
    prayerMethod: 5, // Egyptian General Authority
    azkarMorningStart: '05:00',
    azkarEveningStart: '17:00',
    notifications: { prayers: true, azkar: true }
};

const createInitialPrayerData = (): { [key: string]: PrayerStatus } => Object.fromEntries(
    PRAYERS.map(p => [p.name, { fard: 'not_prayed', sunnahBefore: false, sunnahAfter: false }])
);

export const useAppData = (): AppContextType => {
    const { profile } = useAuthContext();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [appData, setAppData] = useState<{[key: string]: Partial<DailyData>}>({});
    const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
    const [goalProgress, setGoalProgress] = useState<{ [goalId: string]: number }>({});
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
    const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

    // Date and calendar logic
    const [hijriDate, setHijriDate] = useState('');
    const [dailyWisdom] = useState({ text: "من عمل بما علم، أورثه الله علم ما لم يعلم.", source: "حكمة" });
    const [currentHijriMonthInfo, setCurrentHijriMonthInfo] = useState<HijriMonthInfo | null>(null);
    const [nextIslamicOccasion, setNextIslamicOccasion] = useState<IslamicOccasion | null>(null);

    const showNotification = useCallback((message: string, icon: string) => {
        setNotification({ message, icon });
        setTimeout(() => setNotification(null), 5000);
    }, []);
    
    const handleSaveError = (error: unknown, contextMessage: string): string => {
        console.error(contextMessage, error);
        if (error instanceof Error) {
            return `فشل العملية. ${error.message}`;
        }
        return "فشل العملية لسبب غير معروف. يرجى مراجعة وحدة التحكم.";
    };

    // Load data from Supabase on profile load
    useEffect(() => {
        if (!profile) {
            setIsDataLoading(false);
            return;
        }

        const loadData = async () => {
            setIsDataLoading(true);
            try {
                // Fetch core user data (settings, app_data, goals)
                const { data: userData, error: userDataError } = await supabase
                    .from('user_data')
                    .select('settings, app_data, goals, goal_progress')
                    .eq('user_id', profile.id)
                    .single();
                
                if (userDataError && userDataError.code === '42P01') {
                     console.warn("The 'user_data' table was not found. Proceeding with default state.");
                } else if (userDataError && userDataError.code !== 'PGRST116') {
                    throw new Error(`فشل تحميل ملف المستخدم: ${userDataError.message}`);
                }

                if (userData) {
                    setSettings(userData.settings || defaultSettings);
                    setAppData(userData.app_data || {});
                    setPersonalGoals(userData.goals || []);
                    setGoalProgress(userData.goal_progress || {});
                } else {
                    setSettings(defaultSettings); setAppData({}); setPersonalGoals([]); setGoalProgress({});
                }

                // Fetch user challenges from the separate 'user_challenges' table
                const { data: challengesData, error: challengesError } = await supabase
                    .from('user_challenges')
                    .select('*')
                    .eq('user_id', profile.id);

                if (challengesError && challengesError.code === '42P01') {
                     console.warn("The 'user_challenges' table was not found. Challenges disabled.");
                } else if (challengesError) {
                    throw new Error(`فشل تحميل التحديات: ${challengesError.message}`);
                }
                
                const mappedChallenges: UserChallenge[] = (challengesData || []).map(c => ({
                    id: c.id,
                    userId: c.user_id,
                    challengeId: c.challenge_id,
                    startDate: c.started_at,
                    status: c.status,
                    progress: c.progress,
                    completedAt: c.completed_at,
                    lastLoggedDate: c.last_logged_date
                }));

                setUserChallenges(mappedChallenges);

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير معروف.";
                console.error("Error during data loading:", err);
                showNotification(errorMessage, '❌');
            } finally {
                setIsDataLoading(false);
            }
        };

        loadData();
    }, [profile, showNotification]);

    const saveDataToSupabase = useCallback(async (dataToSave: object) => {
        if (!profile) {
            const errorMsg = "User profile is not available. Cannot save data.";
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        
        const { error } = await supabase
            .from('user_data')
            .upsert({ user_id: profile.id, ...dataToSave }, { onConflict: 'user_id' });

        if (error) {
            console.error("Supabase Error Full Details:", error);
            const fullErrorString = `الخطأ: ${error.message}. التفاصيل: ${error.details || 'لا يوجد'}. تلميح: ${error.hint || 'لا يوجد'}. الرمز: ${error.code || 'غير معروف'}.`;
            throw new Error(fullErrorString);
        }
    }, [profile]);
    
    const saveChallengeToSupabase = useCallback(async (challenge: Partial<UserChallenge>) => {
        if (!profile || !challenge.id || typeof challenge.id === 'string') {
            throw new Error("Cannot save challenge with invalid or temporary ID.");
        };
        const { id, ...updateData } = challenge;
        
        const dbPayload = {
            progress: updateData.progress,
            status: updateData.status,
            completed_at: updateData.completedAt,
            last_logged_date: updateData.lastLoggedDate
        };
        
        Object.keys(dbPayload).forEach(key => {
            if ((dbPayload as any)[key] === undefined) {
                delete (dbPayload as any)[key];
            }
        });

        if (Object.keys(dbPayload).length === 0) {
            console.log("No challenge data to update.");
            return; 
        }

        const { error } = await supabase.from('user_challenges').update(dbPayload).eq('id', id);
        if (error) {
            console.error("Supabase error inside saveChallengeToSupabase:", error);
            const fullErrorString = `الخطأ: ${error.message}. التفاصيل: ${error.details || 'لا يوجد'}.`;
            throw new Error(fullErrorString);
        }
    }, [profile]);

    const todayKey = useMemo(() => getDateKey(new Date()), []);

    const dailyData = useMemo<DailyData>(() => {
        const defaultDaily: DailyData = {
            date: todayKey,
            prayerData: createInitialPrayerData(),
            azkarStatus: {},
            quranRead: 0,
            quranKhatmat: 0,
            azkarProgress: {},
            nawafilData: {},
            dailyGoalProgress: {},
        };
        return { ...defaultDaily, ...appData[todayKey] };
    }, [appData, todayKey]);
    
    const updateDailyData = useCallback(async (updates: Partial<DailyData>): Promise<boolean> => {
        const originalAppData = { ...appData };
        const newDailyData = { ...dailyData, ...updates };
        const newAppData = { ...appData, [todayKey]: newDailyData };
        setAppData(newAppData);
        try {
            await saveDataToSupabase({ app_data: newAppData });
            return true;
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to update daily data, reverting UI.");
            showNotification(errorMessage, '❌');
            setAppData(originalAppData);
            return false;
        }
    }, [dailyData, appData, todayKey, saveDataToSupabase, showNotification]);
    
    const updateChallengeProgress = useCallback(async (challengeId: string, change: number) => {
        const challengeIndex = userChallenges.findIndex(c => c.challengeId === challengeId && c.status === 'active');
        if (challengeIndex === -1) return;

        const userChallenge = userChallenges[challengeIndex];
        if (typeof userChallenge.id === 'string') {
            console.warn(`Skipping auto-update for challenge '${challengeId}' because it has a temporary ID.`);
            return;
        }

        const originalChallengesState = [...userChallenges];
        const baseChallenge = CHALLENGES.find(c => c.id === userChallenge.challengeId);
        if (!baseChallenge) return;

        const newProgress = Math.max(0, (userChallenge.progress || 0) + change);
        const newStatus = newProgress >= baseChallenge.target ? 'completed' : 'active';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

        const updatedChallenge: UserChallenge = {
            ...userChallenge,
            progress: newProgress,
            status: newStatus,
            completedAt: userChallenge.completedAt ?? completedAt,
        };

        const updatedChallenges = [...originalChallengesState];
        updatedChallenges[challengeIndex] = updatedChallenge;
        setUserChallenges(updatedChallenges);

        try {
            await saveChallengeToSupabase(updatedChallenge);
            if (newStatus === 'completed' && userChallenge.status !== 'completed') {
                showNotification(`🎉 اكتمل تحدي: ${baseChallenge.title}`, '🏆');
            }
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to update auto challenge progress, reverting UI.");
            showNotification(errorMessage, '❌');
            setUserChallenges(originalChallengesState);
        }
    }, [userChallenges, saveChallengeToSupabase, showNotification]);

    const hijriYearInfo = useMemo(() => {
        const now = new Date();
        const hijriYearStringEn = now.toLocaleDateString('en-US-u-ca-islamic', { year: 'numeric' });
        const year = parseInt(hijriYearStringEn.split(' ')[0], 10) || 1446;
        const isLeap = (year * 11 + 14) % 30 < 11;
        const length = isLeap ? 355 : 354;
        return { year, length };
    }, []);

    useEffect(() => {
        const now = new Date();
        setHijriDate(now.toLocaleDateString('ar-SA-u-ca-islamic', { year: 'numeric', month: 'long', day: 'numeric' }));
        const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', { day: 'numeric', month: 'numeric', year: 'numeric' });
        const parts = hijriFormatter.formatToParts(now);
        const currentHijriDay = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);
        const currentHijriMonth = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10);
        const currentHijriYear = parseInt(parts.find(p => p.type === 'year')?.value || '0', 10) || hijriYearInfo.year;
        const currentMonthData = HIJRI_MONTHS_DETAILS.find(m => m.number === currentHijriMonth);
        if (currentMonthData) {
            setCurrentHijriMonthInfo({ ...currentMonthData, year: currentHijriYear });
        }
        const allOccasionsThisYear: IslamicOccasion[] = HIJRI_MONTHS_DETAILS.flatMap(month => month.occasions.map(occ => ({...occ, hijriMonth: month.number })));
        let nextOccasion: IslamicOccasion | null = allOccasionsThisYear.sort((a, b) => a.hijriMonth !== b.hijriMonth ? a.hijriMonth - b.hijriMonth : a.hijriDay - b.hijriDay).find(occ => occ.hijriMonth > currentHijriMonth || (occ.hijriMonth === currentHijriMonth && occ.hijriDay > currentHijriDay)) || null;
        if (!nextOccasion && allOccasionsThisYear.length > 0) { nextOccasion = allOccasionsThisYear[0]; }
        setNextIslamicOccasion(nextOccasion);
    }, [hijriYearInfo]);

    const stats = useMemo<UserStats>(() => calculateStats(appData, userChallenges), [appData, userChallenges]);
    
    const weeklyPrayerCounts = useMemo(() => {
        const dayLabels = ['أ', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
        const today = new Date();
        const result = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const key = getDateKey(date);
            const data = appData[key];
            let count = 0;
            if (data?.prayerData) {
                count = Object.values(data.prayerData).filter(p => p.fard === 'early' || p.fard === 'ontime').length;
            }
            result.push({ day: dayLabels[date.getDay()], count });
        }
        return result;
    }, [appData]);

    const updatePrayerStatus = useCallback(async (prayerName: string, status: PrayerFardStatus): Promise<boolean> => {
        const newPrayerData = { ...dailyData.prayerData, [prayerName]: { ...dailyData.prayerData[prayerName], fard: status }};
        const success = await updateDailyData({ prayerData: newPrayerData });
        if(success) showNotification(`تم تسجيل صلاة ${prayerName}`, '✅');
        return success;
    }, [dailyData, updateDailyData, showNotification]);
    
    const updateSunnahStatus = async (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter'): Promise<boolean> => {
        const currentStatus = dailyData.prayerData[prayerName];
        const newPrayerData = { ...dailyData.prayerData, [prayerName]: { ...currentStatus, [type]: !currentStatus[type] } };
        const success = await updateDailyData({ prayerData: newPrayerData });

        if(success) {
            const sunnahChallenge = userChallenges.find(uc => {
                const base = CHALLENGES.find(c => c.id === uc.challengeId);
                return uc.status === 'active' && base?.relatedItem === 'sunnah';
            });
            if (sunnahChallenge) {
                const prayerInfo = PRAYERS.find(p => p.name === prayerName);
                const sunnahInfo = prayerInfo?.[type];
                if (sunnahInfo) {
                    const rakahChange = sunnahInfo.count * (!currentStatus[type] ? 1 : -1);
                    updateChallengeProgress(sunnahChallenge.challengeId, rakahChange);
                }
            }
        }
        return success;
    };
    
    const updateNawafilOption = async (nawafilName: string, optionIndex: number): Promise<boolean> => {
        const currentStatus = dailyData.nawafilData[nawafilName] || {};
        const isChecking = currentStatus.selectedOption !== optionIndex;
        const newStatus = { ...currentStatus, selectedOption: isChecking ? optionIndex : undefined };
        const newNawafilData = { ...dailyData.nawafilData, [nawafilName]: newStatus };
        const success = await updateDailyData({ nawafilData: newNawafilData });

        if(success) {
            showNotification(`تم تسجيل ${nawafilName}`, '✅');
            if (nawafilName === "صلاة الضحى") {
                const duhaChallenge = userChallenges.find(uc => {
                    const base = CHALLENGES.find(c => c.id === uc.challengeId);
                    return uc.status === 'active' && base?.relatedItem === 'ضحى';
                });
                if (duhaChallenge) {
                    const change = isChecking ? 1 : -1;
                    updateChallengeProgress(duhaChallenge.challengeId, change);
                }
            }
        }
        return success;
    };
    
    const updateQiyamCount = (nawafilName: string, change: number): Promise<boolean> => {
        const currentStatus = dailyData.nawafilData[nawafilName] || {};
        const newCount = Math.max(0, (currentStatus.count || 0) + change);
        const newStatus = { ...currentStatus, count: newCount };
        const newNawafilData = { ...dailyData.nawafilData, [nawafilName]: newStatus };
        return updateDailyData({ nawafilData: newNawafilData });
    };

    const getAzkarProgress = (azkarName: string) => {
        const progress = dailyData.azkarProgress[azkarName];
        const groupItems = AZKAR_DATA[azkarName];
        if (!progress || !groupItems || groupItems.length === 0) return 0;
        const totalCompleted = groupItems.reduce((acc, item, index) => {
            const maxCount = getMaxCount(item.repeat);
            const currentCount = progress[index] || 0;
            return acc + (currentCount >= maxCount ? 1 : 0);
        }, 0);
        return (totalCompleted / groupItems.length) * 100;
    };
    
    const toggleAzkarItemCompletion = (azkarName: string, itemIndex: number) => {
        const wasGroupCompletedBefore = dailyData.azkarStatus[azkarName] || false;
        
        const azkarProgress = { ...(dailyData.azkarProgress[azkarName] || {}) };
        const item = AZKAR_DATA[azkarName]?.[itemIndex];
        if (!item) return;

        const maxCount = getMaxCount(item.repeat);
        const currentCount = azkarProgress[itemIndex] || 0;
        
        azkarProgress[itemIndex] = currentCount >= maxCount ? 0 : maxCount;
        const allAzkarProgress = { ...dailyData.azkarProgress, [azkarName]: azkarProgress };
        
        const groupItems = AZKAR_DATA[azkarName];
        const isGroupCompletedNow = groupItems.every((it, idx) => (allAzkarProgress[azkarName]?.[idx] || 0) >= getMaxCount(it.repeat));

        updateDailyData({ 
            azkarProgress: allAzkarProgress,
            azkarStatus: { ...dailyData.azkarStatus, [azkarName]: isGroupCompletedNow }
        });
        
        if (isGroupCompletedNow !== wasGroupCompletedBefore && (azkarName === 'أذكار الصباح' || azkarName === 'أذكار المساء')) {
             const azkarChallenge = userChallenges.find(uc => {
                const base = CHALLENGES.find(c => c.id === uc.challengeId);
                return uc.status === 'active' && base?.relatedItem === 'azkar_groups';
            });
            if(azkarChallenge) {
                const change = isGroupCompletedNow ? 1 : -1;
                updateChallengeProgress(azkarChallenge.challengeId, change);
            }
        }
    };

    const completeAzkarGroup = (azkarName: string) => {
        const groupItems = AZKAR_DATA[azkarName];
        if (!groupItems) return;
        
        const wasGroupCompletedBefore = dailyData.azkarStatus[azkarName] || false;

        const newProgress = Object.fromEntries(
            groupItems.map((item, index) => [index, getMaxCount(item.repeat)])
        );

        updateDailyData({ 
            azkarProgress: { ...dailyData.azkarProgress, [azkarName]: newProgress },
            azkarStatus: { ...dailyData.azkarStatus, [azkarName]: true }
        });
        showNotification(`تم إكمال ${azkarName}`, '🎉');
        
        if (!wasGroupCompletedBefore && (azkarName === 'أذكار الصباح' || azkarName === 'أذكار المساء')) {
             const azkarChallenge = userChallenges.find(uc => {
                const base = CHALLENGES.find(c => c.id === uc.challengeId);
                return uc.status === 'active' && base?.relatedItem === 'azkar_groups';
            });
            if(azkarChallenge) {
                updateChallengeProgress(azkarChallenge.challengeId, 1);
            }
        }
    };

    const updateQuranRead = (change: number) => {
        const newRead = Math.max(0, dailyData.quranRead + change);
        updateDailyData({ quranRead: newRead });
        
        const quranChallenge = userChallenges.find(uc => {
            const base = CHALLENGES.find(c => c.id === uc.challengeId);
            return uc.status === 'active' && base?.relatedItem === 'quran';
        });
        if (quranChallenge) {
            updateChallengeProgress(quranChallenge.challengeId, change);
        }
    };

    const completeKhatma = () => { updateDailyData({ quranKhatmat: (dailyData.quranKhatmat || 0) + 1}); showNotification('ختمة جديدة مباركة!', '🎉'); };
    
    const updateSettings = (newSettings: Partial<Settings>) => { 
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveDataToSupabase({ settings: updated });
    };
    
    const resetAllData = async (): Promise<boolean> => { 
        if (!profile) return false;
        const originalState = { appData, personalGoals, goalProgress, userChallenges };
        setAppData({}); setPersonalGoals([]); setGoalProgress({}); setUserChallenges([]);
        try {
            await saveDataToSupabase({ app_data: {}, goals: [], goal_progress: {} });
            await supabase.from('user_challenges').delete().eq('user_id', profile.id);
            showNotification('تم إعادة تعيين البيانات', '🗑️'); 
            return true;
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to reset data, reverting.");
            showNotification(errorMessage, '❌');
            setAppData(originalState.appData);
            setPersonalGoals(originalState.personalGoals);
            setGoalProgress(originalState.goalProgress);
            setUserChallenges(originalState.userChallenges);
            return false;
        }
    };
    
    const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id'|'createdAt'|'isArchived'|'completedAt'>): Promise<boolean> => {
        if (!profile) return false;
        const originalGoals = [...personalGoals];
        const newGoal: PersonalGoal = {
            ...goal, id: `db-${Date.now()}`, createdAt: new Date().toISOString(), isArchived: false
        };
        const updatedGoals = [...personalGoals, newGoal];
        setPersonalGoals(updatedGoals);
        try {
            await saveDataToSupabase({ goals: updatedGoals });
            return true;
        } catch (error) {
             const errorMessage = handleSaveError(error, "Failed to add goal, reverting.");
            showNotification(errorMessage, '❌');
            setPersonalGoals(originalGoals);
            return false;
        }
    };
    
    const deletePersonalGoal = useCallback(async (goalId: string): Promise<boolean> => {
        if (!profile) return false;
        const originalGoals = personalGoals;
        const originalGoalProgress = goalProgress;
        const originalAppData = appData;

        const newGoals = originalGoals.filter(g => g.id !== goalId);
        const newGoalProgress = { ...originalGoalProgress };
        delete newGoalProgress[goalId];
        const newAppData = JSON.parse(JSON.stringify(originalAppData));
        for (const dateKey in newAppData) {
            if (newAppData[dateKey]?.dailyGoalProgress?.[goalId]) {
                delete newAppData[dateKey].dailyGoalProgress[goalId];
            }
        }
        
        setPersonalGoals(newGoals);
        setGoalProgress(newGoalProgress);
        setAppData(newAppData);

        try {
            await saveDataToSupabase({ goals: newGoals, goal_progress: newGoalProgress, app_data: newAppData });
            showNotification('تم حذف الهدف بنجاح', '✅');
            return true;
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to delete goal, reverting UI.");
            showNotification(errorMessage, '❌');
            setPersonalGoals(originalGoals);
            setGoalProgress(originalGoalProgress);
            setAppData(originalAppData);
            return false;
        }
    }, [personalGoals, goalProgress, appData, profile, saveDataToSupabase, showNotification, handleSaveError]);

    const toggleGoalArchivedStatus = useCallback(async (goalId: string): Promise<boolean> => {
        const goalIndex = personalGoals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) return false;

        const originalGoals = [...personalGoals];
        const goalToUpdate = originalGoals[goalIndex];
        
        const updatedGoal = { ...goalToUpdate, isArchived: !goalToUpdate.isArchived, completedAt: !goalToUpdate.isArchived ? new Date().toISOString() : null };
        const newGoals = [...originalGoals];
        newGoals[goalIndex] = updatedGoal;
        
        setPersonalGoals(newGoals);
        showNotification(updatedGoal.isArchived ? 'تم أرشفة الهدف' : 'تم إعادة تفعيل الهدف', '📁');
        
        try {
            await saveDataToSupabase({ goals: newGoals });
            return true;
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to update goal status, reverting UI.");
            showNotification(errorMessage, '❌');
            setPersonalGoals(originalGoals);
            return false;
        }
    }, [personalGoals, saveDataToSupabase, showNotification, handleSaveError]);

    
    const updateTargetGoalProgress = (goalId: string, newValue: number) => {
        const newProgress = { ...goalProgress, [goalId]: Math.max(0, newValue) };
        setGoalProgress(newProgress);
        saveDataToSupabase({ goal_progress: newProgress });
    };

    const toggleDailyGoalCompletion = (goalId: string) => {
        const newProgress = { ...dailyData.dailyGoalProgress, [goalId]: !dailyData.dailyGoalProgress[goalId] };
        updateDailyData({ dailyGoalProgress: newProgress });
    };
    
    const startChallenge = useCallback(async (challengeId: string) => {
        if (!profile) return;
        if (userChallenges.some(c => c.challengeId === challengeId)) {
            showNotification('لقد بدأت هذا التحدي بالفعل!', 'ℹ️');
            return;
        }

        const baseChallenge = CHALLENGES.find(c => c.id === challengeId);
        if (!baseChallenge) return;

        const optimisticId = `temp-${Date.now()}`;
        const newChallenge: UserChallenge = {
            id: optimisticId,
            userId: profile.id,
            challengeId,
            startDate: new Date().toISOString(),
            status: 'active',
            progress: 0,
            completedAt: null
        };
        setUserChallenges(prev => [...prev, newChallenge]);
        showNotification(`بدأ تحدي: ${baseChallenge.title}`, '🚀');

        try {
            const { data, error } = await supabase.from('user_challenges').insert({ user_id: profile.id, challenge_id: challengeId, status: 'active', progress: 0 }).select().single();
            if (error) throw error;
            if (!data) throw new Error("Challenge data was not returned after creation.");

            const finalChallenge: UserChallenge = {
                id: data.id,
                userId: data.user_id,
                challengeId: data.challenge_id,
                startDate: data.started_at,
                status: data.status,
                progress: data.progress,
                completedAt: data.completed_at,
                lastLoggedDate: data.last_logged_date
            };
            setUserChallenges(prev => prev.map(c => c.id === optimisticId ? finalChallenge : c));
        } catch (error) {
            const errorMessage = handleSaveError(error, "Error starting challenge:");
            showNotification(errorMessage, '❌');
            setUserChallenges(prev => prev.filter(c => c.id !== optimisticId));
        }
    }, [profile, userChallenges, showNotification, handleSaveError]);

    const logManualChallengeProgress = useCallback(async (challengeId: string) => {
        const challengeIndex = userChallenges.findIndex(c => c.challengeId === challengeId && c.status === 'active');
        if (challengeIndex === -1) return;
        
        const userChallenge = userChallenges[challengeIndex];
        if (typeof userChallenge.id === 'string') {
            showNotification('التحدي قيد الإنشاء، يرجى الانتظار لحظة والمحاولة مرة أخرى.', '⏳');
            return;
        }

        const originalChallengesState = [...userChallenges];
        const baseChallenge = CHALLENGES.find(c => c.id === challengeId);
        if (!baseChallenge) return;

        const newProgress = (userChallenge.progress || 0) + 1;
        const newStatus = newProgress >= baseChallenge.target ? 'completed' : 'active';
        const updatedChallenge: UserChallenge = { ...userChallenge, progress: newProgress, status: newStatus, lastLoggedDate: todayKey, completedAt: newStatus === 'completed' ? (userChallenge.completedAt || new Date().toISOString()) : userChallenge.completedAt };
        const updatedChallenges = [...originalChallengesState];
        updatedChallenges[challengeIndex] = updatedChallenge;
        setUserChallenges(updatedChallenges);

        try {
            await saveChallengeToSupabase(updatedChallenge);
            showNotification('تم تسجيل الإنجاز بنجاح!', '✅');
            if (newStatus === 'completed' && userChallenge.status !== 'completed') {
                showNotification(`🎉 اكتمل تحدي: ${baseChallenge.title}`, '🏆');
            }
        } catch (error) {
            const errorMessage = handleSaveError(error, "Failed to log manual challenge progress, reverting UI.");
            showNotification(errorMessage, '❌');
            setUserChallenges(originalChallengesState);
        }
    }, [userChallenges, todayKey, saveChallengeToSupabase, showNotification, handleSaveError]);
    
    return {
        isDataLoading, settings, dailyData, stats,
        updatePrayerStatus, updateSunnahStatus, updateNawafilOption, updateQiyamCount,
        dailyWisdom, getAzkarProgress, toggleAzkarItemCompletion,
        completeAzkarGroup, updateQuranRead, completeKhatma, updateSettings,
        resetAllData, 
        hijriDate,
        shortHijriDate: hijriDate.substring(0, 10),
        notification,
        personalGoals, goalProgress, addPersonalGoal, updateTargetGoalProgress,
        toggleDailyGoalCompletion, deletePersonalGoal, userChallenges, startChallenge,
        logManualChallengeProgress,
        currentHijriMonthInfo, nextIslamicOccasion,
        hijriYearInfo,
        weeklyPrayerCounts,
        toggleGoalArchivedStatus,
    };
};
