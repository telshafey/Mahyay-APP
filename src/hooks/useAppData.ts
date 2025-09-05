import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppData, DailyData, PrayerFardStatus, Settings, Prayer, UserStats, IslamicOccasion, HijriMonthInfo, Wisdom, HijriYearInfo, PrayerStatus, PersonalGoal, GoalProgress } from '../types';
import { PRAYERS, AZKAR_DATA, DAILY_DUAS, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, DAILY_WISDOMS, AZKAR_TYPES } from '../constants';
import { calculateStats, toSnake, toCamel, convertKeys, safeLocalStorage } from '../utils';
import { supabase } from '../supabase';
import { useAuthContext } from '../contexts/AuthContext';

const getDateKey = (date: Date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

const defaultPrayerData = PRAYERS.reduce((acc, p) => {
    acc[p.name] = { fard: 'not_prayed', sunnahBefore: false, sunnahAfter: false };
    return acc;
}, {} as DailyData['prayerData']);

const defaultDailyData: DailyData = {
    prayerData: defaultPrayerData,
    nawafilData: {},
    azkarProgress: {},
    azkarStatus: {},
    quranRead: 0,
    quranKhatmat: 0,
    dailyGoalProgress: {}
};

const defaultSettings: Settings = {
    quranGoal: 10,
    notifications: {
        prayers: true,
        azkar: true,
    },
    azkarMorningStart: '04:00',
    azkarEveningStart: '16:00',
    prayerMethod: 5,
};

// Local storage keys remain for offline caching
const APP_DATA_KEY = 'mahyay_appData';
const SETTINGS_KEY = 'mahyay_settings';
const PERSONAL_GOALS_KEY = 'mahyay_personalGoals';
const GOAL_PROGRESS_KEY = 'mahyay_goalProgress';

export const useAppData = () => {
  const { profile } = useAuthContext();
  const [appData, setAppData] = useState<AppData>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState(getDateKey());
  
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [shortHijriDate, setShortHijriDate] = useState('');
  const [shortGregorianDate, setShortGregorianDate] = useState('');

  const [dailyDua, setDailyDua] = useState(DAILY_DUAS[0]);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [dailyWisdom, setDailyWisdom] = useState<Wisdom | null>(null);
  const [hijriYearInfo, setHijriYearInfo] = useState<HijriYearInfo | null>(null);
  const [currentHijriMonthInfo, setCurrentHijriMonthInfo] = useState<HijriMonthInfo | null>(null);
  const [nextIslamicOccasion, setNextIslamicOccasion] = useState<IslamicOccasion | null>(null);

  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({});

  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  const showNotification = useCallback((message: string, icon: string) => {
      if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
      }
      setNotification({ message, icon });
      notificationTimeoutRef.current = window.setTimeout(() => {
          setNotification(null);
      }, 5000);
  }, []);

  // --- DATA SYNC WITH SUPABASE ---

  useEffect(() => {
    const loadData = async () => {
        if (!profile) {
            setIsDataLoading(false);
            return;
        };

        setIsDataLoading(true);
        setDataError(null);

        try {
            // Load from localStorage first for offline speed
            try {
                const storedAppData = safeLocalStorage.getItem(APP_DATA_KEY);
                const storedSettings = safeLocalStorage.getItem(SETTINGS_KEY);
                const storedGoals = safeLocalStorage.getItem(PERSONAL_GOALS_KEY);
                const storedGoalProgress = safeLocalStorage.getItem(GOAL_PROGRESS_KEY);

                if (storedAppData) setAppData(JSON.parse(storedAppData));
                if (storedSettings) {
                    const loadedSettings = JSON.parse(storedSettings);
                    // Merge with defaults to prevent crashes on missing nested keys
                    setSettings({
                        ...defaultSettings,
                        ...loadedSettings,
                        notifications: {
                            ...defaultSettings.notifications,
                            ...(loadedSettings.notifications || {}),
                        },
                    });
                }
                if (storedGoals) setPersonalGoals(JSON.parse(storedGoals));
                if (storedGoalProgress) setGoalProgress(JSON.parse(storedGoalProgress));
            } catch (e) {
                console.warn("Failed to load or parse data from localStorage. Resetting local state.", e);
                setAppData({});
                setSettings(defaultSettings);
                setPersonalGoals([]);
                setGoalProgress({});
            }


            // Fetch from Supabase to get the latest synced data
            const [
                settingsRes,
                goalsRes,
                goalProgressRes,
                dailyDataRes
            ] = await Promise.all([
                supabase.from('settings').select('*').eq('user_id', profile.id).single(),
                supabase.from('personal_goals').select('*').eq('user_id', profile.id),
                supabase.from('goal_progress').select('*').eq('user_id', profile.id),
                supabase.from('daily_data').select('*').eq('user_id', profile.id),
            ]);

            if (settingsRes.error) throw new Error(`Settings fetch failed: ${settingsRes.error.message}`);
            if (goalsRes.error) throw new Error(`Goals fetch failed: ${goalsRes.error.message}`);
            if (goalProgressRes.error) throw new Error(`Goal Progress fetch failed: ${goalProgressRes.error.message}`);
            if (dailyDataRes.error) throw new Error(`Daily Data fetch failed: ${dailyDataRes.error.message}`);
            
            // Sync settings
            if (settingsRes.data) {
                const loadedSettings: Partial<Settings> = convertKeys(settingsRes.data, toCamel);
                const mergedSettings: Settings = {
                    ...defaultSettings,
                    ...loadedSettings,
                    notifications: {
                        ...defaultSettings.notifications,
                        ...(loadedSettings.notifications || {}),
                    },
                };
                setSettings(mergedSettings);
                safeLocalStorage.setItem(SETTINGS_KEY, JSON.stringify(mergedSettings));
            }

            // Sync personal goals
            if (goalsRes.data) {
                const dbGoals: PersonalGoal[] = convertKeys(goalsRes.data, toCamel);
                setPersonalGoals(dbGoals);
                safeLocalStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(dbGoals));
            }
            
            // Sync goal progress
            if (goalProgressRes.data) {
                const dbProgress = goalProgressRes.data.reduce((acc, item) => {
                    acc[item.goal_id] = item.current_value;
                    return acc;
                }, {} as GoalProgress);
                setGoalProgress(dbProgress);
                safeLocalStorage.setItem(GOAL_PROGRESS_KEY, JSON.stringify(dbProgress));
            }

            // Sync daily data
            if (dailyDataRes.data) {
                const dbAppData = dailyDataRes.data.reduce((acc, day) => {
                    acc[day.date_key] = convertKeys(day, toCamel);
                    return acc;
                }, {} as AppData);
                setAppData(dbAppData);
                safeLocalStorage.setItem(APP_DATA_KEY, JSON.stringify(dbAppData));
            }

        } catch (error) {
            console.error("Error loading data:", error);
            const message = error instanceof Error ? error.message : "فشل تحميل بياناتك من السحابة. قد يتم عرض بيانات غير محدّثة.";
            setDataError(message);
        } finally {
            setIsDataLoading(false);
        }
    };

    loadData();
  }, [profile]);

  const dailyData = useMemo(() => {
    const dataForToday = appData[todayKey];
    return { ...defaultDailyData, ...dataForToday };
  }, [appData, todayKey]);


  const saveData = useCallback(async (newDailyData: Partial<DailyData>) => {
    if (!profile) return;
    const currentDailyData = appData[todayKey] || defaultDailyData;
    const updatedDailyData = { ...currentDailyData, ...newDailyData };
    
    // Optimistic UI update
    const newAppData = { ...appData, [todayKey]: updatedDailyData };
    setAppData(newAppData);
    safeLocalStorage.setItem(APP_DATA_KEY, JSON.stringify(newAppData));

    // Sync to Supabase
    try {
        const dataToUpsert = {
            user_id: profile.id,
            date_key: todayKey,
            prayer_data: updatedDailyData.prayerData,
            nawafil_data: updatedDailyData.nawafilData,
            azkar_progress: updatedDailyData.azkarProgress,
            azkar_status: updatedDailyData.azkarStatus,
            quran_read: updatedDailyData.quranRead,
            quran_khatmat: updatedDailyData.quranKhatmat,
            daily_goal_progress: updatedDailyData.dailyGoalProgress,
        };
        
        const { error } = await supabase.from('daily_data').upsert(dataToUpsert);
        if (error) throw error;

    } catch (error) {
        console.error("Failed to sync daily data:", error);
        showNotification("⚠️ فشلت المزامنة، تحقق من اتصالك", "🔄");
    }
  }, [appData, todayKey, profile, showNotification]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    if (!profile) return;
    
    // Perform a deep merge for nested objects like 'notifications' to prevent data loss.
    const updatedSettings: Settings = {
        ...settings,
        ...newSettings,
        notifications: {
            ...settings.notifications,
            ...(newSettings.notifications || {}),
        },
    };

    setSettings(updatedSettings);
    safeLocalStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));

    try {
        const settingsForDb = convertKeys(updatedSettings, toSnake);
        const { error } = await supabase.from('settings').upsert({ ...settingsForDb, user_id: profile.id });
        if (error) throw error;
    } catch(error) {
        console.error("Failed to sync settings:", error);
        showNotification("⚠️ فشلت مزامنة الإعدادات", "⚙️");
    }
  }, [settings, profile, showNotification]);

  const resetAllData = async () => {
      if (!profile) return;
      if (!window.confirm("⚠️ تحذير! هل أنت متأكد من أنك تريد مسح جميع بيانات العبادة والأهداف من حسابك؟ لا يمكن التراجع عن هذا الإجراء.")) return;
      
      try {
          // Delete from Supabase
          await Promise.all([
              supabase.from('daily_data').delete().eq('user_id', profile.id),
              supabase.from('personal_goals').delete().eq('user_id', profile.id),
              // Goal progress is cascade deleted
          ]);
          
          // Clear local
          safeLocalStorage.removeItem(APP_DATA_KEY);
          safeLocalStorage.removeItem(PERSONAL_GOALS_KEY);
          safeLocalStorage.removeItem(GOAL_PROGRESS_KEY);
          setAppData({});
          setPersonalGoals([]);
          setGoalProgress({});

          alert("تم مسح بيانات العبادة والأهداف من حسابك بنجاح.");
      } catch (error) {
          console.error("Failed to reset data:", error);
          alert("حدث خطأ أثناء محاولة مسح البيانات من السحابة.");
      }
  };

  // --- GOALS MANAGEMENT ---
    const addPersonalGoal = async (goal: Omit<PersonalGoal, 'id' | 'createdAt' | 'isArchived' | 'completedAt'>) => {
        if(!profile) return;
        const tempId = crypto.randomUUID();
        const newGoal: PersonalGoal = {
            ...goal,
            id: tempId, // Temporary ID for UI
            createdAt: new Date().toISOString(),
            isArchived: false,
        };
        
        // Optimistic UI update
        const updatedGoals = [...personalGoals, newGoal];
        setPersonalGoals(updatedGoals);
        safeLocalStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(updatedGoals));
        
        try {
            const goalForDb = convertKeys({ ...goal, user_id: profile.id }, toSnake);
            const { data, error } = await supabase.from('personal_goals').insert(goalForDb).select().single();
            if (error) throw error;
            
            const savedGoal: PersonalGoal = convertKeys(data, toCamel);

            // Replace temporary goal with the one from DB
            const finalGoals = personalGoals.map(g => g.id === tempId ? savedGoal : g)
            setPersonalGoals(finalGoals);
            safeLocalStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(finalGoals));

            if (savedGoal.type === 'target') {
                await updateTargetGoalProgress(savedGoal.id, 0, true);
            }
        } catch(error) {
            console.error("Failed to add goal:", error);
            showNotification("⚠️ فشلت إضافة الهدف", "🎯");
            // Revert UI change
            setPersonalGoals(personalGoals);
        }
    };

    const updatePersonalGoal = async (goalId: string, updates: Partial<PersonalGoal>) => {
       if (!profile) return;
        
        const oldGoals = personalGoals;
        const updatedGoals = personalGoals.map(g => g.id === goalId ? { ...g, ...updates } : g);
        setPersonalGoals(updatedGoals);
        safeLocalStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(updatedGoals));
        
        try {
            const updatesForDb = convertKeys(updates, toSnake);
            const { error } = await supabase.from('personal_goals').update(updatesForDb).eq('id', goalId);
            if(error) throw error;
        } catch (error) {
            console.error("Failed to update goal:", error);
            showNotification("⚠️ فشل تحديث الهدف", "🎯");
            setPersonalGoals(oldGoals);
        }
    };
    
    const archivePersonalGoal = (goalId: string) => {
        updatePersonalGoal(goalId, { isArchived: true });
    };

    const deletePersonalGoal = async (goalId: string) => {
        if(!profile) return;
        
        const oldGoals = personalGoals;
        const oldProgress = goalProgress;

        const updatedGoals = personalGoals.filter(g => g.id !== goalId);
        const newProgress = { ...goalProgress };
        delete newProgress[goalId];
        
        setPersonalGoals(updatedGoals);
        setGoalProgress(newProgress);
        safeLocalStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(updatedGoals));
        safeLocalStorage.setItem(GOAL_PROGRESS_KEY, JSON.stringify(newProgress));
        
        try {
            const { error } = await supabase.from('personal_goals').delete().eq('id', goalId);
            if(error) throw error;
        } catch (error) {
            console.error("Failed to delete goal:", error);
            showNotification("⚠️ فشل حذف الهدف", "🎯");
            setPersonalGoals(oldGoals);
            setGoalProgress(oldProgress);
        }
    };
  
    const updateTargetGoalProgress = async (goalId: string, newValue: number, isInitial = false) => {
        if(!profile) return;
        const goal = personalGoals.find(g => g.id === goalId);
        if (!goal) return;

        const cappedValue = Math.max(0, Math.min(newValue, goal.target));
        const newProgress = { ...goalProgress, [goalId]: cappedValue };

        // Optimistic update
        setGoalProgress(newProgress);
        safeLocalStorage.setItem(GOAL_PROGRESS_KEY, JSON.stringify(newProgress));

        if (!isInitial) {
          if (cappedValue >= goal.target && !goal.completedAt) {
              updatePersonalGoal(goalId, { completedAt: new Date().toISOString() });
              showNotification(`🎉 رائع! أتممت هدف '${goal.title}'`, goal.icon);
          } else if (cappedValue < goal.target && goal.completedAt) {
              updatePersonalGoal(goalId, { completedAt: undefined });
          }
        }

        try {
            const { error } = await supabase.from('goal_progress').upsert({
                goal_id: goalId,
                user_id: profile.id,
                current_value: cappedValue
            });
            if (error) throw error;
        } catch (error) {
            console.error("Failed to sync goal progress:", error);
            showNotification("⚠️ فشلت مزامنة تقدم الهدف", "🎯");
        }
    };

    const toggleDailyGoalCompletion = (goalId: string) => {
        const currentStatus = dailyData.dailyGoalProgress[goalId] || false;
        const newDailyGoalProgress = { ...dailyData.dailyGoalProgress, [goalId]: !currentStatus };
        saveData({ dailyGoalProgress: newDailyGoalProgress });
        if (!currentStatus) {
            const goal = personalGoals.find(g => g.id === goalId);
            if (goal) {
                showNotification(`أحسنت! أكملت هدف '${goal.title}'`, goal.icon);
            }
        }
    };
  // --- END GOALS & DATA SYNC ---
  
  const updatePrayerStatus = (prayerName: string, status: PrayerFardStatus) => {
    const newPrayerData = { ...dailyData.prayerData };
    newPrayerData[prayerName].fard = status;
    saveData({ prayerData: newPrayerData });
    const prayer = PRAYERS.find(p => p.name === prayerName);
    if (status !== 'not_prayed') {
        showNotification(`تقبل الله صلاة ${prayerName}`, prayer?.emoji || '✅');
    }
  };
  
  const updateSunnahStatus = (prayerName: string, sunnahType: 'sunnahBefore' | 'sunnahAfter') => {
    const newPrayerData = { ...dailyData.prayerData };
    const currentStatus = newPrayerData[prayerName][sunnahType];
    newPrayerData[prayerName][sunnahType] = !currentStatus;
    saveData({ prayerData: newPrayerData });
    const prayer = PRAYERS.find(p => p.name === prayerName);
    if (!currentStatus) { // if it was false and is now true
        const sunnahText = sunnahType === 'sunnahBefore' ? 'القبلية' : 'البعدية';
        showNotification(`تقبل الله سُنة ${prayerName} ${sunnahText}`, prayer?.emoji || '🤲');
    }
  };

  const updateNawafilOption = (prayerName: string, optionIndex: number) => {
    const newNawafilData = { ...dailyData.nawafilData };
    const current = newNawafilData[prayerName] || {};
    if (current.selectedOption === optionIndex) {
        delete current.selectedOption;
    } else {
        current.selectedOption = optionIndex;
    }
    newNawafilData[prayerName] = current;
    saveData({ nawafilData: newNawafilData });
  };

  const updateQiyamCount = (prayerName: string, change: number) => {
    const newNawafilData = { ...dailyData.nawafilData };
    const current = newNawafilData[prayerName] || { count: 0 };
    let newCount = (current.count || 0) + change;
    if (newCount < 0) newCount = 0;
    if (newCount % 2 !== 0 && change > 0) newCount = newCount - 1;
    if (newCount % 2 !== 0 && change < 0) newCount = newCount + 1;
    current.count = newCount;
    newNawafilData[prayerName] = current;
    saveData({ nawafilData: newNawafilData });
  };
  
  const getAzkarProgress = (azkarName: string) => {
      const azkarProgressData = dailyData.azkarProgress[azkarName] || {};
      const azkarItems = AZKAR_DATA[azkarName] || [];
      if(azkarItems.length === 0) return 0;

      let totalCompleted = 0;
      let totalRequired = 0;

      azkarItems.forEach((item, index) => {
          const max = parseInt(item.repeat, 10) || 1;
          const current = Math.min(azkarProgressData[index] || 0, max);
          totalCompleted += current;
          totalRequired += max;
      });
      return totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0;
  };
  
  const incrementAzkarCount = (azkarName: string, azkarIndex: number) => {
    const newAzkarProgress = { ...dailyData.azkarProgress };
    if (!newAzkarProgress[azkarName]) newAzkarProgress[azkarName] = {};
    const currentCount = newAzkarProgress[azkarName][azkarIndex] || 0;
    const maxCount = parseInt(AZKAR_DATA[azkarName][azkarIndex].repeat, 10) || 1;
    if (currentCount < maxCount) {
        newAzkarProgress[azkarName][azkarIndex] = currentCount + 1;
        saveData({ azkarProgress: newAzkarProgress });

        const progress = getAzkarProgress(azkarName);
        if (progress >= 100) {
            const newStatus = { ...dailyData.azkarStatus, [azkarName]: true };
            saveData({ azkarProgress: newAzkarProgress, azkarStatus: newStatus });
        }
    }
  };

  const completeAzkarGroup = (azkarName: string) => {
      const newAzkarProgress = { ...dailyData.azkarProgress };
      const newGroupProgress: { [key: number]: number } = {};
      AZKAR_DATA[azkarName].forEach((item, index) => {
          newGroupProgress[index] = parseInt(item.repeat, 10) || 1;
      });
      newAzkarProgress[azkarName] = newGroupProgress;

      const newStatus = { ...dailyData.azkarStatus, [azkarName]: true };
      saveData({ azkarProgress: newAzkarProgress, azkarStatus: newStatus });
      const azkarType = AZKAR_TYPES.find(a => a.name === azkarName);
      showNotification(`تقبل الله ${azkarName}`, azkarType?.emoji || '📿');
  };

  const updateQuranRead = (change: number) => {
      const oldRead = dailyData.quranRead || 0;
      const newRead = Math.max(0, oldRead + change);
      saveData({ quranRead: newRead });
      
      const goal = settings.quranGoal || 10;
      if (oldRead < goal && newRead >= goal) {
          showNotification(`ما شاء الله! أتممت وردك اليومي`, '📖');
      }
  };

  const completeKhatma = () => {
      const newKhatmat = (dailyData.quranKhatmat || 0) + 1;
      saveData({ quranKhatmat: newKhatmat });
      showNotification(`مبارك الختمة الجديدة! جعلها الله شفيعة لك`, '🏆');
  };
  
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setDailyDua(DAILY_DUAS[dayOfYear % DAILY_DUAS.length]);
    setDailyWisdom(DAILY_WISDOMS[dayOfYear % DAILY_WISDOMS.length]);
    const timer = setInterval(() => setTodayKey(getDateKey()), 60000);
    return () => clearInterval(timer);
  }, []);

  const detectLocation = useCallback(() => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("خدمات الموقع غير مدعومة في هذا المتصفح. سيتم عرض مواقيت الصلاة للقاهرة.");
      setCoordinates(null);
      return;
    }
    
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        setLocationError("خدمات الموقع تتطلب اتصالاً آمناً (HTTPS) لتعمل بشكل صحيح. سيتم عرض مواقيت الصلاة للقاهرة.");
        setCoordinates(null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error: GeolocationPositionError) => {
          console.error(`Geolocation Error: Code=${error.code}, Message=${error.message}`);
          let errorMessage: string;
          switch (error.code) {
              case error.PERMISSION_DENIED:
                  errorMessage = "لقد رفضت الإذن بالوصول إلى الموقع. للحصول على أوقات دقيقة، يرجى تفعيل الإذن من إعدادات المتصفح وإعادة تحميل الصفحة.";
                  break;
              case error.POSITION_UNAVAILABLE:
                  errorMessage = "معلومات الموقع غير متاحة حاليًا. يرجى التأكد من تشغيل خدمات الموقع (GPS) والمحاولة مرة أخرى.";
                  break;
              case error.TIMEOUT:
                  errorMessage = "انتهت مهلة طلب الموقع. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
                  break;
              default:
                  errorMessage = `حدث خطأ غير متوقع. (${error.message})`;
                  break;
          }
          const finalMessage = `لم نتمكن من تحديد موقعك. ${errorMessage} سيتم الآن عرض مواقيت الصلاة للقاهرة.`;
          setLocationError(finalMessage);
          setCoordinates(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);


  useEffect(() => {
    const fetchPrayerTimes = async () => {
        const today = new Date();
        try {
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const dateForApi = `${day}-${month}-${year}`;

            let url = '';
            if (coordinates) {
                url = `https://api.aladhan.com/v1/timings/${dateForApi}?latitude=${coordinates.lat}&longitude=${coordinates.lon}&method=${settings.prayerMethod}`;
            } else {
                url = `https://api.aladhan.com/v1/timingsByCity?date=${dateForApi}&city=Cairo&country=Egypt&method=${settings.prayerMethod}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            if (data.data) {
                const times = data.data.timings;
                setPrayerTimes({
                    'الفجر': times.Fajr,
                    'الظهر': times.Dhuhr,
                    'العصر': times.Asr,
                    'المغرب': times.Maghrib,
                    'العشاء': times.Isha
                });
                const hijri = data.data.date.hijri;
                const gregorian = data.data.date.gregorian;

                // Long formats
                setHijriDate(`${hijri.day} ${hijri.month.ar}، ${hijri.year} هـ`);
                
                const dayOfWeek = hijri.weekday.ar;
                const [gDay, gMonth, gYear] = gregorian.date.split('-');
                const dateObj = new Date(Date.UTC(Number(gYear), Number(gMonth) - 1, Number(gDay)));

                const formattedGregorian = new Intl.DateTimeFormat('ar-SA-u-nu-latn', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC'
                }).format(dateObj);
                setGregorianDate(`${dayOfWeek}، ${formattedGregorian}`);

                // Short formats
                setShortHijriDate(`${hijri.day}/${hijri.month.number}/${hijri.year}`);
                setShortGregorianDate(`${gregorian.day}/${gregorian.month.number}/${gregorian.year}`);


                const hijriYear = hijri.year;
                const yearInfo = { year: hijriYear, length: 354 };
                setHijriYearInfo(yearInfo);

                const monthNumber = parseInt(hijri.month.number, 10);
                const monthInfo = HIJRI_MONTHS_INFO.find(m => m.number === monthNumber);
                if (monthInfo) {
                    const monthOccasions = ISLAMIC_OCCASIONS.filter(o => o.hijriMonth === monthNumber || o.isRecurring);
                    setCurrentHijriMonthInfo({ ...monthInfo, year: hijriYear, occasions: monthOccasions });
                }

                const currentHijriDay = parseInt(hijri.day, 10);
                const nextOccasion = ISLAMIC_OCCASIONS
                    .map(occ => {
                        const day = occ.isRecurring ? 13 : occ.hijriDay;
                        const month = occ.isRecurring ? (currentHijriDay > 15 ? monthNumber + 1 : monthNumber) : occ.hijriMonth;
                        return { ...occ, day, month };
                    })
                    .find(occ => occ.month > monthNumber || (occ.month === monthNumber && occ.day > currentHijriDay));
                setNextIslamicOccasion(nextOccasion || ISLAMIC_OCCASIONS[0]);

            }
        } catch (error) {
            console.error("Error fetching prayer times:", error);
        }
    };
    
    fetchPrayerTimes();
    
  }, [settings.prayerMethod, coordinates]);

  const nextPrayer = useMemo(() => {
    const now = new Date();
    let nextPrayer: Prayer | null = null;
    let nextTime: Date | null = null;
    let isNextDay = false;

    const sortedPrayers = PRAYERS.map(p => {
        const timeStr = prayerTimes[p.name];
        if (!timeStr) return null;
        const [h, m] = timeStr.split(':').map(Number);
        return { prayer: p, time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m) };
    }).filter(p => p !== null) as { prayer: Prayer, time: Date }[];

    if(sortedPrayers.length === 0) return { prayer: null, countdown: '00:00:00', isNextDay: false };

    for (const p of sortedPrayers) {
        if (p.time > now) {
            nextPrayer = p.prayer;
            nextTime = p.time;
            break;
        }
    }
    if (!nextPrayer) {
        nextPrayer = sortedPrayers[0].prayer;
        nextTime = new Date(sortedPrayers[0].time);
        nextTime.setDate(nextTime.getDate() + 1);
        isNextDay = true;
    }

    const diff = nextTime.getTime() - now.getTime();
    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    
    return { prayer: nextPrayer, countdown: `${hours}:${minutes}:${seconds}`, isNextDay };
  }, [prayerTimes, todayKey]);

  const stats = useMemo(() => calculateStats(appData), [appData]);

  const weeklyPrayerCounts = useMemo(() => {
    const orderedCounts: { day: string; count: number; }[] = [];
    const today = new Date();
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayKey = getDateKey(date);
        const dayName = dayNames[date.getDay()];
        
        const dayData = appData[dayKey];
        let prayerCount = 0;
        if (dayData && dayData.prayerData) {
            prayerCount = Object.values(dayData.prayerData).filter((p: PrayerStatus) => p.fard === 'early' || p.fard === 'ontime').length;
        }
        
        orderedCounts.push({ day: i === 0 ? 'اليوم' : dayName, count: prayerCount });
    }

    return orderedCounts;
  }, [appData]);

    useEffect(() => {
        const checkNotifications = () => {
            const now = new Date();
            const currentDayKey = getDateKey(now);
    
            if (!shownNotificationsRef.current.has(`reset_${currentDayKey}`)) {
                shownNotificationsRef.current.clear();
                shownNotificationsRef.current.add(`reset_${currentDayKey}`);
            }

            if (settings.notifications.prayers) {
                for (const prayer of PRAYERS) {
                    const prayerTimeStr = prayerTimes[prayer.name];
                    const notificationKey = `${currentDayKey}_${prayer.name}`;
                    if (prayerTimeStr && !shownNotificationsRef.current.has(notificationKey)) {
                        const [h, m] = prayerTimeStr.split(':').map(Number);
                        const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
                        const diffMinutes = (prayerTime.getTime() - now.getTime()) / (1000 * 60);
    
                        if (diffMinutes > 0 && diffMinutes <= 10) {
                            showNotification(`🕌 تستعد لصلاة ${prayer.name} بعد 10 دقائق`, prayer.emoji);
                            shownNotificationsRef.current.add(notificationKey);
                        }
                    }
                }
            }
    
            if (settings.notifications.azkar) {
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                const [morningStartHour, morningStartMinute] = settings.azkarMorningStart.split(':').map(Number);
                const morningKey = `${currentDayKey}_morning_azkar`;
                if (currentHour === morningStartHour && currentMinute === morningStartMinute && !shownNotificationsRef.current.has(morningKey)) {
                    showNotification('🌅 حان وقت أذكار الصباح', '🌅');
                    shownNotificationsRef.current.add(morningKey);
                }

                const [eveningStartHour, eveningStartMinute] = settings.azkarEveningStart.split(':').map(Number);
                const eveningKey = `${currentDayKey}_evening_azkar`;
                 if (currentHour === eveningStartHour && currentMinute === eveningStartMinute && !shownNotificationsRef.current.has(eveningKey)) {
                    showNotification('🌆 حان وقت أذكار المساء', '🌆');
                    shownNotificationsRef.current.add(eveningKey);
                }
            }
        };
    
        const intervalId = setInterval(checkNotifications, 60 * 1000);
    
        return () => clearInterval(intervalId);
    }, [prayerTimes, settings.notifications, settings.azkarMorningStart, settings.azkarEveningStart, showNotification]);

  return {
    dailyData,
    settings,
    isDataLoading,
    dataError,
    prayerTimes,
    updatePrayerStatus,
    updateSunnahStatus,
    updateNawafilOption,
    updateQiyamCount,
    getAzkarProgress,
    incrementAzkarCount,
    completeAzkarGroup,
    updateQuranRead,
    completeKhatma,
    updateSettings,
    hijriDate,
    gregorianDate,
    shortHijriDate,
    shortGregorianDate,
    dailyDua,
    nextPrayer,
    stats,
    weeklyPrayerCounts,
    resetAllData,
    dailyWisdom,
    hijriYearInfo,
    currentHijriMonthInfo,
    nextIslamicOccasion,
    coordinates,
    locationError,
    detectLocation,
    notification,
    showNotification,
    // Goals
    personalGoals,
    goalProgress,
    addPersonalGoal,
    updatePersonalGoal,
    archivePersonalGoal,
    updateTargetGoalProgress,
    toggleDailyGoalCompletion,
    deletePersonalGoal
  };
};