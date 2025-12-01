import { useState, useEffect, useMemo, useCallback } from 'react';
import HijriDate from 'hijri-date';
import { 
    AppContextType, AppData, Settings, DailyData, AppStats,
    BaseChallenge, IslamicOccasion, PrayerMethod, Prayer, Nawafil, AzkarCategory,
    HijriMonthInfo, PrayerFardStatus
} from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { usePersonalGoals } from './usePersonalGoals';
import { useUserChallenges } from './useUserChallenges';
import { calculateStats, getAbsolutePageApproximation, safeLocalStorage, isHijriLeapYear } from '../utils';
import { 
    PRAYERS as PRAYERS_DATA, 
    ADDITIONAL_PRAYERS as NAWAFIL_DATA, 
    CHALLENGES as CHALLENGES_DATA, 
    ISLAMIC_OCCASIONS as ISLAMIC_OCCASIONS_DATA,
    PRAYER_METHODS as PRAYER_METHODS_DATA,
    HIJRI_MONTHS_INFO, AZKAR_DATA, DAILY_WISDOMS
} from '../constants';
import { MOCK_APP_DATA } from '../mockData';


// Helper function to create initial daily data
const createInitialDailyData = (prayers: Prayer[], nawafil: Nawafil[]): DailyData => {
    const prayerData = Object.fromEntries(
        prayers.map(p => [p.name, { fard: 'not_prayed' as PrayerFardStatus, sunnahBefore: false, sunnahAfter: false }])
    );
    const nawafilData = Object.fromEntries(
        nawafil.map(n => [n.name, n.isCustom ? { count: 0 } : { selectedOption: -1 }])
    );
    return {
        prayerData,
        nawafilData,
        azkarStatus: { 'أذكار الصباح': {}, 'أذكار المساء': {}, 'أذكار النوم': {}, 'أذكار الاستيقاظ': {} },
        quranPagesRead: 0,
        dailyGoalProgress: {},
    };
};

