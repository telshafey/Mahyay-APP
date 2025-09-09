import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabase';
import { AppContextType, DailyData, Settings, PrayerFardStatus, AppData, Notification, IslamicOccasion, HijriMonthInfo, HijriYearInfo, DailyAzkarCategory } from '../types';
import { useAuthContext } from '../contexts/AuthContext';
import { usePersonalGoals } from './usePersonalGoals';
import { useUserChallenges } from './useUserChallenges';
import { calculateStats, getAbsolutePageApproximation, isHijriLeapYear } from '../utils';
import { PRAYERS, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, AZKAR_DATA } from '../constants';
import HijriDate from 'hijri-date';

const today = new Date();
const todayKey = today.toISOString().split('T')[0];

const initialDailyData: DailyData = {
    prayerData: PRAYERS.reduce((acc, p) => ({ ...acc, [p.name]: { fard: 'not_prayed', sunnahBefore: false, sunnahAfter: false } }), {}),
    azkarStatus: { 'أذكار الصباح': {}, 'أذكار المساء': {}, 'أذكار النوم': {}, 'أذكار الاستيقاظ': {} },
    quranPagesRead: 0,
    nawafilData: { 'قيام الليل': { count: 0 }, 'صلاة الضحى': {} },
    dailyGoalProgress: {},
};

const defaultSettings: Settings = {
    khatmaPosition: { surah: 1, ayah: 1 },
    quranGoal: 10,
    prayerMethod: 5,
    azkarMorningStart: '05:00',
    azkarEveningStart: '17:00',
    notifications: { prayers: true, azkar: true },
};

