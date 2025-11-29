import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContextType, AppData, DailyData, Settings, PrayerStatus, PrayerFardStatus, DailyAzkarCategory, PersonalGoal, UserChallenge, BaseChallenge, IslamicOccasion, PrayerMethod, Prayer, Nawafil, AzkarCategory, Zikr, Surah, FAQ } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { safeLocalStorage, calculateStats, getAbsolutePageApproximation, isHijriLeapYear } from '../utils';
import { PRAYERS, ADDITIONAL_PRAYERS, QURAN_SURAHS, CHALLENGES, AZKAR_DATA, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, PRAYER_METHODS } from '../constants';
import { MOCK_APP_DATA, MOCK_PERSONAL_GOALS, MOCK_USER_CHALLENGES, MOCK_FAQS } from '../mockData';
import { usePrayerTimesContext } from '../contexts/PrayerTimesContext';


const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

const initialSettings: Settings = {
    khatmaPosition: { surah: 1, ayah: 1 },
    quranGoal: 10,
    prayerMethod: 5,
    azkarMorningStart: '05:00',
    azkarEveningStart: '17:00',
    notifications: { prayers: true, azkar: true },
    featureToggles: { challenges: true, community: false },
    hijriDateAdjustment: 0,
};

const initialDailyData = (): DailyData => ({
    prayerData: Object.fromEntries(PRAYERS.map(p => [p.name, { fard: 'not_prayed', sunnahBefore: false, sunnahAfter: false }])),
    azkarStatus: {},
    quranPagesRead: 0,
    nawafilData: {},
    dailyGoalProgress: {},
});