export const useAppData = (): AppContextType => {
    const { profile } = useAuthContext();
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);

    const [settings, setSettings] = useState<Settings>({
        khatmaPosition: { surah: 1, ayah: 1 },
        quranGoal: 10,
        prayerMethod: 5,
        azkarMorningStart: "05:00",
        azkarEveningStart: "17:00",
        notifications: { prayers: true, azkar: true },
    });
    
    // Admin-managed data states
    const [challenges, setChallenges] = useState<BaseChallenge[]>(CHALLENGES_DATA);
    const [islamicOccasions, setIslamicOccasions] = useState<IslamicOccasion[]>(ISLAMIC_OCCASIONS_DATA);
    const [prayerMethods, setPrayerMethods] = useState<PrayerMethod[]>(PRAYER_METHODS_DATA);
    
    // Derived from constants directly as there is no state setter for these currently unused setters
    const prayers = PRAYERS_DATA;
    const nawafil = NAWAFIL_DATA;
    const azkarCategories = AZKAR_DATA;

    const [appData, setAppData] = useState<AppData>({});
    const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
    const { personalGoals, goalProgress, ...personalGoalsHandlers } = usePersonalGoals(profile);
    const { userChallenges, ...userChallengesHandlers } = useUserChallenges(profile, challenges);

    // Load and Save Logic
    const loadData = useCallback(() => {
        if (!profile) return;
        setIsDataLoading(true);
        try {
            const savedSettings = safeLocalStorage.getItem(`settings_${profile.id}`);
            if (savedSettings) setSettings(JSON.parse(savedSettings));

            const savedAppData = safeLocalStorage.getItem(`appData_${profile.id}`);
            const initialData = savedAppData ? JSON.parse(savedAppData) : MOCK_APP_DATA;
            setAppData(initialData);

        } catch (error) {
            setAppError("حدث خطأ أثناء تحميل بياناتك المحفوظة. قد تكون البيانات تالفة.");
            console.error("Data loading error:", error);
        } finally {
            setIsDataLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const saveData = useCallback((key: string, data: any) => {
        if (profile) {
            safeLocalStorage.setItem(`${key}_${profile.id}`, JSON.stringify(data));
        }
    }, [profile]);
    
    // Hijri Date Calculation (FIXED)
    const { hijriDate, hijriDateParts, currentHijriMonthInfo, nextIslamicOccasion, hijriYearInfo } = useMemo(() => {
        try {
            const today = new HijriDate();
            const day = today.getDate();
            const monthIndex = today.getMonth();
            const year = today.getFullYear();
            const monthName = HIJRI_MONTHS_INFO[monthIndex + 1]?.name || '';
    
            const fullDate = `${day} ${monthName} ${year} هـ`;
            
            const occasionsThisMonth = islamicOccasions.filter(o => o.hijriMonth === monthIndex + 1);
            const monthInfo: HijriMonthInfo = {
                ...(HIJRI_MONTHS_INFO[monthIndex + 1] || { name: monthName, definition: '' }),
                occasions: occasionsThisMonth,
            };
    
            const sortedOccasions = [...islamicOccasions].sort((a,b) => (a.hijriMonth * 30 + a.hijriDay) - (b.hijriMonth * 30 + b.hijriDay));
            let nextOccasion: IslamicOccasion | null = sortedOccasions.find(o => (o.hijriMonth > monthIndex + 1) || (o.hijriMonth === monthIndex + 1 && o.hijriDay >= day)) || null;
            if (!nextOccasion && sortedOccasions.length > 0) nextOccasion = sortedOccasions[0];
            
            const yearInfo = { year, length: isHijriLeapYear(year) ? 355 : 354 };
    
            return { 
                hijriDate: fullDate, 
                hijriDateParts: { day: String(day), month: monthName },
                currentHijriMonthInfo: monthInfo,
                nextIslamicOccasion: nextOccasion,
                hijriYearInfo: yearInfo
            };
        } catch(e) {
            console.error("Error calculating Hijri date:", e);
            setAppError("حدث خطأ أثناء حساب التاريخ الهجري.");
            return { hijriDate: '...', hijriDateParts: { day: '', month: '' }, currentHijriMonthInfo: null, nextIslamicOccasion: null, hijriYearInfo: null };
        }
    }, [islamicOccasions]);

    // Derived State
    const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    // Select Daily Wisdom based on the day of the year
    const dailyWisdom = useMemo(() => {
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = (new Date().getTime() - start.getTime()) + ((start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return DAILY_WISDOMS[dayOfYear % DAILY_WISDOMS.length];
    }, []);

    const dailyData = useMemo(() => {
        const data = appData[todayKey];
        if (data) {
            // Cast strictly to DailyData to fix missing property issue
            return { ...createInitialDailyData(prayers, nawafil), ...data } as DailyData;
        }
        return createInitialDailyData(prayers, nawafil);
    }, [appData, todayKey, prayers, nawafil]);

    const weeklyPrayerCounts = useMemo(() => {
        const counts = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dayKey = d.toISOString().split('T')[0];
            const dayOfWeek = d.toLocaleDateString('ar-SA', { weekday: 'short' });
            const dayData = appData[dayKey];
            const count = dayData?.prayerData ? Object.values(dayData.prayerData).filter((p: any) => p.fard && p.fard !== 'not_prayed' && p.fard !== 'missed').length : 0;
            return { day: dayOfWeek, count };
        }).reverse();
        return counts;
    }, [appData]);
    
    const stats: AppStats = useMemo(() => calculateStats(appData, userChallenges), [appData, userChallenges]);

    const showNotification = useCallback((message: string, icon: string) => {
        setNotification({ message, icon });
        setTimeout(() => setNotification(null), 5000);
    }, []);

    const updateDailyData = useCallback((updater: (currentData: DailyData) => DailyData) => {
        setAppData(prev => {
            const initialForDay = createInitialDailyData(prayers, nawafil);
            const currentDayPartial = prev[todayKey] || {};
            const currentDayFull: DailyData = { ...initialForDay, ...currentDayPartial } as DailyData;
            
            const updatedDayData = updater(currentDayFull);
            const newData = { ...prev, [todayKey]: updatedDayData };
            saveData('appData', newData);
            return newData;
        });
    }, [todayKey, saveData, prayers, nawafil]);

    // Data Mutation Functions
    const updateSettings = async (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        saveData('settings', updated);
    };

    const updateKhatmaPosition = async (position: { surah: number; ayah: number; }) => {
        const oldPage = getAbsolutePageApproximation(settings.khatmaPosition);
        const newPage = getAbsolutePageApproximation(position);
        const pagesRead = Math.max(0, newPage - oldPage);
        
        if (pagesRead > 0) {
            updateDailyData(d => ({...d, quranPagesRead: (d.quranPagesRead || 0) + pagesRead }));
            showNotification(`+${pagesRead} صفحات`, '📖');
        }
        await updateSettings({ khatmaPosition: position });
    };

    // Admin CRUD functions
    const addChallenge = async (challenge: Omit<BaseChallenge, 'id'>) => {
        const newChallenge = { ...challenge, id: `c${Date.now()}`};
        setChallenges(prev => [...prev, newChallenge]);
    };
    const updateChallenge = async (challenge: BaseChallenge) => {
        setChallenges(prev => prev.map(c => c.id === challenge.id ? challenge : c));
    };
    const deleteChallenge = async (challengeId: string) => {
        setChallenges(prev => prev.filter(c => c.id !== challengeId));
    };
    
    const addIslamicOccasion = async (occasion: Omit<IslamicOccasion, 'id'>) => {
        const newOccasion = { ...occasion, id: `o${Date.now()}`};
        setIslamicOccasions(prev => [...prev, newOccasion]);
    };
    const updateIslamicOccasion = async (occasion: IslamicOccasion) => {
        setIslamicOccasions(prev => prev.map(o => o.id === occasion.id ? occasion : o));
    };
    const deleteIslamicOccasion = async (occasionId: string) => {
        setIslamicOccasions(prev => prev.filter(o => o.id !== occasionId));
    };

    const addPrayerMethod = async (method: Omit<PrayerMethod, 'id'>) => {
        const newMethod = { ...method, id: Date.now()};
        setPrayerMethods(prev => [...prev, newMethod]);
    };
    const updatePrayerMethod = async (method: PrayerMethod) => {
        setPrayerMethods(prev => prev.map(m => m.id === method.id ? method : m));
    };
    const deletePrayerMethod = async (methodId: number) => {
        setPrayerMethods(prev => prev.filter(m => m.id !== methodId));
    };
    
    // ... Other functions
     const resetAllData = async () => {
        try {
            safeLocalStorage.removeItem(`settings_${profile?.id}`);
            safeLocalStorage.removeItem(`appData_${profile?.id}`);
            safeLocalStorage.removeItem(`personalGoals_${profile?.id}`);
            safeLocalStorage.removeItem(`goalProgress_${profile?.id}`);
            safeLocalStorage.removeItem(`userChallenges_${profile?.id}`);
            // Force reload or re-initialization
            window.location.reload();
            return true;
        } catch (e) {
            console.error("Error resetting data", e);
            setAppError("فشل إعادة تعيين البيانات.");
            return false;
        }
    };
    
    // Pass-through functions that modify dailyData
    const updatePrayerStatus = async (prayerName: string, status: 'early' | 'ontime' | 'late' | 'missed' | 'not_prayed') => updateDailyData(d => ({ ...d, prayerData: { ...d.prayerData, [prayerName]: { ...d.prayerData[prayerName], fard: status } } }));
    const updateSunnahStatus = async (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => updateDailyData(d => ({ ...d, prayerData: { ...d.prayerData, [prayerName]: { ...d.prayerData[prayerName], [type]: !d.prayerData[prayerName][type] } } }));
    const updateNawafilOption = async (nawafilName: string, optionIndex: number) => updateDailyData(d => ({...d, nawafilData: {...d.nawafilData, [nawafilName]: {...d.nawafilData[nawafilName], selectedOption: d.nawafilData[nawafilName]?.selectedOption === optionIndex ? -1 : optionIndex }}}));
    const updateQiyamCount = async (nawafilName: string, change: number) => updateDailyData(d => ({ ...d, nawafilData: { ...d.nawafilData, [nawafilName]: { ...d.nawafilData[nawafilName], count: Math.max(0, (d.nawafilData[nawafilName]?.count || 0) + change) } } }));
    const incrementAzkarCount = async (categoryName: any, zikrId: number) => updateDailyData(d => ({...d, azkarStatus: {...d.azkarStatus, [categoryName]: {...d.azkarStatus[categoryName], [zikrId]: (d.azkarStatus[categoryName]?.[zikrId] || 0) + 1 }}}));
    const completeZikr = async (categoryName: any, zikrId: number) => {
      const category = azkarCategories.find(c => c.name === categoryName);
      const zikr = category?.items.find(i => i.id === zikrId);
      if(!zikr) return;
      updateDailyData(d => ({...d, azkarStatus: {...d.azkarStatus, [categoryName]: {...d.azkarStatus[categoryName], [zikrId]: zikr.repeat }}}));
    };
    personalGoalsHandlers.toggleDailyGoalCompletion = async (goalId: string) => updateDailyData(d => ({...d, dailyGoalProgress: {...d.dailyGoalProgress, [goalId]: !d.dailyGoalProgress[goalId]}}));
    

    return {
        isDataLoading,
        appError,
        settings,
        dailyData,
        notification,
        stats,
        hijriDate,
        hijriDateParts,
        currentHijriMonthInfo,
        nextIslamicOccasion,
        hijriYearInfo,
        dailyWisdom,
        userChallenges,
        ...userChallengesHandlers,
        personalGoals,
        goalProgress,
        ...personalGoalsHandlers,
        weeklyPrayerCounts,
        updateSettings,
        updatePrayerStatus,
        updateSunnahStatus,
        updateNawafilOption,
        updateQiyamCount,
        updateKhatmaPosition,
        resetAllData,
        incrementAzkarCount,
        completeZikr,
        // Admin states and functions
        challenges,
        islamicOccasions,
        prayerMethods,
        addChallenge,
        updateChallenge,
        deleteChallenge,
        addIslamicOccasion,
        updateIslamicOccasion,
        deleteIslamicOccasion,
        addPrayerMethod,
        updatePrayerMethod,
        deletePrayerMethod,
    };
};