export const useAppData = (): AppContextType => {
    const { profile } = useAuthContext();
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [appData, setAppData] = useState<AppData>({});
    const [dailyData, setDailyData] = useState<DailyData>(initialDailyData);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [appError, setAppError] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notification | null>(null);

    const goalsHook = usePersonalGoals(profile);
    const challengesHook = useUserChallenges(profile);

    // Initial data loading
    useEffect(() => {
        if (!profile) {
            setIsDataLoading(false);
            return;
        }

        const loadData = async () => {
            setIsDataLoading(true);
            setAppError(null);
            try {
                // Fetch settings and daily entries in parallel
                const [settingsResult, dailyEntriesResult, dailyProgressResult] = await Promise.all([
                    supabase
                        .from('user_data')
                        .select('settings')
                        .eq('user_id', profile.id)
                        .single(),
                    supabase
                        .from('daily_entries')
                        .select('date, data')
                        .eq('user_id', profile.id),
                    supabase
                        .from('daily_goal_progress')
                        .select('goal_id')
                        .eq('user_id', profile.id)
                        .eq('date', todayKey)
                ]);

                // Handle Settings
                if (settingsResult.error && settingsResult.error.code !== 'PGRST116') throw settingsResult.error;
                if (settingsResult.data) {
                    setSettings({ ...defaultSettings, ...(settingsResult.data.settings || {}) });
                } else {
                    await supabase.from('user_data').insert({ user_id: profile.id, settings: defaultSettings });
                }

                // Handle Daily Entries
                if (dailyEntriesResult.error) throw dailyEntriesResult.error;
                const loadedAppData = Object.fromEntries(
                    (dailyEntriesResult.data || []).map(entry => [entry.date, entry.data])
                );
                setAppData(loadedAppData);
                
                const todayEntry = loadedAppData[todayKey];
                
                // Handle Daily Goal Progress
                if (dailyProgressResult.error) throw dailyProgressResult.error;
                const progressMap = Object.fromEntries(
                    (dailyProgressResult.data || []).map(p => [p.goal_id, true])
                );

                setDailyData({
                    ...initialDailyData,
                    ...(todayEntry || {}),
                    dailyGoalProgress: progressMap
                });


            } catch (err) {
                console.error("Failed to load user data:", err);
                let message = "فشل تحميل بيانات المستخدم.";
                // This robustly handles Supabase error objects and standard JS Error objects
                if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
                    message = `فشل تحميل البيانات من الخادم: ${err.message}`;
                } else if (err instanceof Error) {
                    message = `فشل تحميل البيانات من الخادم: ${err.message}`;
                }
                setAppError(message);
            } finally {
                setIsDataLoading(false);
            }
        };

        loadData();
    }, [profile]);
    
    const showNotificationWithTimeout = (message: string, icon: string) => {
        setNotification({ message, icon });
        setTimeout(() => setNotification(null), 5000);
    };

    const updateDailyData = useCallback(async (updates: Partial<DailyData>) => {
        if (!profile) return;
        
        const newDailyData = { ...dailyData, ...updates };
        setDailyData(newDailyData); // Optimistic UI update

        const dataToSave = {
            prayerData: newDailyData.prayerData,
            azkarStatus: newDailyData.azkarStatus,
            quranPagesRead: newDailyData.quranPagesRead,
            nawafilData: newDailyData.nawafilData,
        };

        const newAppData = { ...appData, [todayKey]: dataToSave };
        setAppData(newAppData);
        
        try {
            const { error } = await supabase
                .from('daily_entries')
                .upsert({
                    user_id: profile.id,
                    date: todayKey,
                    data: dataToSave,
                }, { onConflict: 'user_id, date' });

            if (error) throw error;
        } catch (err) {
            console.error("Failed to save daily data:", err);
            showNotificationWithTimeout('فشل حفظ البيانات', '❌');
            setDailyData(dailyData);
            setAppData(appData);
        }
    }, [profile, dailyData, appData]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        if (!profile) return;
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        try {
            await supabase.from('user_data').update({ settings: updatedSettings }).eq('user_id', profile.id);
            showNotificationWithTimeout('تم حفظ الإعدادات', '✅');
        } catch (error) {
            console.error("Failed to save settings:", error);
            showNotificationWithTimeout('فشل حفظ الإعدادات', '❌');
        }
    };

    const updatePrayerStatus = async (prayerName: string, status: PrayerFardStatus) => {
        const prayerData = { ...dailyData.prayerData, [prayerName]: { ...dailyData.prayerData[prayerName], fard: status } };
        await updateDailyData({ prayerData });
        if (status === 'early' || status === 'ontime') {
            await challengesHook.updateAutoChallengeProgress('prayer', 1);
        }
    };
    
    const updateSunnahStatus = async (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => {
        const currentStatus = dailyData.prayerData[prayerName][type];
        const prayerData = { ...dailyData.prayerData, [prayerName]: { ...dailyData.prayerData[prayerName], [type]: !currentStatus } };
        await updateDailyData({ prayerData });
    };

    const updateNawafilOption = async (nawafilName: string, optionIndex: number) => {
        const currentOption = dailyData.nawafilData[nawafilName]?.selectedOption;
        const newOption = currentOption === optionIndex ? undefined : optionIndex;
        const nawafilData = { ...dailyData.nawafilData, [nawafilName]: { selectedOption: newOption } };
        await updateDailyData({ nawafilData });
    };
    
    const updateQiyamCount = async (nawafilName: string, change: number) => {
        const currentCount = dailyData.nawafilData[nawafilName]?.count || 0;
        const newCount = Math.max(0, currentCount + change);
        const nawafilData = { ...dailyData.nawafilData, [nawafilName]: { count: newCount } };
        await updateDailyData({ nawafilData });
    };

    const checkAzkarCategoryCompletion = useCallback((categoryName: DailyAzkarCategory, newAzkarStatus: DailyData['azkarStatus']) => {
        const categoryItems = AZKAR_DATA.find(c => c.name === categoryName)?.items || [];
        const isCategoryComplete = categoryItems.every(item => (newAzkarStatus[categoryName]?.[item.id] || 0) >= item.repeat);

        if (isCategoryComplete) {
            showNotificationWithTimeout(`ما شاء الله! أتممت ${categoryName}`, '🎉');
            if (categoryName === 'أذكار الصباح') {
                 challengesHook.updateAutoChallengeProgress('azkar_morning', 1);
            } else if (categoryName === 'أذكار المساء') {
                 challengesHook.updateAutoChallengeProgress('azkar_evening', 1);
            }
        }
    }, [challengesHook]);


    const incrementAzkarCount = async (categoryName: DailyAzkarCategory, zikrId: number) => {
        const zikr = AZKAR_DATA.flatMap(c => c.items).find(z => z.id === zikrId);
        if (!zikr) return;

        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const currentCount = categoryStatus[zikrId] || 0;
        
        if (currentCount >= zikr.repeat) return;

        const newCount = currentCount + 1;
        const newCategoryStatus = { ...categoryStatus, [zikrId]: newCount };
        const newAzkarStatus = { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus };
        
        await updateDailyData({ azkarStatus: newAzkarStatus });
        
        if (newCount === zikr.repeat) {
             checkAzkarCategoryCompletion(categoryName, newAzkarStatus);
        }
    };
    
    const completeZikr = async (categoryName: DailyAzkarCategory, zikrId: number) => {
        const zikr = AZKAR_DATA.flatMap(c => c.items).find(z => z.id === zikrId);
        if (!zikr) return;

        const categoryStatus = dailyData.azkarStatus[categoryName] || {};
        const currentCount = categoryStatus[zikrId] || 0;

        if (currentCount >= zikr.repeat) return;

        const newCategoryStatus = { ...categoryStatus, [zikrId]: zikr.repeat };
        const newAzkarStatus = { ...dailyData.azkarStatus, [categoryName]: newCategoryStatus };
        
        await updateDailyData({ azkarStatus: newAzkarStatus });

        checkAzkarCategoryCompletion(categoryName, newAzkarStatus);
    };

    
    const updateKhatmaPosition = async (position: { surah: number, ayah: number }) => {
        const oldPage = getAbsolutePageApproximation(settings.khatmaPosition);
        const newPage = getAbsolutePageApproximation(position);
        const pagesReadChange = newPage - oldPage;
        
        if (pagesReadChange !== 0) {
            const newQuranPagesRead = Math.max(0, (dailyData.quranPagesRead || 0) + pagesReadChange);
            await updateDailyData({ quranPagesRead: newQuranPagesRead });
            await challengesHook.updateAutoChallengeProgress('quran', pagesReadChange);
        }
        await updateSettings({ khatmaPosition: position });
    };
    
    const toggleDailyGoalCompletion = async (goalId: string) => {
        if (!profile) return;
        const isCompleted = !!dailyData.dailyGoalProgress[goalId];
        const updatedProgress = { ...dailyData.dailyGoalProgress };
        
        let dbRequest;
        if(isCompleted) {
            delete updatedProgress[goalId];
            dbRequest = supabase.from('daily_goal_progress').delete()
                .eq('user_id', profile.id)
                .eq('goal_id', goalId)
                .eq('date', todayKey);
        } else {
            updatedProgress[goalId] = true;
            dbRequest = supabase.from('daily_goal_progress').insert({
                user_id: profile.id,
                goal_id: goalId,
                date: todayKey
            });
        }

        setDailyData(prev => ({...prev, dailyGoalProgress: updatedProgress }));

        try {
            const { error } = await dbRequest;
            if (error) throw error;
        } catch (error) {
            console.error("Failed to toggle daily goal:", error);
            showNotificationWithTimeout('فشل تحديث الهدف اليومي', '❌');
            setDailyData(prev => ({...prev, dailyGoalProgress: dailyData.dailyGoalProgress }));
        }
    }

    const resetAllData = async (): Promise<boolean> => {
        if (!profile) return false;
        try {
            await supabase.from('daily_entries').delete().eq('user_id', profile.id);
            await supabase.from('user_data').update({ settings: defaultSettings }).eq('user_id', profile.id);
            await supabase.from('personal_goals').delete().eq('user_id', profile.id);
            await supabase.from('goal_progress').delete().eq('user_id', profile.id);
            await supabase.from('user_challenges').delete().eq('user_id', profile.id);
            await supabase.from('daily_goal_progress').delete().eq('user_id', profile.id);

            setAppData({});
            setDailyData(initialDailyData);
            setSettings(defaultSettings);
            goalsHook.setPersonalGoals([]);
            goalsHook.setGoalProgress({});
            challengesHook.setUserChallenges([]);

            showNotificationWithTimeout('تم إعادة تعيين بياناتك بنجاح.', '🗑️');
            return true;
        } catch (error) {
            console.error("Failed to reset data:", error);
            showNotificationWithTimeout('حدث خطأ أثناء إعادة التعيين.', '❌');
            return false;
        }
    };


    const stats = useMemo(() => calculateStats(appData, challengesHook.userChallenges), [appData, challengesHook.userChallenges]);
    
    const hijriDateInfo = useMemo(() => {
        const hDate = new HijriDate();
        const currentYear = hDate.year;

        const yearInfo: HijriYearInfo = {
            year: currentYear,
            length: isHijriLeapYear(currentYear) ? 355 : 354,
        };

        const monthInfo: HijriMonthInfo = {
            ...HIJRI_MONTHS_INFO[hDate.month as keyof typeof HIJRI_MONTHS_INFO],
            occasions: ISLAMIC_OCCASIONS.filter(o => o.hijriMonth === hDate.month)
        };
        
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const parts = formatter.formatToParts(new Date());
        const day = parts.find(p => p.type === 'day')?.value || '';
        const month = parts.find(p => p.type === 'month')?.value || '';


        const todayValue = hDate.valueOf();
        let nextOccasion: IslamicOccasion | null = ISLAMIC_OCCASIONS
            .map(occ => ({...occ, date: new HijriDate(currentYear, occ.hijriMonth, occ.hijriDay)}))
            .filter(occ => occ.date.valueOf() >= todayValue)
            .sort((a,b) => a.date.valueOf() - b.date.valueOf())
            [0];

        if (!nextOccasion) {
            nextOccasion = ISLAMIC_OCCASIONS
                .map(occ => ({...occ, date: new HijriDate(currentYear + 1, occ.hijriMonth, occ.hijriDay)}))
                .sort((a,b) => a.date.valueOf() - b.date.valueOf())
                [0];
        }

        return {
            date: formatter.format(new Date()),
            parts: { day, month },
            monthInfo,
            yearInfo,
            nextOccasion: nextOccasion || null,
        }
    }, []);


     const weeklyPrayerCounts = useMemo(() => {
        const counts = Array(7).fill(0).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = appData[dateKey];
            const prayerCount = dayData?.prayerData ? Object.values(dayData.prayerData).filter(p => ['early', 'ontime'].includes(p.fard)).length : 0;
            return {
                day: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
                count: prayerCount
            };
        }).reverse();
        return counts;
    }, [appData]);

    const dailyWisdom = useMemo(() => {
        const wisdoms = [
            { text: "أحب الأعمال إلى الله أدومها وإن قل", source: "صحيح البخاري" },
            { text: "من سلك طريقا يلتمس فيه علما سهل الله له به طريقا إلى الجنة", source: "صحيح مسلم" },
            { text: "تبسمك في وجه أخيك لك صدقة", source: "سنن الترمذي" },
            { text: "إنما الأعمال بالنيات", source: "صحيح البخاري" }
        ];
        const dayOfYear = Math.floor((Date.now() - new Date(today.getFullYear(), 0, 0).valueOf()) / 86400000);
        return wisdoms[dayOfYear % wisdoms.length];
    }, []);

    return {
        settings,
        dailyData,
        isDataLoading,
        appError,
        notification,
        stats,
        hijriDate: hijriDateInfo.date,
        hijriDateParts: hijriDateInfo.parts,
        currentHijriMonthInfo: hijriDateInfo.monthInfo,
        nextIslamicOccasion: hijriDateInfo.nextOccasion,
        hijriYearInfo: hijriDateInfo.yearInfo,
        dailyWisdom,
        weeklyPrayerCounts,
        updateSettings,
        updatePrayerStatus,
        updateSunnahStatus,
        updateNawafilOption,
        updateQiyamCount,
        updateKhatmaPosition,
        resetAllData,
        ...goalsHook,
        ...challengesHook,
        toggleDailyGoalCompletion,
        incrementAzkarCount,
        completeZikr,
    };
};