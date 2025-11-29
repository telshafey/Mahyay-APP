import { describe, it, expect } from 'vitest';
import { calculateStats } from './utils';
import { AppData, UserChallenge, AzkarCategory } from './types';
import { AZKAR_DATA, CHALLENGES } from './constants';

describe('calculateStats', () => {

    it('should return default stats for empty data', () => {
        const appData: AppData = {};
        const userChallenges: UserChallenge[] = [];
        const stats = calculateStats(appData, userChallenges, CHALLENGES);

        expect(stats.totalPoints).toBe(0);
        expect(stats.streak).toBe(0);
        expect(stats.weeklyPrayers).toBe(0);
        expect(stats.monthlyPrayers).toBe(0);
        expect(stats.quranPages).toBe(0);
        expect(stats.completedAzkar).toBe(0);
        expect(stats.khatmaProgress.pagesReadInCurrent).toBe(0);
        expect(stats.khatmaProgress.percentage).toBe(0);
    });

    it('should calculate stats correctly for a single day of data', () => {
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];
        
        const morningAzkarItems = AZKAR_DATA.find((c: AzkarCategory) => c.name === 'أذكار الصباح')!.items;
        const completeMorningAzkarStatus = Object.fromEntries(
            morningAzkarItems.map(item => [item.id, item.repeat])
        );

        const appData: AppData = {
            [todayKey]: {
                prayerData: {
                    'الفجر': { fard: 'ontime', sunnahBefore: true, sunnahAfter: false },
                    'الظهر': { fard: 'early', sunnahBefore: true, sunnahAfter: true },
                    'العصر': { fard: 'ontime', sunnahBefore: false, sunnahAfter: false },
                    'المغرب': { fard: 'missed', sunnahBefore: false, sunnahAfter: false },
                    'العشاء': { fard: 'not_prayed', sunnahBefore: false, sunnahAfter: false }
                },
                azkarStatus: {
                    'أذكار الصباح': completeMorningAzkarStatus,
                    'أذكار المساء': { 11: 1 } // Incomplete
                },
                quranPagesRead: 10,
                nawafilData: {},
                dailyGoalProgress: {},
            }
        };

        const userChallenges: UserChallenge[] = [];

        const stats = calculateStats(appData, userChallenges, CHALLENGES);
        
        const expectedPrayerPoints = 3 * 10; // 3 prayers on time
        const expectedAzkarPoints = 1 * 15;  // 1 azkar group completed
        const expectedQuranPoints = 10 * 2;   // 10 pages read
        const expectedTotalPoints = expectedPrayerPoints + expectedAzkarPoints + expectedQuranPoints;

        expect(stats.totalPoints).toBe(expectedTotalPoints);
        expect(stats.streak).toBe(1); // 3 prayers are enough for a streak
        expect(stats.weeklyPrayers).toBe(3);
        expect(stats.monthlyPrayers).toBe(3);
        expect(stats.quranPages).toBe(10);
        expect(stats.completedAzkar).toBe(1);
    });

    it('should calculate points from completed challenges', () => {
        const appData: AppData = {};
        const userChallenges: UserChallenge[] = [
            {
                // FIX: Changed id to a string to match the UserChallenge type.
                id: '1', user_id: '123', challenge_id: 'c1', started_at: '',
                status: 'completed', progress: 84
            },
            {
                // FIX: Changed id to a string to match the UserChallenge type.
                id: '2', user_id: '123', challenge_id: 'c2', started_at: '',
                status: 'active', progress: 5
            }
        ];

        const stats = calculateStats(appData, userChallenges, CHALLENGES);
        
        expect(stats.totalPoints).toBe(200);
    });
    
    it('should correctly calculate khatma progress', () => {
        const appData: AppData = {
            '2024-01-01': { quranPagesRead: 600, prayerData: {}, azkarStatus: {}, nawafilData: {}, dailyGoalProgress: {} },
            '2024-01-02': { quranPagesRead: 10, prayerData: {}, azkarStatus: {}, nawafilData: {}, dailyGoalProgress: {} } // Total 610, which is 6 pages into the new khatma
        };
        const stats = calculateStats(appData, [], CHALLENGES);
        
        expect(stats.quranPages).toBe(610);
        expect(stats.khatmaProgress.pagesReadInCurrent).toBe(6); // 610 % 604 = 6
        // (6 / 604) * 100 is approx 0.99
        expect(stats.khatmaProgress.percentage).toBeCloseTo((6 / 604) * 100, 2);
    });
});