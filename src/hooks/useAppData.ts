import { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { AppData, DailyData, PrayerFardStatus, Settings, Prayer, UserStats, UserChallenge, CommunityUser, Group, Invitation, GroupSharingSettings, GroupType, GroupActivity, IslamicOccasion, HijriMonthInfo, Wisdom, HijriYearInfo, Friend } from '../types.ts';
import { PRAYERS, AZKAR_DATA, DAILY_DUAS, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, DAILY_WISDOMS } from '../constants.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { calculateStats, calculateUserChallenges, getMaxCount } from '../utils.ts';
import { supabase, Json, Database } from '../supabase.ts';

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
    quranKhatmat: 0
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

export const useAppData = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  const isGuest = user?.id === 'guest';

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

  // Location State
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Notification State
  const [notification, setNotification] = useState<{ message: string; icon: string } | null>(null);
  const notificationTimeoutRef = useRef<number | null>(null);
  const shownNotificationsRef = useRef<Set<string>>(new Set());

  // Community State
  const [isCommunityLoading, setIsCommunityLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [discoverableUsers, setDiscoverableUsers] = useState<CommunityUser[]>([]);
  const [sharingSettings, setSharingSettings] = useState<Record<string, GroupSharingSettings>>({});


  const loadEssentialData = useCallback(async () => {
    if (!user || isGuest) {
        setIsDataLoading(false);
        return;
    }
    setIsDataLoading(true);
    setDataError(null);

    try {
        const { data: userData, error: userDataError } = await supabase
            .from('user_data')
            .select('settings, app_data')
            .eq('user_id', user.id)
            .single();
        
        if (userDataError && userDataError.code !== 'PGRST116') {
            throw new Error(`خطأ في تحميل بيانات المستخدم: ${userDataError.message}`);
        }

        if (userData) {
            setSettings(userData.settings ? { ...defaultSettings, ...(userData.settings as unknown as Settings) } : defaultSettings);
            setAppData((userData.app_data as unknown as AppData) || {});
        } else {
            setSettings(defaultSettings);
            setAppData({});
        }
    } catch (error: any) {
        console.error("CRITICAL ERROR loading essential user data:", error);
        setDataError(`فشل تحميل بياناتك. قد تكون هناك مشكلة في إعداد قاعدة البيانات أو في الاتصال. يرجى التأكد من تشغيل النص البرمجي (SQL) بشكل صحيح في لوحة تحكم Supabase والمحاولة مرة أخرى.\n${error.message}`);
    } finally {
        setIsDataLoading(false);
    }
  }, [user, isGuest]);

  const loadCommunityData = useCallback(async () => {
    if (!user || isGuest) {
        setIsCommunityLoading(false);
        return;
    }
    setIsCommunityLoading(true);
    try {
        const [groupsRes, friendsRes, usersRes, invitesRes] = await Promise.all([
            supabase.rpc('get_user_groups'),
            supabase.rpc('get_user_friends'),
            supabase.rpc('get_discoverable_users'),
            supabase.rpc('get_user_invitations')
        ]);

        if (groupsRes.error) throw new Error(`خطأ في تحميل المجموعات: ${groupsRes.error.message}`);
        setGroups((groupsRes.data as unknown as Group[]) || []);

        if (friendsRes.error) throw new Error(`خطأ في تحميل الأصدقاء: ${friendsRes.error.message}`);
        const allFriendships = (friendsRes.data as unknown as Friend[]) || [];
        setFriends(allFriendships.filter(f => f.status === 'accepted'));
        setFriendRequests(allFriendships.filter(f => f.status === 'pending' && f.action_by_user_id !== user.id));

        if (usersRes.error) throw new Error(`خطأ في تحميل المستخدمين: ${usersRes.error.message}`);
        setDiscoverableUsers((usersRes.data as unknown as CommunityUser[]) || []);

        if (invitesRes.error) throw new Error(`خطأ في تحميل الدعوات: ${invitesRes.error.message}`);
        setInvitations((invitesRes.data as unknown as Invitation[]) || []);

    } catch (error: any) {
        console.error("Error loading community data:", error);
        // This is a non-critical error, so we don't set the main dataError state.
        // The community pages can handle the lack of data gracefully.
    } finally {
        setIsCommunityLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadEssentialData();
    loadCommunityData();
  }, [user, loadEssentialData, loadCommunityData]);

  const dailyData = useMemo(() => {
    return appData[todayKey] ? { ...defaultDailyData, ...appData[todayKey] } : defaultDailyData;
  }, [appData, todayKey]);


  const saveData = useCallback(async (newDailyData: Partial<DailyData>) => {
    const newAppData = {
        ...appData,
        [todayKey]: {
            ...(appData[todayKey] || defaultDailyData),
            ...newDailyData
        }
    };
    setAppData(newAppData);

    if (!user || isGuest) return;

    const upsertData: Database['public']['Tables']['user_data']['Insert'] = {
      user_id: user.id,
      app_data: newAppData as Json,
    };
    const { error } = await supabase
        .from('user_data')
        .upsert(upsertData);
    
    if (error) {
        console.error("Error saving app data:", error);
    }
  }, [user, appData, todayKey, isGuest]);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if(!user || isGuest) return;
    
    const upsertSettings: Database['public']['Tables']['user_data']['Insert'] = {
      user_id: user.id,
      settings: updatedSettings as unknown as Json,
    };
    const { error } = await supabase
        .from('user_data')
        .upsert(upsertSettings);
    
    if (error) {
        console.error("Error saving settings:", error);
    }
  }, [user, settings, isGuest]);

  const resetAllData = async () => {
      if(!user || isGuest) {
          alert("لا يمكن إعادة تعيين البيانات في وضع الضيف.");
          return;
      }
      if (!window.confirm("⚠️ تحذير! هل أنت متأكد من أنك تريد مسح جميع بياناتك؟ لا يمكن التراجع عن هذا الإجراء.")) return;

      const resetPayload: Database['public']['Tables']['user_data']['Insert'] = {
        user_id: user.id,
        app_data: {},
        settings: defaultSettings as unknown as Json,
      };
      const { error } = await supabase
        .from('user_data')
        .upsert(resetPayload);
        
      if (error) {
          alert("حدث خطأ أثناء مسح البيانات.");
          console.error("Reset error:", error);
      } else {
          setAppData({});
          setSettings(defaultSettings);
          alert("تم مسح البيانات بنجاح.");
      }
  };
  
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
          const max = getMaxCount(item.repeat);
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
    const maxCount = getMaxCount(AZKAR_DATA[azkarName][azkarIndex].repeat);
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
          newGroupProgress[index] = getMaxCount(item.repeat);
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error: GeolocationPositionError) => {
            console.error("Geolocation error object:", error);
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
                    errorMessage = `حدث خطأ غير متوقع: ${error.message}`;
                    break;
            }
            const finalMessage = `لم نتمكن من تحديد موقعك. ${errorMessage} سيتم الآن عرض مواقيت الصلاة للقاهرة.`;
            setLocationError(finalMessage);
            setCoordinates(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // 15 seconds
          maximumAge: 60000 // Accept a cached position up to 1 minute old
        }
      );
    } else {
      setLocationError("خدمات الموقع غير مدعومة في هذا المتصفح. سيتم عرض مواقيت الصلاة للقاهرة.");
      setCoordinates(null);
    }
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
    const counts = [];
    const today = new Date();
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayKey = getDateKey(date);
        const dayIndex = date.getDay();
        const dayName = dayNames[dayIndex];
        
        const dayData = appData[dayKey];
        let prayerCount = 0;
        if (dayData && dayData.prayerData) {
            prayerCount = Object.values(dayData.prayerData).filter(p => p.fard === 'early' || p.fard === 'ontime').length;
        }
        
        counts.push({ day: dayName, count: prayerCount });
    }
    
    // Rotate array to start with today
    const todayIndex = new Date().getDay();
    const rotatedDayNames = [...dayNames.slice(todayIndex + 1), ...dayNames.slice(0, todayIndex + 1)];
    
    // This logic is a bit complex, let's simplify and just return the last 7 days in order
    const orderedCounts = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(new Date().getDate() - i);
        const dayKey = getDateKey(date);
        const dayName = dayNames[date.getDay()];
        const dayData = appData[dayKey];
        let prayerCount = 0;
        if (dayData && dayData.prayerData) {
            prayerCount = Object.values(dayData.prayerData).filter(p => p.fard === 'early' || p.fard === 'ontime').length;
        }
        orderedCounts.push({ day: i === 0 ? 'اليوم' : dayName, count: prayerCount });
    }

    return orderedCounts;
  }, [appData]);

    // --- NOTIFICATION LOGIC ---
    const showNotification = useCallback((message: string, icon: string) => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, icon });
        notificationTimeoutRef.current = window.setTimeout(() => {
            setNotification(null);
        }, 5000); // Disappears after 5 seconds
    }, []);

    useEffect(() => {
        const checkNotifications = () => {
            const now = new Date();
            const currentDayKey = getDateKey(now);
    
            // Reset shown notifications at midnight
            if (!shownNotificationsRef.current.has(`reset_${currentDayKey}`)) {
                shownNotificationsRef.current.clear();
                shownNotificationsRef.current.add(`reset_${currentDayKey}`);
            }

            // Prayer Notifications
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
    
            // Azkar Notifications
            if (settings.notifications.azkar) {
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                // Morning Azkar
                const [morningStartHour, morningStartMinute] = settings.azkarMorningStart.split(':').map(Number);
                const morningKey = `${currentDayKey}_morning_azkar`;
                if (currentHour === morningStartHour && currentMinute === morningStartMinute && !shownNotificationsRef.current.has(morningKey)) {
                    showNotification('🌅 حان وقت أذكار الصباح', '🌅');
                    shownNotificationsRef.current.add(morningKey);
                }

                // Evening Azkar
                const [eveningStartHour, eveningStartMinute] = settings.azkarEveningStart.split(':').map(Number);
                const eveningKey = `${currentDayKey}_evening_azkar`;
                 if (currentHour === eveningStartHour && currentMinute === eveningStartMinute && !shownNotificationsRef.current.has(eveningKey)) {
                    showNotification('🌆 حان وقت أذكار المساء', '🌆');
                    shownNotificationsRef.current.add(eveningKey);
                }
            }
        };
    
        const intervalId = setInterval(checkNotifications, 60 * 1000); // Check every minute
    
        return () => clearInterval(intervalId);
    }, [prayerTimes, settings.notifications, settings.azkarMorningStart, settings.azkarEveningStart, showNotification]);

  // --- COMMUNITY FEATURES ---
  
  const addFriend = async (friendId: string) => {
    if(!user || isGuest) return;
    const currentUserId = user.id;
    const [user_id_1, user_id_2] = [currentUserId, friendId].sort();

    const newFriendship: Database['public']['Tables']['friendships']['Insert'] = {
        user_id_1,
        user_id_2,
        status: 'pending',
        action_by_user_id: currentUserId
    };
    const { error } = await supabase.from('friendships').insert(newFriendship);

    if(error) {
        console.error("Error adding friend:", error);
        alert("حدث خطأ أثناء إرسال طلب الصداقة.");
    } else {
        alert("تم إرسال طلب الصداقة بنجاح.");
        loadCommunityData();
    }
  };

  const respondToFriendRequest = async (friendId: string, response: 'accepted' | 'declined') => {
    if (!user || isGuest) return;
    const currentUserId = user.id;
    const [user_id_1, user_id_2] = [currentUserId, friendId].sort();

    if (response === 'accepted') {
        const updatePayload: Database['public']['Tables']['friendships']['Update'] = { 
            status: 'accepted', 
            action_by_user_id: currentUserId 
        };
        const { error } = await supabase.from('friendships')
            .update(updatePayload)
            .eq('user_id_1', user_id_1)
            .eq('user_id_2', user_id_2);
        if (error) {
            alert("حدث خطأ أثناء قبول الصداقة.");
        } else {
            alert("تم قبول الصداقة بنجاح!");
        }
    } else { // declined
        const { error } = await supabase.from('friendships')
            .delete()
            .eq('user_id_1', user_id_1)
            .eq('user_id_2', user_id_2);
        if(error) alert("حدث خطأ أثناء رفض الطلب.");
    }
    loadCommunityData();
  };

  const createGroup = async (name: string, type: GroupType, memberIds: string[]) => {
      if(!user || isGuest) return;
      
      const newGroup: Database['public']['Tables']['groups']['Insert'] = {
        name,
        type,
        created_by: user.id,
      };
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert(newGroup)
        .select()
        .single();
      
      if(groupError || !groupData) {
          console.error("Error creating group:", groupError);
          alert("حدث خطأ أثناء إنشاء المجموعة.");
          return;
      }
      
      const creatorAsMember: Database['public']['Tables']['group_members']['Insert'] = {
        group_id: groupData.id,
        user_id: user.id,
      };
      const { error: creatorError } = await supabase.from('group_members').insert(creatorAsMember);
      if(creatorError) {
          console.error("Critical: Could not add creator to group", creatorError);
      }

      const invitationsToInsert: Database['public']['Tables']['group_invitations']['Insert'][] = memberIds.map(memberId => ({
          group_id: groupData.id,
          inviter_id: user.id,
          invitee_id: memberId,
          status: 'pending'
      }));

      if(invitationsToInsert.length > 0) {
        const { error: invitesError } = await supabase.from('group_invitations').insert(invitationsToInsert);
        if(invitesError) {
            alert("تم إنشاء المجموعة، ولكن حدث خطأ أثناء إرسال الدعوات.");
        } else {
            alert(`تم إنشاء مجموعة "${name}" وإرسال الدعوات بنجاح.`);
        }
      } else {
         alert(`تم إنشاء مجموعة "${name}" بنجاح.`);
      }
      
      loadCommunityData();
  };
  
  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
      if(!user || isGuest) return;
      const invitation = invitations.find(inv => inv.id === invitationId);
      if(!invitation) return;

      const updatePayload: Database['public']['Tables']['group_invitations']['Update'] = {
        status: response,
      };
      const { error: updateError } = await supabase.from('group_invitations')
        .update(updatePayload)
        .eq('id', invitationId);

      if(updateError) {
          alert("حدث خطأ أثناء الرد على الدعوة.");
          console.error(updateError);
          return;
      }
      
      if(response === 'accepted') {
          const newMember: Database['public']['Tables']['group_members']['Insert'] = {
              group_id: invitation.group_id,
              user_id: user.id
          };
          const { error: insertError } = await supabase.from('group_members').insert(newMember);
          if(insertError) {
              alert("تم قبول الدعوة، ولكن حدث خطأ أثناء الانضمام للمجموعة.");
              console.error(insertError);
          } else {
              alert("انضممت للمجموعة بنجاح!");
          }
      }

      loadCommunityData();
  };
  
  const updateSharingSettings = async (groupId: string, newSettings: GroupSharingSettings) => {
      if(!user || isGuest) return;
      const settingsUpdate: Database['public']['Tables']['group_members']['Update'] = {
        sharing_settings: newSettings as unknown as Json,
      };
      const { error } = await supabase
        .from('group_members')
        .update(settingsUpdate)
        .eq('group_id', groupId)
        .eq('user_id', user.id);
        
      if(error) {
        console.error("Error updating settings:", error);
        alert("حدث خطأ أثناء تحديث الإعدادات.");
      } else {
        alert("تم تحديث إعدادات المشاركة.");
        // We might need a more robust way to update local state here
        loadCommunityData();
      }
  };
  
  const getGroupFeed = async (group: Group): Promise<GroupActivity[]> => {
      if(isGuest) return [];
      const { data, error } = await supabase
        .from('group_activity')
        .select(`id, message, icon, created_at, user:profiles (id, name, picture)`)
        .eq('group_id', group.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching group feed:", error);
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        message: item.message,
        icon: item.icon,
        timestamp: new Date(item.created_at),
        user: item.user,
        groupId: group.id
    }));
  };

  const getSharedUserData = async (userId: string, groupId: string): Promise<AppData | null> => {
    if(isGuest) return null;
    const { data, error } = await supabase.rpc('get_shared_user_data', {
      target_user_id: userId,
      group_id_context: groupId
    });
    if (error) {
      console.error(`Error fetching shared data for user ${userId}:`, error);
      return null;
    }
    return data as unknown as AppData | null;
  };

  const getGroupMemberStats = async (userId: string, groupId: string): Promise<UserStats | null> => {
    if(isGuest) return null;
    const memberAppData = await getSharedUserData(userId, groupId);
    if (!memberAppData) return null; // User has disabled sharing
    return calculateStats(memberAppData);
  };

  const getGroupMemberChallenges = async (userId: string, groupId: string): Promise<UserChallenge[] | null> => {
    if(isGuest) return null;
    const memberAppData = await getSharedUserData(userId, groupId);
    if (!memberAppData) return null; // User has disabled sharing
    return calculateUserChallenges(memberAppData);
  };


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
    isCommunityLoading,
    friends,
    friendRequests,
    groups,
    invitations,
    discoverableUsers,
    sharingSettings,
    addFriend,
    respondToFriendRequest,
    createGroup,
    respondToInvitation,
    updateSharingSettings,
    getGroupFeed,
    getGroupMemberStats,
    getGroupMemberChallenges
  };
};