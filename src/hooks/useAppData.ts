import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AppData, DailyData, PrayerFardStatus, Settings, Prayer, UserStats, IslamicOccasion, HijriMonthInfo, Wisdom, HijriYearInfo, PrayerStatus, PersonalGoal, GoalProgress } from '../types';
import { PRAYERS, AZKAR_DATA, DAILY_DUAS, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, DAILY_WISDOMS } from '../constants';
import { calculateStats } from '../utils';

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

const APP_DATA_KEY = 'mahyay_appData';
const SETTINGS_KEY = 'mahyay_settings';
const PERSONAL_GOALS_KEY = 'mahyay_personalGoals';
const GOAL_PROGRESS_KEY = 'mahyay_goalProgress';


export const useAppData = () => {
  const [appData, setAppData] = useState<AppData>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [todayKey, setTodayKey] = useState(getDateKey());
  
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [dailyDua, setDailyDua] = useState(DAILY_DUAS[0]);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  const [dailyWisdom, setDailyWisdom] = useState<Wisdom | null>(null);
  const [hijriYearInfo, setHijriYearInfo] = useState<HijriYearInfo | null>(null);
  const [currentHijriMonthInfo, setCurrentHijriMonthInfo] = useState<HijriMonthInfo | null>(null);
  const [nextIslamicOccasion, setNextIslamicOccasion] = useState<IslamicOccasion | null>(null);

  // Goals State
  const [personalGoals, setPersonalGoals] = useState<PersonalGoal[]>([]);
  const [goalProgress, setGoalProgress] = useState<GoalProgress>({});

  // Location State
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsDataLoading(true);
    setDataError(null);
    try {
        const storedAppData = localStorage.getItem(APP_DATA_KEY);
        const storedSettings = localStorage.getItem(SETTINGS_KEY);
        const storedGoals = localStorage.getItem(PERSONAL_GOALS_KEY);
        const storedGoalProgress = localStorage.getItem(GOAL_PROGRESS_KEY);

        if (storedAppData) setAppData(JSON.parse(storedAppData));
        if (storedSettings) setSettings(JSON.parse(storedSettings));
        if (storedGoals) setPersonalGoals(JSON.parse(storedGoals));
        if (storedGoalProgress) setGoalProgress(JSON.parse(storedGoalProgress));

    } catch (error) {
        console.error("Error loading data from localStorage:", error);
        setDataError("فشل تحميل بياناتك من المتصفح. قد تكون البيانات تالفة.");
    } finally {
        setIsDataLoading(false);
    }
  }, []);

  const dailyData = useMemo(() => {
    const dataForToday = appData[todayKey];
    return { ...defaultDailyData, ...dataForToday };
  }, [appData, todayKey]);


  const saveData = useCallback((newDailyData: Partial<DailyData>) => {
    setAppData(prevAppData => {
        const currentDailyData = prevAppData[todayKey] || defaultDailyData;
        const updatedDailyData = { ...currentDailyData, ...newDailyData };
         if (!updatedDailyData.dailyGoalProgress) {
            updatedDailyData.dailyGoalProgress = {};
        }
        const newAppData = {
            ...prevAppData,
            [todayKey]: updatedDailyData
        };
        localStorage.setItem(APP_DATA_KEY, JSON.stringify(newAppData));
        return newAppData;
    });
  }, [todayKey]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prevSettings => {
        const updatedSettings = { ...prevSettings, ...newSettings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
        return updatedSettings;
    });
  }, []);

  const resetAllData = async () => {
      if (!window.confirm("⚠️ تحذير! هل أنت متأكد من أنك تريد مسح جميع بيانات العبادة والأهداف؟ لا يمكن التراجع عن هذا الإجراء.")) return;
      
      localStorage.removeItem(APP_DATA_KEY);
      localStorage.removeItem(PERSONAL_GOALS_KEY);
      localStorage.removeItem(GOAL_PROGRESS_KEY);
      setAppData({});
      setPersonalGoals([]);
      setGoalProgress({});

      alert("تم مسح بيانات العبادة والأهداف بنجاح.");
  };

  // --- GOALS MANAGEMENT ---
    const saveGoals = useCallback((goals: PersonalGoal[]) => {
      setPersonalGoals(goals);
      localStorage.setItem(PERSONAL_GOALS_KEY, JSON.stringify(goals));
    }, []);

    const saveGoalProgress = useCallback((progress: GoalProgress) => {
        setGoalProgress(progress);
        localStorage.setItem(GOAL_PROGRESS_KEY, JSON.stringify(progress));
    }, []);

    const addPersonalGoal = (goal: Omit<PersonalGoal, 'id' | 'createdAt' | 'isArchived' | 'completedAt'>) => {
        const newGoal: PersonalGoal = {
            ...goal,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            isArchived: false,
        };
        const updatedGoals = [...personalGoals, newGoal];
        saveGoals(updatedGoals);
        if (newGoal.type === 'target' && goalProgress[newGoal.id] === undefined) {
            const newProgress = {...goalProgress, [newGoal.id]: 0};
            saveGoalProgress(newProgress);
        }
    };

    const updatePersonalGoal = (goalId: string, updates: Partial<PersonalGoal>) => {
        const updatedGoals = personalGoals.map(g => g.id === goalId ? { ...g, ...updates } : g);
        saveGoals(updatedGoals);
    };
    
    const archivePersonalGoal = (goalId: string) => {
        updatePersonalGoal(goalId, { isArchived: true });
    };

    const deletePersonalGoal = (goalId: string) => {
        const updatedGoals = personalGoals.filter(g => g.id !== goalId);
        const newProgress = { ...goalProgress };
        delete newProgress[goalId];
        saveGoals(updatedGoals);
        saveGoalProgress(newProgress);
    };
  
    const updateTargetGoalProgress = (goalId: string, newValue: number) => {
        const goal = personalGoals.find(g => g.id === goalId);
        if (!goal) return;
        const cappedValue = Math.max(0, Math.min(newValue, goal.target));
        const newProgress = { ...goalProgress, [goalId]: cappedValue };

        if (cappedValue >= goal.target && !goal.completedAt) {
            updatePersonalGoal(goalId, { completedAt: new Date().toISOString() });
        } else if (cappedValue < goal.target && goal.completedAt) {
            updatePersonalGoal(goalId, { completedAt: undefined });
        }
        saveGoalProgress(newProgress);
    };

    const toggleDailyGoalCompletion = (goalId: string) => {
        const currentStatus = dailyData.dailyGoalProgress[goalId] || false;
        const newDailyGoalProgress = { ...dailyData.dailyGoalProgress, [goalId]: !currentStatus };
        saveData({ dailyGoalProgress: newDailyGoalProgress });
    };

  // --- END GOALS MANAGEMENT ---
  
  const updatePrayerStatus = (prayerName: string, status: PrayerFardStatus) => {
    const newPrayerData = { ...dailyData.prayerData };
    newPrayerData[prayerName].fard = status;
    saveData({ prayerData: newPrayerData });
  };
  
  const updateSunnahStatus = (prayerName: string, sunnahType: 'sunnahBefore' | 'sunnahAfter') => {
    const newPrayerData = { ...dailyData.prayerData };
    newPrayerData[prayerName][sunnahType] = !newPrayerData[prayerName][sunnahType];
    saveData({ prayerData: newPrayerData });
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
  };

  const updateQuranRead = (change: number) => {
      const newRead = Math.max(0, (dailyData.quranRead || 0) + change);
      saveData({ quranRead: newRead });
  };

  const completeKhatma = () => {
      const newKhatmat = (dailyData.quranKhatmat || 0) + 1;
      saveData({ quranKhatmat: newKhatmat });
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
    
    // Geolocation API is often restricted to secure contexts (HTTPS).
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
        setLocationError(null); // Clear previous errors on success
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
                setHijriDate(`${hijri.day} ${hijri.month.ar}, ${hijri.year} هـ`);
                setGregorianDate(data.data.date.gregorian.date);
                
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

    const showNotification = useCallback((message: string, icon: string) => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, icon });
        notificationTimeoutRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 5000);
    }, []);

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