export const useAppData = (): AppContextType => {
    const { profile } = useAuthContext();
    const { apiHijriDate } = usePrayerTimesContext();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

    // Main data states
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [appData, setAppData] = useState<AppData>({});
    const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
    const [goalProgress, setGoalProgress] = useState<{ [goalId: string]: number }>({});
    const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);

    // Admin-managed content
    const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
    const [challenges, setChallenges] = useState<BaseChallenge[]>(CHALLENGES);
    const [islamicOccasions, setIslamicOccasions] = useState<IslamicOccasion[]>(ISLAMIC_OCCASIONS);
    const [prayerMethods, setPrayerMethods] = useState<PrayerMethod[]>(PRAYER_METHODS);
    const [prayers, setPrayers] = useState<Prayer[]>(PRAYERS);
    const [nawafilPrayers, setNawafilPrayers] = useState<Nawafil[]>(ADDITIONAL_PRAYERS);
    const [azkarData, setAzkarData] = useState<AzkarCategory[]>(AZKAR_DATA);
    const [quranSurahs, setQuranSurahs] = useState<Surah[]>(QURAN_SURAHS);
    
    const showNotification = useCallback((message: string, icon: string) => {
        setNotification({ message, icon });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    // Load data
    useEffect(() => {
        if (!profile) {
            setIsDataLoading(false);
            return;
        }
        try {
            const savedSettings = safeLocalStorage.getItem(`settings_${profile.id}`);
            const savedAppData = safeLocalStorage.getItem(`appData_${profile.id}`);
            const savedGoals = safeLocalStorage.getItem(`personalGoals_${profile.id}`);
            const savedGoalProgress = safeLocalStorage.getItem(`goalProgress_${profile.id}`);
            const savedChallenges = safeLocalStorage.getItem(`userChallenges_${profile.id}`);

            setSettings(savedSettings ? { ...initialSettings, ...JSON.parse(savedSettings) } : initialSettings);
            setAppData(savedAppData ? JSON.parse(savedAppData) : MOCK_APP_DATA);
            setPersonalGoals(savedGoals ? JSON.parse(savedGoals) : MOCK_PERSONAL_GOALS);
            setGoalProgress(savedGoalProgress ? JSON.parse(savedGoalProgress) : {});
            setUserChallenges(savedChallenges ? JSON.parse(savedChallenges) : MOCK_USER_CHALLENGES);
        } catch (error) {
            console.error("Failed to load data", error);
            setAppError("حدث خطأ أثناء تحميل بياناتك.");
        } finally {
            setIsDataLoading(false);
        }
    }, [profile]);
    
    // Derived state
    const todayKey = getDateKey(new Date());
    const dailyData = useMemo<DailyData>(() => {
        const todayData = appData[todayKey] || {};
        const initial = initialDailyData();
        return { 
            ...initial, 
            ...todayData,
            dailyGoalProgress: { ...initial.dailyGoalProgress, ...todayData.dailyGoalProgress }
        };
    }, [appData, todayKey]);

    // Persistence
    const saveData = useCallback(<T,>(key: string, data: T) => {
        if (profile) {
            safeLocalStorage.setItem(`${key}_${profile.id}`, JSON.stringify(data));
        }
    }, [profile]);

    useEffect(() => { saveData('settings', settings); }, [settings, saveData]);
    useEffect(() => { saveData('appData', appData); }, [appData, saveData]);
    useEffect(() => { saveData('personalGoals', personalGoals); }, [personalGoals, saveData]);
    useEffect(() => { saveData('goalProgress', goalProgress); }, [goalProgress, saveData]);
    useEffect(() => { saveData('userChallenges', userChallenges); }, [userChallenges, saveData]);

    const updateDailyData = useCallback((key: keyof DailyData, value: any) => {
        setAppData(prev => {
            const currentDayData = prev[todayKey] || initialDailyData();
            const newTodayData = { ...currentDayData, [key]: value };
            return { ...prev, [todayKey]: newTodayData };
        });
    }, [todayKey]);

    // Data Manipulation Functions
    const updateSettings = async (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
        showNotification("تم حفظ الإعدادات", "⚙️");
    };

    const updateFeatureToggles = (toggles: { challenges: boolean; community: boolean }) => {
        setSettings(prev => ({ ...prev, featureToggles: toggles }));
         showNotification("تم تحديث الميزات", "🔧");
    };

    const updatePrayerStatus = async (prayerName: string, status: PrayerFardStatus) => {
        const newPrayerData = { ...dailyData.prayerData, [prayerName]: { ...dailyData.prayerData[prayerName], fard: status } };
        updateDailyData('prayerData', newPrayerData);
    };

    const updateSunnahStatus = async (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => {
        const currentStatus = dailyData.prayerData[prayerName];
        const newPrayerData = { ...dailyData.prayerData, [prayerName]: { ...currentStatus, [type]: !currentStatus[type] } };
        updateDailyData('prayerData', newPrayerData);
    };

    const updateNawafilOption = async (nawafilName: string, optionIndex: number) => {
        const currentNawafil = dailyData.nawafilData[nawafilName] || {};
        const newStatus = currentNawafil.selectedOption === optionIndex ? {} : { selectedOption: optionIndex };
        updateDailyData('nawafilData', { ...dailyData.nawafilData, [nawafilName]: newStatus });
    };

    const updateQiyamCount = async (nawafilName: string, change: number) => {
        const currentCount = dailyData.nawafilData[nawafilName]?.count || 0;
        const newCount = Math.max(0, currentCount + change);
        updateDailyData('nawafilData', { ...dailyData.nawafilData, [nawafilName]: { count: newCount } });
    };

    const updateKhatmaPosition = async (position: { surah: number; ayah: number }) => {
        const oldPage = getAbsolutePageApproximation(settings.khatmaPosition);
        const newPage = getAbsolutePageApproximation(position);
        const pagesRead = Math.max(0, newPage - oldPage);
        setSettings(prev => ({ ...prev, khatmaPosition: position }));
        updateDailyData('quranPagesRead', (dailyData.quranPagesRead || 0) + pagesRead);
        showNotification(`تم حفظ التقدم! (+${pagesRead} صفحات)`, "📖");
    };

    const incrementAzkarCount = async (categoryName: DailyAzkarCategory | string, zikrId: number) => {
        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const currentCount = categoryStatus[zikrId] || 0;
        const newCategoryStatus = { ...categoryStatus, [zikrId]: currentCount + 1 };
        updateDailyData('azkarStatus', { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus });
    };

    const completeZikr = async (categoryName: DailyAzkarCategory | string, zikrId: number) => {
        const zikr = azkarData.find(c => c.name === categoryName)?.items.find(z => z.id === zikrId);
        if (!zikr) return;
        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const newCategoryStatus = { ...categoryStatus, [zikrId]: zikr.repeat };
        updateDailyData('azkarStatus', { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus });
    };

    // Goals
    const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>) => {
        if (!profile) return false;
        const newGoal: PersonalGoal = { ...goal, id: `goal_${Date.now()}`, user_id: profile.id, created_at: new Date().toISOString(), is_archived: false, completed_at: null };
        setPersonalGoals(prev => [...prev, newGoal]);
        showNotification("تم إضافة الهدف بنجاح", "🎯");
        return true;
    };
    const deletePersonalGoal = async (goalId: string) => {
        setPersonalGoals(prev => prev.filter(g => g.id !== goalId));
        showNotification("تم حذف الهدف", "🗑️");
        return true;
    };
    const toggleGoalArchivedStatus = async (goalId: string) => {
        setPersonalGoals(prev => prev.map(g => g.id === goalId ? { ...g, is_archived: !g.is_archived, completed_at: !g.is_archived ? new Date().toISOString() : null } : g));
        return true;
    };
    const updateTargetGoalProgress = async (goalId: string, newValue: number) => {
        const goal = personalGoals.find(g => g.id === goalId);
        if (!goal) return false;
        const newProgress = Math.max(0, Math.min(newValue, goal.target));
        setGoalProgress(prev => ({ ...prev, [goalId]: newProgress }));
        return true;
    };
    const toggleDailyGoalCompletion = (goalId: string) => {
        const newProgress = { ...dailyData.dailyGoalProgress, [goalId]: !dailyData.dailyGoalProgress[goalId] };
        updateDailyData('dailyGoalProgress', newProgress);
    };

    // Challenges
    const startChallenge = async (challengeId: string) => {
        if (!profile) return false;
        const newChallenge: UserChallenge = { id: `uc_${Date.now()}`, user_id: profile.id, challenge_id: challengeId, started_at: new Date().toISOString(), status: 'active', progress: 0 };
        setUserChallenges(prev => [...prev, newChallenge]);
        showNotification("بدأ التحدي!", "🚀");
        return true;
    };
    const logManualChallengeProgress = async (challengeId: string) => {
        let challengeCompleted = false;
        setUserChallenges(prev => prev.map(uc => {
            if (uc.challenge_id === challengeId && uc.status === 'active') {
                const base = challenges.find(c => c.id === challengeId);
                if (!base) return uc;
                const newProgress = uc.progress + 1;
                const isCompleted = newProgress >= base.target;
                if (isCompleted) {
                    challengeCompleted = true;
                    showNotification(`🎉 اكتمل التحدي: ${base.title}`, '🏆');
                }
                return { ...uc, progress: newProgress, status: isCompleted ? 'completed' : 'active', completed_at: isCompleted ? new Date().toISOString() : undefined, last_logged_date: todayKey };
            }
            return uc;
        }));
        return challengeCompleted;
    };

    // Reset
    const resetAllData = async () => {
        if (!profile) return false;
        safeLocalStorage.removeItem(`settings_${profile.id}`);
        safeLocalStorage.removeItem(`appData_${profile.id}`);
        safeLocalStorage.removeItem(`personalGoals_${profile.id}`);
        safeLocalStorage.removeItem(`goalProgress_${profile.id}`);
        safeLocalStorage.removeItem(`userChallenges_${profile.id}`);
        window.location.reload();
        return true;
    };
    
    // Stats & Helpers
    const stats = useMemo(() => calculateStats(appData, userChallenges, challenges), [appData, userChallenges, challenges]);
    
    const hijriDateInfo = useMemo(() => {
        if (!apiHijriDate) {
            return {
                hijriDate: "جاري التحميل...",
                hijriDateParts: { day: '..', month: '...' },
                hijriYearInfo: { year: 0, length: 354 },
            };
        }

        const [day, month, year] = apiHijriDate.date.split('-').map(Number);
        const dayNum = day + (settings.hijriDateAdjustment || 0);

        return {
            hijriDate: `${dayNum} ${apiHijriDate.month.ar} ${apiHijriDate.year} هـ`,
            hijriDateParts: { day: String(dayNum), month: apiHijriDate.month.ar },
            hijriYearInfo: { year: Number(apiHijriDate.year), length: isHijriLeapYear(Number(apiHijriDate.year)) ? 355 : 354 },
        };
    }, [apiHijriDate, settings.hijriDateAdjustment]);
    
    const currentHijriMonthInfo = useMemo(() => {
        if (!apiHijriDate) return { name: '...', definition: '...', occasions: [] };
        
        const currentMonth = apiHijriDate.month.number;
        const info = (HIJRI_MONTHS_INFO as any)[currentMonth];
        return { 
            ...(info || { name: apiHijriDate.month.ar, definition: '' }),
            occasions: islamicOccasions.filter(o => o.hijriMonth === currentMonth),
        };
    }, [apiHijriDate, islamicOccasions]);
    
    const nextIslamicOccasion = useMemo(() => {
         if (!apiHijriDate) return null;
        
        const todayHijri = {
            day: parseInt(apiHijriDate.day, 10),
            month: apiHijriDate.month.number,
            year: parseInt(apiHijriDate.year, 10)
        };
        
        const todayDayOfYear = todayHijri.month * 30 + todayHijri.day;

        const sortedOccasions = [...islamicOccasions]
            .map(o => ({
                ...o,
                dayOfYear: o.hijriMonth * 30 + o.hijriDay,
                isNextYear: o.hijriMonth * 30 + o.hijriDay < todayDayOfYear
            }))
            .sort((a, b) => {
                if (a.isNextYear !== b.isNextYear) return a.isNextYear ? 1 : -1;
                return a.dayOfYear - b.dayOfYear;
            });

        return sortedOccasions[0] || null;

    }, [islamicOccasions, apiHijriDate]);

    const weeklyPrayerCounts = useMemo(() => {
        const counts = Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = getDateKey(date);
            const dayData = appData[dateKey];
            const prayers = dayData?.prayerData ? Object.values(dayData.prayerData).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length : 0;
            return { day: date.toLocaleDateString('ar-SA', { weekday: 'short'}), count: prayers };
        }).reverse();
        return counts;
    }, [appData]);

    const dailyWisdom = useMemo(() => ({ text: 'من عمل بما علم، أورثه الله علم ما لم يعلم.', source: 'حكمة' }), []);

    // Simple CRUD helpers for admin
    const createAdminHelpers = <T extends {id: any}>(setter: React.Dispatch<React.SetStateAction<T[]>>) => ({
        add: async (item: Omit<T, 'id'>) => { setter(p => [...p, { ...item, id: `new_${Date.now()}` } as T]); showNotification('تمت الإضافة', '✅'); },
        update: async (item: T) => { setter(p => p.map(i => i.id === item.id ? item : i)); showNotification('تم التحديث', '🔄'); },
        delete: async (id: any) => { setter(p => p.filter(i => i.id !== id)); showNotification('تم الحذف', '🗑️'); },
    });

    const challengeAdmin = createAdminHelpers(setChallenges);
    const occasionAdmin = createAdminHelpers(setIslamicOccasions);
    const methodAdmin = createAdminHelpers(setPrayerMethods);
    const faqAdmin = createAdminHelpers(setFaqs);

    return {
        settings, dailyData, isDataLoading, appError, notification, stats, 
        ...hijriDateInfo,
        currentHijriMonthInfo, nextIslamicOccasion, dailyWisdom, userChallenges, weeklyPrayerCounts,
        featureToggles: settings.featureToggles, faqs, challenges, islamicOccasions, prayerMethods, prayers, nawafilPrayers, azkarData, quranSurahs,
        updateSettings, updatePrayerStatus, updateSunnahStatus, updateNawafilOption, updateQiyamCount, updateKhatmaPosition, resetAllData,
        startChallenge, logManualChallengeProgress, incrementAzkarCount, completeZikr, updateFeatureToggles,
        // Personal Goals
        personalGoals, goalProgress, addPersonalGoal, updateTargetGoalProgress, toggleDailyGoalCompletion, deletePersonalGoal, toggleGoalArchivedStatus,
        // Admin funcs
        addChallenge: challengeAdmin.add, updateChallenge: challengeAdmin.update, deleteChallenge: challengeAdmin.delete,
        addIslamicOccasion: occasionAdmin.add, updateIslamicOccasion: occasionAdmin.update, deleteIslamicOccasion: occasionAdmin.delete,
        addPrayerMethod: methodAdmin.add, updatePrayerMethod: methodAdmin.update, deletePrayerMethod: methodAdmin.delete,
        addFaq: faqAdmin.add, updateFaq: faqAdmin.update, deleteFaq: faqAdmin.delete,
        updateFardhPrayer: async (p) => { setPrayers(prev => prev.map(i => i.name === p.name ? p : i)); showNotification('تم تحديث الصلاة', '🔄'); },
        updateNawafilPrayer: async (n) => { setNawafilPrayers(prev => prev.map(i => i.name === n.name ? n : i)); showNotification('تم تحديث النافلة', '🔄'); },
        updateSurah: async (s) => { setQuranSurahs(prev => prev.map(i => i.id === s.id ? s : i)); showNotification('تم تحديث السورة', '🔄'); },
        addZikr: async (cat, z) => { setAzkarData(p => p.map(c => c.name === cat ? {...c, items: [...c.items, {...z, id: Date.now(), category: String(cat)}]} : c)); showNotification('تمت إضافة الذكر', '✅'); },
        updateZikr: async (cat, z) => { setAzkarData(p => p.map(c => c.name === cat ? {...c, items: c.items.map(i => i.id === z.id ? z : i)}: c)); showNotification('تم تحديث الذكر', '🔄'); },
        deleteZikr: async (cat, id) => { setAzkarData(p => p.map(c => c.name === cat ? {...c, items: c.items.filter(i => i.id !== id)}: c)); showNotification('تم حذف الذكر', '🗑️'); },
        addAzkarCategory: async (name) => { setAzkarData(p => [...p, {name, items: []}]); showNotification('تمت إضافة الفئة', '✅');},
        deleteAzkarCategory: async (name) => { setAzkarData(p => p.filter(c => c.name !== name)); showNotification('تم حذف الفئة', '🗑️');},
    };
};