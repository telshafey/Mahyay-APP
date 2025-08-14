import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { AppData, DailyData, PrayerFardStatus, Settings, Prayer, PrayerStatus, UserStats, UserChallenge, CommunityUser, Group, Invitation, GroupSharingSettings, GroupType, GroupActivity, IslamicOccasion, HijriMonthInfo, Wisdom, HijriYearInfo } from '../types.ts';
import { PRAYERS, AZKAR_DATA, DAILY_DUAS, ISLAMIC_OCCASIONS, HIJRI_MONTHS_INFO, DAILY_WISDOMS } from '../constants.ts';
import { AuthContext } from '../contexts/AuthContext.tsx';
import { getMaxCount } from '../utils.ts';

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
};

export const useAppData = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const [appData, setAppData] = useState<AppData>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [todayKey, setTodayKey] = useState(getDateKey());
  const [hijriDate, setHijriDate] = useState('');
  const [gregorianDate, setGregorianDate] = useState('');
  const [dailyDua, setDailyDua] = useState(DAILY_DUAS[0]);
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string>>({});
  
  // New States
  const [dailyWisdom, setDailyWisdom] = useState<Wisdom | null>(null);
  const [hijriYearInfo, setHijriYearInfo] = useState<HijriYearInfo | null>(null);

  // Islamic Calendar State
  const [currentHijriMonthInfo, setCurrentHijriMonthInfo] = useState<HijriMonthInfo | null>(null);
  const [nextIslamicOccasion, setNextIslamicOccasion] = useState<IslamicOccasion | null>(null);

  // Community State
  const [friends, setFriends] = useState<CommunityUser[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sharingSettings, setSharingSettings] = useState<Record<string, GroupSharingSettings>>({});

  const getStorageKeys = useCallback(() => {
    const userId = user?.id;
    if (!userId) return null;

    return {
        appDataKey: `mahyayi_appData_${userId}`,
        settingsKey: `mahyayi_settings_${userId}`,
        friendsKey: `mahyayi_friends_${userId}`,
        groupsKey: `mahyayi_groups_${userId}`,
        invitationsKey: `mahyayi_invitations_${userId}`,
        sharingSettingsKey: `mahyayi_sharing_${userId}`,
    };
  }, [user]);

  const loadAllUserData = useCallback(() => {
    const keys = getStorageKeys();
    if (!user || !keys) {
        setAppData({});
        setSettings(defaultSettings);
        setFriends([]);
        setGroups([]);
        setInvitations([]);
        setSharingSettings({});
        return;
    };
    
    // Load App Data
    const storedAppData = localStorage.getItem(keys.appDataKey);
    setAppData(storedAppData ? JSON.parse(storedAppData) : {});
    
    // Load Settings
    const storedSettings = localStorage.getItem(keys.settingsKey);
    setSettings(storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : defaultSettings);

    // Load Community Data
    const storedFriends = localStorage.getItem(keys.friendsKey);
    setFriends(storedFriends ? JSON.parse(storedFriends) : []);

    const storedGroups = localStorage.getItem(keys.groupsKey);
    setGroups(storedGroups ? JSON.parse(storedGroups) : []);

    const storedInvitations = localStorage.getItem(keys.invitationsKey);
    setInvitations(storedInvitations ? JSON.parse(storedInvitations) : []);
    
    const storedSharingSettings = localStorage.getItem(keys.sharingSettingsKey);
    setSharingSettings(storedSharingSettings ? JSON.parse(storedSharingSettings) : {});

  }, [user, getStorageKeys]);


  useEffect(() => {
    loadAllUserData();
    
    const interval = setInterval(() => {
        setTodayKey(getDateKey());
    }, 60000);

    return () => clearInterval(interval);
  }, [user, loadAllUserData]);

  const dailyData = appData[todayKey] ? { ...defaultDailyData, ...appData[todayKey] } : defaultDailyData;

  const saveData = useCallback((newDailyData: Partial<DailyData>) => {
    const keys = getStorageKeys();
    if(!user || !keys) return;

    setAppData(prev => {
        const updatedData = {
            ...prev,
            [todayKey]: {
                ...(prev[todayKey] || defaultDailyData),
                ...newDailyData
            }
        };
        localStorage.setItem(keys.appDataKey, JSON.stringify(updatedData));
        return updatedData;
    });
  }, [todayKey, user, getStorageKeys]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    const keys = getStorageKeys();
    if(!user || !keys) return;

    setSettings(prev => {
        const updatedSettings = { ...prev, ...newSettings };
        localStorage.setItem(keys.settingsKey, JSON.stringify(updatedSettings));
        return updatedSettings;
    });
  }, [user, getStorageKeys]);

  const resetAllData = () => {
      const keys = getStorageKeys();
      if(!user || !keys) return;
      Object.values(keys).forEach(key => localStorage.removeItem(key as string));
      loadAllUserData();
  };
  
  // Prayer, Azkar, Quran logic (unchanged)
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
    const fetchDatesAndTimes = async () => {
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        // Set Daily Dua
        const duaIndex = dayOfYear % DAILY_DUAS.length;
        setDailyDua(DAILY_DUAS[duaIndex]);

        // Fetch Hijri/Gregorian Date & Islamic Occasions
        try {
            const todayStr = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');
            const response = await fetch(`https://api.aladhan.com/v1/gToH?date=${todayStr.split('-').reverse().join('-')}`);
            if (!response.ok) throw new Error("API call failed");
            const data = await response.json();
            if (data.code === 200) {
                const hijri = data.data.hijri;
                const hijriDay = parseInt(hijri.day, 10);
                const hijriMonth = hijri.month.number;
                const monthInfo = HIJRI_MONTHS_INFO.find(m => m.number === hijriMonth);

                setHijriDate(`${hijri.weekday.ar} ${hijri.day} ${hijri.month.ar} ${hijri.year}`);
                setHijriYearInfo({ year: hijri.year, length: 354 }); // Approximation
                
                // Smart Daily Wisdom Selection
                const useMonthlyWisdom = (dayOfYear % 10) < 3; // ~30% chance
                const monthlyWisdoms = monthInfo?.wisdoms;
                let selectedWisdom: Wisdom | null = null;
                
                if (useMonthlyWisdom && monthlyWisdoms && monthlyWisdoms.length > 0) {
                    selectedWisdom = monthlyWisdoms[dayOfYear % monthlyWisdoms.length];
                } else {
                    selectedWisdom = DAILY_WISDOMS[dayOfYear % DAILY_WISDOMS.length];
                }
                setDailyWisdom(selectedWisdom);

                // Set Current Month Info
                const whiteDays: IslamicOccasion = ISLAMIC_OCCASIONS.find(o => o.isRecurring)!;
                const monthlyOccasions = ISLAMIC_OCCASIONS.filter(o => !o.isRecurring && o.hijriMonth === hijriMonth);
                if (hijriDay < whiteDays.hijriDay) {
                    monthlyOccasions.push({...whiteDays, hijriMonth: hijriMonth});
                }
                setCurrentHijriMonthInfo({
                    name: hijri.month.ar,
                    number: hijriMonth,
                    year: hijri.year,
                    definition: monthInfo ? monthInfo.definition : '',
                    wisdoms: monthInfo?.wisdoms || [],
                    occasions: monthlyOccasions.sort((a,b) => a.hijriDay - b.hijriDay),
                });

                // Find Next Islamic Occasion
                let upcoming = ISLAMIC_OCCASIONS.filter(o => !o.isRecurring).find(o => 
                    o.hijriMonth > hijriMonth || (o.hijriMonth === hijriMonth && o.hijriDay > hijriDay)
                );
                 if (!upcoming) {
                    upcoming = ISLAMIC_OCCASIONS.find(o => !o.isRecurring); // Wrap to next year
                }

                // Check for this month's white days
                if(hijriDay < whiteDays.hijriDay) {
                    const thisMonthWhiteDays = {...whiteDays, hijriMonth: hijriMonth};
                    if (!upcoming || thisMonthWhiteDays.hijriMonth < upcoming.hijriMonth || (thisMonthWhiteDays.hijriMonth === upcoming.hijriMonth && thisMonthWhiteDays.hijriDay < upcoming.hijriDay)) {
                        upcoming = thisMonthWhiteDays
                    }
                } else { // Check for next month's white days
                     const nextMonth = hijriMonth === 12 ? 1 : hijriMonth + 1;
                     const nextMonthWhiteDays = {...whiteDays, hijriMonth: nextMonth};
                     if (!upcoming || nextMonthWhiteDays.hijriMonth < upcoming.hijriMonth || (nextMonthWhiteDays.hijriMonth === upcoming.hijriMonth && nextMonthWhiteDays.hijriDay < upcoming.hijriDay)) {
                        upcoming = nextMonthWhiteDays
                    }
                }
                
                setNextIslamicOccasion(upcoming || ISLAMIC_OCCASIONS[0]);

            }
        } catch (e) {
            console.error("Failed to fetch Hijri date:", e);
            setHijriDate("تعذر جلب التاريخ الهجري");
        }
        setGregorianDate(new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }));

        // Fetch Prayer Times
        const cacheKey = `mahyayi_prayerTimes_${todayKey}`;
        const cachedTimes = localStorage.getItem(cacheKey);
        if (cachedTimes) {
            setPrayerTimes(JSON.parse(cachedTimes));
            return;
        }

        try {
            const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${todayKey}?city=Cairo&country=Egypt&method=5`);
            if (!response.ok) throw new Error('Failed to fetch prayer times');
            
            const data = await response.json();
            const timings = data.data.timings;

            const prayerNameMapping: Record<string, string> = {
                'Fajr': 'الفجر', 'Dhuhr': 'الظهر', 'Asr': 'العصر',
                'Maghrib': 'المغرب', 'Isha': 'العشاء',
            };
            
            const newPrayerTimes: Record<string, string> = {};
            PRAYERS.forEach(prayer => {
                const apiName = Object.keys(prayerNameMapping).find(key => prayerNameMapping[key] === prayer.name);
                if (apiName && timings[apiName]) {
                    newPrayerTimes[prayer.name] = timings[apiName];
                }
            });

            setPrayerTimes(newPrayerTimes);
            localStorage.setItem(cacheKey, JSON.stringify(newPrayerTimes));

        } catch (error) {
            console.error("Error fetching prayer times:", error);
        }
    };
    fetchDatesAndTimes();
  }, [todayKey]);

  const getNextPrayer = useCallback(() => {
      if (Object.keys(prayerTimes).length === 0) {
        return { prayer: PRAYERS[0], countdown: '...', isNextDay: false };
      }
      
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      let nextP: Prayer | null = null;
      let nextTime: number | null = null;
      let isNextDay = false;

      for (const prayer of PRAYERS) {
          const timeStr = prayerTimes[prayer.name];
          if (!timeStr) continue;
          const [h, m] = timeStr.split(':').map(Number);
          const prayerTime = h * 60 + m;
          if (prayerTime > currentTime) {
              nextP = prayer;
              nextTime = prayerTime;
              break;
          }
      }

      if (!nextP) {
          isNextDay = true;
          nextP = PRAYERS[0]; // Fajr of next day
          const timeStr = prayerTimes[nextP.name];
          if(timeStr) {
            const [h, m] = timeStr.split(':').map(Number);
            nextTime = h * 60 + m;
          } else {
            return { prayer: PRAYERS[0], countdown: '...', isNextDay: true };
          }
      }
      
      let diffMins;
      if(!isNextDay) {
          diffMins = nextTime! - currentTime;
      } else {
          diffMins = (24 * 60 - currentTime) + nextTime!;
      }
      
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      const countdown = `${hours > 0 ? `${hours} س` : ''} ${minutes} د`;
      
      return { prayer: nextP, countdown, isNextDay };
  }, [prayerTimes]);

  const calculateStats = useCallback((): UserStats => {
      let totalPoints = 0;
      let streak = 0;
      let weeklyPrayers = 0;
      let monthlyPrayers = 0;
      let quranPages = 0;
      let completedAzkar = 0;
      
      const allDataKeys = Object.keys(appData).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
      
      const today = new Date();
      for(let i=0; i < allDataKeys.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const key = getDateKey(checkDate);
        const dayData = appData[key];
        
        if (dayData?.prayerData) {
            const completed = Object.values(dayData.prayerData).filter((p: PrayerStatus) => p.fard !== 'not_prayed' && p.fard !== 'missed').length;
            if (completed >= 3) {
                streak++;
            } else {
                break;
            }
        } else {
             if(i === 0) continue; 
             break;
        }
      }

      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      allDataKeys.forEach(key => {
          const dayData = appData[key];
          const date = new Date(key);
          
          if(!dayData) return;

          if(dayData.prayerData) totalPoints += Object.values(dayData.prayerData).filter((p: PrayerStatus) => p.fard !== 'not_prayed' && p.fard !== 'missed').length * 10;
          if(dayData.azkarStatus) totalPoints += Object.values(dayData.azkarStatus).filter(Boolean).length * 15;
          if(dayData.quranRead) totalPoints += dayData.quranRead * 2;
          
          if(dayData.prayerData) {
              const completedCount = Object.values(dayData.prayerData).filter((p: PrayerStatus) => p.fard !== 'not_prayed' && p.fard !== 'missed').length;
              if (date >= startOfWeek) weeklyPrayers += completedCount;
              if (date >= startOfMonth) monthlyPrayers += completedCount;
          }
          if(dayData.quranRead) quranPages += dayData.quranRead;
          if(dayData.azkarStatus) completedAzkar += Object.values(dayData.azkarStatus).filter(Boolean).length;
      });
      
      return { totalPoints, streak, weeklyPrayers, monthlyPrayers, quranPages, completedAzkar };
  }, [appData]);

  // Data Management
  const exportData = () => {
      const keys = getStorageKeys();
      if (!user || !keys) return;
      const dataToExport: Record<string, string | null> = {};
      Object.entries(keys).forEach(([keyName, keyValue]) => {
          dataToExport[keyName] = localStorage.getItem(keyValue);
      });

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mahyayi_backup_${user.id}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };
  
  const importData = (file: File) => {
      const keys = getStorageKeys();
      if (!user || !keys) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              Object.entries(keys).forEach(([keyName, keyValue]) => {
                  if (data[keyName]) {
                      localStorage.setItem(keyValue as string, data[keyName]);
                  }
              });
              alert("تم استيراد البيانات بنجاح! سيتم إعادة تحميل التطبيق.");
              loadAllUserData();
          } catch (e) {
              alert("فشل استيراد البيانات. الملف غير صالح.");
              console.error("Import error:", e);
          }
      };
      reader.readAsText(file);
  };

    // --- Community Features ---
    const USER_DB_KEY = 'mahyayi_user_database';

    const getAllUsers = useCallback((): CommunityUser[] => {
        const db = localStorage.getItem(USER_DB_KEY);
        if (!db) return [];
        const allUsers: {id: string; name: string; email: string; picture: string}[] = JSON.parse(db);
        return allUsers.map(({ id, name, picture }) => ({ id, name, picture: picture || `https://i.pravatar.cc/150?u=${id}` }));
    }, []);

    const discoverableUsers = useMemo((): CommunityUser[] => {
        if (!user) return [];
        const allUsers = getAllUsers();
        const friendIds = friends.map(f => f.id);
        return allUsers.filter(u => u.id !== user.id && !friendIds.includes(u.id));
    }, [user, friends, getAllUsers]);

    const addFriend = (friendId: string) => {
        const keys = getStorageKeys();
        if (!user || !keys) return;

        const allUsers = getAllUsers();
        const friendToAdd = allUsers.find(u => u.id === friendId);

        if (friendToAdd && !friends.some(f => f.id === friendId)) {
            const newFriends = [...friends, friendToAdd];
            setFriends(newFriends);
            localStorage.setItem(keys.friendsKey, JSON.stringify(newFriends));
        }
    };

    const createGroup = (name: string, type: GroupType, memberIds: string[]) => {
        const keys = getStorageKeys();
        if (!user || !keys) return;

        const currentUserAsMember = { id: user.id, name: user.name, picture: user.picture };
        const newGroup: Group = {
            id: `group_${Date.now()}`,
            name,
            type,
            members: [currentUserAsMember],
            createdBy: user.id,
        };
        
        const newGroups = [...groups, newGroup];
        setGroups(newGroups);
        localStorage.setItem(keys.groupsKey, JSON.stringify(newGroups));
        
        console.log(`Creating group ${name} and "inviting" members (for demo):`, memberIds);
    };
    
    const respondToInvitation = (invitationId: string, response: 'accepted' | 'declined') => {
        const keys = getStorageKeys();
        if (!user || !keys) return;
        
        const updatedInvitations = invitations.map(inv => inv.id === invitationId ? {...inv, status: response} : inv);
        setInvitations(updatedInvitations.filter(inv => inv.status === 'pending')); // Keep only pending
        localStorage.setItem(keys.invitationsKey, JSON.stringify(updatedInvitations));

        if (response === 'accepted') {
            const inv = invitations.find(i => i.id === invitationId);
            console.log(`Accepted invitation to ${inv?.groupName}. This is a demo; in a real app, you'd be added to the group.`);
        }
    };

    const updateSharingSettings = (groupId: string, newGroupSettings: GroupSharingSettings) => {
        const keys = getStorageKeys();
        if (!user || !keys) return;
        
        const newSettings = { ...sharingSettings, [groupId]: newGroupSettings };
        setSharingSettings(newSettings);
        localStorage.setItem(keys.sharingSettingsKey, JSON.stringify(newSettings));
    };
    
    const getGroupFeed = (group: Group): GroupActivity[] => {
        return [
            {id: '1', user: group.members[0], message: `${group.members[0].name} أتم صلاة الفجر في وقتها.`, icon: '🌅', timestamp: new Date(Date.now() - 1000 * 60 * 15), groupId: group.id},
            {id: '2', user: group.members[0], message: `${group.members[0].name} قرأ 10 صفحات من القرآن.`, icon: '📖', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), groupId: group.id},
            ...(group.members.length > 1 ? [{id: '3', user: group.members[1 % group.members.length], message: `${group.members[1 % group.members.length].name} أكمل أذكار الصباح.`, icon: '📿', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), groupId: group.id}] : [])
        ].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    const getGroupMemberStats = (userId: string): UserStats => {
        if (userId !== user?.id) {
            const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            return {
                totalPoints: (Math.abs(hash) % 5000) + 1000,
                streak: Math.abs(hash) % 30,
                weeklyPrayers: Math.abs(hash) % 35,
                monthlyPrayers: (Math.abs(hash) % 150) + 20,
                quranPages: (Math.abs(hash) % 300) + 50,
                completedAzkar: (Math.abs(hash) % 100) + 10,
            }
        }
        return calculateStats();
    };

    const getGroupMemberChallenges = (userId: string): UserChallenge[] => {
        const hash = userId.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const challenges: UserChallenge[] = [
            { id: 'c1', title: "تحدي الصلاة في الوقت", desc: "صلِ جميع الصلوات الخمس في وقتها لمدة 7 أيام متتالية.", icon: "🕌", progress: Math.abs(hash) % 8, total: 7, reward: "+50 نقطة", status: 'active' },
            { id: 'c2', title: "تحدي الأذكار اليومية", desc: "أكمل أذكار الصباح والمساء لمدة 15 يومًا.", icon: "📿", progress: Math.abs(hash) % 16, total: 15, reward: "+100 نقطة", status: 'active' },
        ];
        return challenges;
    };

  return {
    dailyData,
    settings,
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
    nextPrayer: getNextPrayer(),
    stats: calculateStats(),

    // Wisdom & Hijri Year
    dailyWisdom,
    hijriYearInfo,

    // Islamic Calendar
    currentHijriMonthInfo,
    nextIslamicOccasion,

    // Community Features
    friends,
    groups,
    invitations,
    discoverableUsers,
    sharingSettings,
    addFriend,
    createGroup,
    respondToInvitation,
    updateSharingSettings,
    getGroupFeed,
    getGroupMemberStats,
    getGroupMemberChallenges,

    // Data Management
    exportData,
    importData,
    resetAllData,
  };
};