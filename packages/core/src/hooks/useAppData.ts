import { useState, useEffect, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import { AppContextType, AppData, DailyData, Settings, PrayerStatus, PrayerFardStatus, DailyAzkarCategory, PersonalGoal, UserChallenge, BaseChallenge, IslamicOccasion, PrayerMethod, Prayer, Nawafil, AzkarCategory, Zikr, Surah, FAQ, GoalType, ApiHijriDate, PrayerLocation } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { storage, calculateStats, getAbsolutePageApproximation, isHijriLeapYear } from '../utils';
import { PRAYERS, ADDITIONAL_PRAYERS, QURAN_SURAHS, CHALLENGES, AZKAR_DATA, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, PRAYER_METHODS, PRAYER_LOCATIONS } from '../constants';
import { MOCK_APP_DATA, MOCK_PERSONAL_GOALS, MOCK_FAQS } from '../mockData';
import HijriDate from 'hijri-date';
import { useUserChallenges } from './useUserChallenges';

const getDateKey = (date: Date): string => date.toISOString().split('T')[0];

const initialSettings: Settings = {
    khatmaPosition: { surah: 1, ayah: 1 },
    quranGoal: 10,
    prayerMethod: 5, // Egyptian General Authority of Survey
    azkarMorningStart: '05:00',
    azkarEveningStart: '17:00',
    notifications: { prayers: true, azkar: true },
    featureToggles: { challenges: true, community: false },
    hijriDateAdjustment: 0,
    city: 'Cairo',
    country: 'Egypt',
    defaultLocationId: 'cairo_egypt',
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
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);

    // Main data states
    const [settings, setSettings] = useState<Settings>(initialSettings);
    const [appData, setAppData] = useState<AppData>({});
    const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
    const [goalProgress, setGoalProgress] = useState<{ [goalId: string]: number }>({});
    const [apiHijriDate, setApiHijriDate] = useState<ApiHijriDate | null>(null);

    // Admin-managed content states
    const [faqs, setFaqs] = useState<FAQ[]>(MOCK_FAQS);
    const [challenges, setChallenges] = useState<BaseChallenge[]>(CHALLENGES);
    const [islamicOccasions, setIslamicOccasions] = useState<IslamicOccasion[]>(ISLAMIC_OCCASIONS);
    const [prayerMethods, setPrayerMethods] = useState<PrayerMethod[]>(PRAYER_METHODS);
    const [prayers, setPrayers] = useState<Prayer[]>(PRAYERS);
    const [nawafilPrayers, setNawafilPrayers] = useState<Nawafil[]>(ADDITIONAL_PRAYERS);
    const [azkarData, setAzkarData] = useState<AzkarCategory[]>(AZKAR_DATA);
    const [quranSurahs, setQuranSurahs] = useState<Surah[]>(QURAN_SURAHS);
    const [prayerLocations, setPrayerLocations] = useState<PrayerLocation[]>(PRAYER_LOCATIONS);

    const { userChallenges, startChallenge: startChallengeHook, logManualChallengeProgress: logManualChallengeHook, updateAutoTrackedChallenges } = useUserChallenges(profile, challenges);
    
    const showNotification = useCallback((message: string, icon: string) => {
        setNotification({ message, icon });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    // Load data on profile change
    useEffect(() => {
        const loadData = async () => {
            if (!profile) {
                setIsDataLoading(false);
                return;
            }
            try {
                const [savedSettings, savedAppData, savedGoals, savedGoalProgress] = await Promise.all([
                    storage.getItem(`settings_${profile.id}`),
                    storage.getItem(`appData_${profile.id}`),
                    storage.getItem(`personalGoals_${profile.id}`),
                    storage.getItem(`goalProgress_${profile.id}`),
                ]);

                setSettings(savedSettings ? { ...initialSettings, ...JSON.parse(savedSettings) } : initialSettings);
                setAppData(savedAppData ? JSON.parse(savedAppData) : MOCK_APP_DATA);
                setPersonalGoals(savedGoals ? JSON.parse(savedGoals) : MOCK_PERSONAL_GOALS);
                setGoalProgress(savedGoalProgress ? JSON.parse(savedGoalProgress) : {});
            } catch (error) {
                console.error("Failed to load data from storage", error);
                setAppError("حدث خطأ أثناء تحميل بياناتك المحفوظة.");
            } finally {
                setIsDataLoading(false);
            }
        };
        loadData();
    }, [profile]);
    
    // Derived state for today
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

    // Save data whenever it changes
    const saveData = useCallback(async <T,>(key: string, data: T) => {
        if (profile) {
            await storage.setItem(`${key}_${profile.id}`, JSON.stringify(data));
        }
    }, [profile]);

    useEffect(() => { saveData('settings', settings); }, [settings, saveData]);
    useEffect(() => { saveData('appData', appData); }, [appData, saveData]);
    useEffect(() => { saveData('personalGoals', personalGoals); }, [personalGoals, saveData]);
    useEffect(() => { saveData('goalProgress', goalProgress); }, [goalProgress, saveData]);
    
    const updateDailyData = useCallback((key: keyof DailyData, value: any) => {
        setAppData(prev => {
            const currentDayData = prev[todayKey] || initialDailyData();
            const newTodayData = { ...currentDayData, [key]: value };
            return { ...prev, [todayKey]: newTodayData };
        });
    }, [todayKey]);
    
    // Auto-track challenges whenever appData changes
    useEffect(() => {
        updateAutoTrackedChallenges(appData, todayKey);
    }, [appData, todayKey, updateAutoTrackedChallenges]);

    // Update Functions
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

    const incrementAzkarCount = async (categoryName: DailyAzkarCategory, zikrId: number) => {
        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const currentCount = categoryStatus[zikrId] || 0;
        const newCategoryStatus = { ...categoryStatus, [zikrId]: currentCount + 1 };
        updateDailyData('azkarStatus', { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus });
    };

    const completeZikr = async (categoryName: DailyAzkarCategory, zikrId: number) => {
        const zikr = AZKAR_DATA.find(c => c.name === categoryName)?.items.find(z => z.id === zikrId);
        if (!zikr) return;
        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const newCategoryStatus = { ...categoryStatus, [zikrId]: zikr.repeat };
        updateDailyData('azkarStatus', { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus });
    };

    // Personal Goals
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
        const result = await startChallengeHook(challengeId);
        if (result) {
            showNotification("بدأ التحدي!", "🚀");
        }
        return result;
    };

    const logManualChallengeProgress = async (challengeId: string) => {
        const result = await logManualChallengeHook(challengeId);
        return result;
    };

    // Data reset
    const resetAllData = async () => {
        if (!profile) return false;
        await Promise.all([
            storage.removeItem(`settings_${profile.id}`),
            storage.removeItem(`appData_${profile.id}`),
            storage.removeItem(`personalGoals_${profile.id}`),
            storage.removeItem(`goalProgress_${profile.id}`),
            storage.removeItem(`userChallenges_${profile.id}`),
        ]);
        window.location.reload();
        return true;
    };
    
    // Admin functions
    const adminAction = <T extends {id: any}>(stateSetter: Dispatch<SetStateAction<T[]>>, name: string) => ({
        add: async (item: Omit<T, 'id'>) => { stateSetter(prev => [...prev, { ...item, id: `${name.toLowerCase()}_${Date.now()}` } as T]); showNotification(`تمت إضافة ${name}`, '✅'); },
        update: async (item: T) => { stateSetter(prev => prev.map(i => i.id === item.id ? item : i)); showNotification(`تم تحديث ${name}`, '🔄'); },
        delete: async (id: any) => { stateSetter(prev => prev.filter(i => i.id !== id)); showNotification(`تم حذف ${name}`, '🗑️'); },
    });
    
    const challengeAdmin = adminAction(setChallenges, 'التحدي');
    const occasionAdmin = adminAction(setIslamicOccasions, 'المناسبة');
    const faqAdmin = adminAction(setFaqs, 'السؤال');
    const locationAdmin = adminAction(setPrayerLocations, 'الموقع');
    
    const addPrayerMethod = async (item: PrayerMethod) => {
        setPrayerMethods(prev => [...prev, item]);
        showNotification('تمت إضافة طريقة الحساب', '✅');
    };
    const updatePrayerMethod = async (item: PrayerMethod) => {
        setPrayerMethods(prev => prev.map(i => i.id === item.id ? item : i));
        showNotification('تم تحديث طريقة الحساب', '🔄');
    };
    const deletePrayerMethod = async (id: number) => {
        setPrayerMethods(prev => prev.filter(i => i.id !== id));
        showNotification('تم حذف طريقة الحساب', '🗑️');
    };

    // Stats and derived data
    const stats = useMemo(() => calculateStats(appData, userChallenges, challenges), [appData, userChallenges, challenges]);
    
    const hijriDate: any = useMemo(() => {
        let baseDate;
        if (apiHijriDate) {
            baseDate = new HijriDate(Number(apiHijriDate.year), apiHijriDate.month.number - 1, Number(apiHijriDate.day));
        } else {
            baseDate = new HijriDate();
        }
        baseDate.addDay(settings.hijriDateAdjustment || 0);
        return baseDate;
    }, [apiHijriDate, settings.hijriDateAdjustment]);

    const hijriDateParts = useMemo(() => ({
        day: hijriDate.getDate().toString(),
        month: hijriDate.format('MMMM'),
    }), [hijriDate]);
    
    const hijriYearInfo = useMemo(() => ({
        year: hijriDate.getFullYear(),
        length: isHijriLeapYear(hijriDate.getFullYear()) ? 355 : 354
    }), [hijriDate]);
    
    const currentHijriMonthInfo = useMemo(() => {
        const currentMonth = hijriDate.getMonth() + 1;
        const info = HIJRI_MONTHS_INFO[currentMonth];
        return { 
            ...(info || { name: 'غير معروف', definition: '' }),
            occasions: islamicOccasions.filter(o => o.hijriMonth === currentMonth),
        };
    }, [hijriDate, islamicOccasions]);
    
    const nextIslamicOccasion = useMemo(() => {
        const todayHijri = hijriDate;
        const year = todayHijri.getFullYear();
        
        return islamicOccasions
            .map(o => {
                const occasionDate = new HijriDate(year, o.hijriMonth - 1, o.hijriDay);
                if (occasionDate.getTime() < todayHijri.getTime()) {
                    return { ...o, date: new HijriDate(year + 1, o.hijriMonth - 1, o.hijriDay).toGregorian() };
                }
                return { ...o, date: occasionDate.toGregorian() };
            })
            .sort((a,b) => a.date.getTime() - b.date.getTime())[0] || null;
    }, [islamicOccasions, hijriDate]);

    const weeklyPrayerCounts = useMemo(() => {
        const counts = Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = getDateKey(date);
            const dayData = appData[dateKey];
            const prayersCount = dayData?.prayerData ? Object.values(dayData.prayerData).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length : 0;
            return { day: date.toLocaleString('ar-SA', { weekday: 'short'}), count: prayersCount };
        }).reverse();
        return counts;
    }, [appData]);

    const dailyWisdom = useMemo(() => ({ text: 'من عمل بما علم، أورثه الله علم ما لم يعلم.', source: 'حكمة' }), []);


    return {
        settings, dailyData, isDataLoading, appError, notification, stats, 
        hijriDate: hijriDate.format('dd MMMM yyyy'), 
        hijriDateParts,
        currentHijriMonthInfo, nextIslamicOccasion, hijriYearInfo, dailyWisdom, userChallenges, weeklyPrayerCounts,
        featureToggles: settings.featureToggles, faqs, challenges, islamicOccasions, 
        prayerMethods, prayerLocations,
        prayers, nawafilPrayers, azkarData, quranSurahs,
        apiHijriDate, setApiHijriDate,
        updateSettings, updatePrayerStatus, updateSunnahStatus, updateNawafilOption, updateQiyamCount, updateKhatmaPosition, resetAllData,
        startChallenge, logManualChallengeProgress, incrementAzkarCount, completeZikr, updateFeatureToggles,
        // Personal Goals
        personalGoals, goalProgress, addPersonalGoal, updateTargetGoalProgress, toggleDailyGoalCompletion, deletePersonalGoal, toggleGoalArchivedStatus,
        // Admin funcs
        addChallenge: challengeAdmin.add, updateChallenge: challengeAdmin.update, deleteChallenge: challengeAdmin.delete,
        addIslamicOccasion: occasionAdmin.add, updateIslamicOccasion: occasionAdmin.update, deleteIslamicOccasion: occasionAdmin.delete,
        addPrayerMethod, updatePrayerMethod, deletePrayerMethod,
        addPrayerLocation: locationAdmin.add, updatePrayerLocation: locationAdmin.update, deletePrayerLocation: locationAdmin.delete,
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