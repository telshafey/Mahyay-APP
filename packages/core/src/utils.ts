import { AppData, AppStats, UserChallenge, DailyAzkarCategory, PrayerStatus, DailyData } from './types';
import { CHALLENGES, QURAN_TOTAL_PAGES, QURAN_SURAHS, AZKAR_DATA } from './constants';

export const safeLocalStorage = {
    getItem(key: string): string | null {
        try {
            return window.localStorage.getItem(key);
        } catch (e) {
            console.warn(`Could not get item from localStorage: ${key}`, e);
            return null;
        }
    },
    setItem(key: string, value: string): void {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            console.warn(`Could not set item in localStorage: ${key}`, e);
        }
    },
    removeItem(key: string): void {
        try {
            window.localStorage.removeItem(key);
        } catch (e) {
            console.warn(`Could not remove item from localStorage: ${key}`, e);
        }
    },
};

export const getMaxCount = (repeat: string | number): number => {
    if (typeof repeat === 'number') {
        return repeat;
    }
    const match = repeat.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
};

export const getAbsolutePageApproximation = (position: { surah: number, ayah: number }): number => {
    if (!position || !position.surah) return 1;
    
    const surahInfo = QURAN_SURAHS[position.surah - 1];
    if (!surahInfo) return 1;

    const nextSurahInfo = QURAN_SURAHS[position.surah] || { startPage: QURAN_TOTAL_PAGES + 1 };
    
    const pagesInSurah = nextSurahInfo.startPage - surahInfo.startPage;
    
    // For single-page surahs, or if ayahs count is 0, return start page.
    if (pagesInSurah <= 0 || surahInfo.ayahs === 0) {
        return surahInfo.startPage;
    }
    
    const progressInSurah = position.ayah / surahInfo.ayahs;
    const pageOffset = Math.floor(progressInSurah * pagesInSurah);
    
    return surahInfo.startPage + pageOffset;
};

export const getSurahFromPage = (page: number): { surah: number, ayah: number } => {
    // Ensure page is within bounds
    const validPage = Math.max(1, Math.min(page, QURAN_TOTAL_PAGES));
    
    // Find the Surah that starts on or before this page
    // We iterate backwards or find the last surah where startPage <= validPage
    let foundSurah = QURAN_SURAHS[0];
    
    for (let i = 0; i < QURAN_SURAHS.length; i++) {
        if (QURAN_SURAHS[i].startPage <= validPage) {
            foundSurah = QURAN_SURAHS[i];
        } else {
            // Since surahs are ordered, once we pass a startPage > validPage, we stop.
            break;
        }
    }
    
    // Default to Ayah 1 of that Surah (approximate mapping for bookmarking purposes)
    return { surah: foundSurah.id, ayah: 1 };
};


export const calculateStats = (appData: AppData, userChallenges: UserChallenge[]): AppStats => {
    let totalPoints = 0;
    let weeklyPrayers = 0;
    let monthlyPrayers = 0;
    let quranPages = 0;
    let completedAzkar = 0;
    const today = new Date();
    
    const sortedDates = Object.keys(appData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const dailyAzkarCategories: DailyAzkarCategory[] = ['أذكار الصباح', 'أذكار المساء', 'أذكار النوم', 'أذكار الاستيقاظ', 'أذكار ما بعد الصلاة'];

    sortedDates.forEach(dateKey => {
        const dayData = appData[dateKey];
        if (!dayData) return;
        const date = new Date(dateKey);
        
        // FIX: Add type annotation for `p` to resolve error.
        const prayersToday = Object.values(dayData.prayerData || {}).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length;
        totalPoints += prayersToday * 10;
        
        const diffDays = (today.getTime() - date.getTime()) / (1000 * 3600 * 24);
        if (diffDays < 7) weeklyPrayers += prayersToday;
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) monthlyPrayers += prayersToday;

        let azkarCategoriesCompletedToday = 0;
        const azkarStatusForDay = dayData.azkarStatus || {};

        for (const categoryName of dailyAzkarCategories) {
            const categoryData = AZKAR_DATA.find(c => c.name === categoryName);
            if(categoryData) {
                const userProgress = azkarStatusForDay[categoryName];
                if (userProgress && categoryData.items.every(item => (userProgress[item.id] || 0) >= item.repeat)) {
                    azkarCategoriesCompletedToday++;
                }
            }
        }
        
        completedAzkar += azkarCategoriesCompletedToday;
        totalPoints += azkarCategoriesCompletedToday * 15;

        const pagesReadToday = dayData.quranPagesRead || 0;
        quranPages += pagesReadToday;
        totalPoints += pagesReadToday * 2;
    });

    userChallenges.forEach(uc => {
        if (uc.status === 'completed') {
            const baseChallenge = CHALLENGES.find(c => c.id === uc.challenge_id);
            if (baseChallenge) totalPoints += baseChallenge.points;
        }
    });

    let streak = 0;
    const reversedDates = Object.keys(appData).sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
    if (reversedDates.length > 0) {
        const lastDate = new Date(reversedDates[0]);
        const diff = Math.floor((new Date().setHours(0,0,0,0) - lastDate.setHours(0,0,0,0)) / (1000 * 3600 * 24));
        if (diff <= 1) {
            for (let i = 0; i < reversedDates.length; i++) {
                const dayData = appData[reversedDates[i]];
                // FIX: Add type annotation for `p` to resolve error.
                const prayers = Object.values(dayData?.prayerData || {}).filter((p: PrayerStatus) => ['early', 'ontime'].includes(p.fard)).length;
                if (prayers >= 3) {
                    streak++;
                    if (i + 1 < reversedDates.length) {
                        const d1 = new Date(reversedDates[i]);
                        const d2 = new Date(reversedDates[i+1]);
                        const dayDiff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
                        if (dayDiff > 1) break;
                    }
                } else break;
            }
        }
    }

    const pagesReadInCurrent = quranPages % QURAN_TOTAL_PAGES;
    const percentage = (pagesReadInCurrent / QURAN_TOTAL_PAGES) * 100;

    return { totalPoints, streak, weeklyPrayers, monthlyPrayers, quranPages, completedAzkar, khatmaProgress: { pagesReadInCurrent, percentage } };
};


/**
 * Checks if a given Hijri year is a leap year.
 * The formula is based on the algorithm used in common Hijri calendar implementations.
 * A Hijri year is leap if (11 * year + 14) % 30 < 11.
 * @param {number} year The Hijri year to check.
 * @returns {boolean} True if the year is a leap year, false otherwise.
 */
export const isHijriLeapYear = (year: number): boolean => {
    return (11 * year + 14) % 30 < 11;
};