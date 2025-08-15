import { AppData, UserStats, UserChallenge } from "./types";
import { CHALLENGES, QURAN_TOTAL_PAGES } from "./constants";

export const getMaxCount = (repeatText: string): number => {
    if (repeatText.includes('ثلاث')) return 3;
    if (repeatText.includes('أربع')) return 4;
    if (repeatText.includes('مائة')) return 100;
    const numberMatch = repeatText.match(/\d+/);
    if (numberMatch) return parseInt(numberMatch[0], 10);
    return 1;
};

export const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'الآن';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `قبل ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `قبل ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `قبل ${days} يوم`;
};

const getDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const calculateStats = (appData: AppData): UserStats => {
    let totalPoints = 0;
    let streak = 0;
    let weeklyPrayers = 0;
    let monthlyPrayers = 0;
    let quranPages = 0;
    let completedAzkar = 0;

    const today = new Date();
    let consecutiveDays = 0;

    const allData = Object.entries(appData);

    // Calculate total pages first from all history
    allData.forEach(([, data]) => {
        quranPages += data.quranRead || 0;
    });

    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const key = getDateKey(date);
        const data = appData[key];

        if (data) {
            const prayersDone = Object.values(data.prayerData || {}).filter(p => p.fard === 'early' || p.fard === 'ontime').length;
            
            if (i === consecutiveDays && prayersDone >= 3) {
                consecutiveDays++;
            }

            if (i < 7) weeklyPrayers += prayersDone;
            monthlyPrayers += prayersDone;
            
            const azkarDone = Object.values(data.azkarStatus || {}).filter(s => s).length;
            completedAzkar += azkarDone;
            
            totalPoints += (prayersDone * 10) + (azkarDone * 15) + ((data.quranRead || 0) * 2);
        } else {
            if(i === consecutiveDays){
                // streak broken
            }
        }
    }
    streak = consecutiveDays;
    
    const pagesReadInCurrent = quranPages % QURAN_TOTAL_PAGES;
    const khatmaProgressPercentage = (pagesReadInCurrent / QURAN_TOTAL_PAGES) * 100;

    return { 
        totalPoints, 
        streak, 
        weeklyPrayers, 
        monthlyPrayers, 
        quranPages, 
        completedAzkar,
        khatmaProgress: {
            pagesReadInCurrent,
            percentage: khatmaProgressPercentage
        }
    };
};

export const calculateUserChallenges = (appData: AppData): UserChallenge[] => {
    // This is a simplified example. A real implementation would store challenge progress.
    const stats = calculateStats(appData);
    const activeChallenges = CHALLENGES.filter(c => c.status === 'active').map(c => {
        let progress = 0;
        if (c.id === 'c2') { // Quran challenge
            progress = Math.min(stats.quranPages, c.total);
        }
        // A more complex challenge like sunnah prayers would need daily data iteration
        if (c.id === 'c1') {
            let consecutiveSunnahDays = 0;
            for (let i = 0; i < c.total; i++) {
                const date = new Date();
                date.setDate(new Date().getDate() - i);
                const key = getDateKey(date);
                const data = appData[key];
                if (data?.prayerData) {
                    const sunanRawateb = (data.prayerData['الفجر']?.sunnahBefore ? 2 : 0) +
                                         (data.prayerData['الظهر']?.sunnahBefore ? 4 : 0) +
                                         (data.prayerData['الظهر']?.sunnahAfter ? 2 : 0) +
                                         (data.prayerData['المغرب']?.sunnahAfter ? 2 : 0) +
                                         (data.prayerData['العشاء']?.sunnahAfter ? 2 : 0);
                    if(sunanRawateb >= 12) {
                        consecutiveSunnahDays++;
                    } else {
                        break; // Streak broken
                    }
                } else {
                    break; // Streak broken
                }
            }
            progress = Math.min(consecutiveSunnahDays, c.total);
        }
        return { ...c, progress };
    });
    return activeChallenges;
};