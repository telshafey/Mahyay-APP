import { AppData, PersonalGoal, UserChallenge } from './types';

// Helper to get past dates
const getDateKey = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

export const MOCK_APP_DATA: AppData = {
    [getDateKey(3)]: {
        prayerData: {
            'الفجر': { fard: 'early', sunnahBefore: true, sunnahAfter: false },
            'الظهر': { fard: 'ontime', sunnahBefore: true, sunnahAfter: true },
            'العصر': { fard: 'ontime', sunnahBefore: true, sunnahAfter: false },
            'المغرب': { fard: 'late', sunnahBefore: false, sunnahAfter: true },
            'العشاء': { fard: 'ontime', sunnahBefore: false, sunnahAfter: true }
        },
        azkarStatus: { 'أذكار الصباح': { 1: 1, 2: 3 }, 'أذكار المساء': { 11: 1 } },
        quranPagesRead: 10,
        nawafilData: { 'قيام الليل': { count: 2 }, 'صلاة الضحى': { selectedOption: 0 } },
    },
    [getDateKey(2)]: {
        prayerData: {
            'الفجر': { fard: 'ontime', sunnahBefore: true, sunnahAfter: false },
            'الظهر': { fard: 'missed', sunnahBefore: false, sunnahAfter: false },
            'العصر': { fard: 'ontime', sunnahBefore: false, sunnahAfter: false },
            'المغرب': { fard: 'ontime', sunnahBefore: false, sunnahAfter: true },
            'العشاء': { fard: 'late', sunnahBefore: false, sunnahAfter: false }
        },
        azkarStatus: { 'أذكار الصباح': { 1: 1, 2: 3, 3:1, 4:1, 5:1, 6:3, 7:3, 8:1, 9:100, 10:10 }, 'أذكار المساء': { 11:1, 12:3, 13:1, 14:1, 15:1, 16:3, 17:100} },
        quranPagesRead: 20,
        nawafilData: { 'صلاة الضحى': { selectedOption: 1 } },
    },
    [getDateKey(1)]: {
        prayerData: {
            'الفجر': { fard: 'early', sunnahBefore: true, sunnahAfter: false },
            'الظهر': { fard: 'early', sunnahBefore: true, sunnahAfter: true },
            'العصر': { fard: 'ontime', sunnahBefore: true, sunnahAfter: false },
            'المغرب': { fard: 'ontime', sunnahBefore: false, sunnahAfter: true },
            'العشاء': { fard: 'ontime', sunnahBefore: false, sunnahAfter: true }
        },
        azkarStatus: { 'أذكار الصباح': {}, 'أذكار المساء': {}, 'أذكار النوم': {}, 'أذكار الاستيقاظ': {} },
        quranPagesRead: 5,
        nawafilData: { 'قيام الليل': { count: 8 } },
    }
};

export const MOCK_PERSONAL_GOALS: PersonalGoal[] = [
    {
        id: 'goal1', user_id: 'mock_user', created_at: new Date().toISOString(),
        title: 'الاستغفار 100 مرة يوميًا', icon: '🤲', type: 'daily',
        target: 1, unit: undefined, end_date: undefined, is_archived: false, completed_at: null
    },
    {
        id: 'goal2', user_id: 'mock_user', created_at: new Date().toISOString(),
        title: 'قراءة كتاب "الرحيق المختوم"', icon: '📖', type: 'target',
        target: 500, unit: 'صفحة', end_date: undefined, is_archived: false, completed_at: null
    },
    {
        id: 'goal3', user_id: 'mock_user', created_at: new Date().toISOString(),
        title: 'صلة رحم أحد الأقارب', icon: '❤️', type: 'daily',
        target: 1, unit: undefined, end_date: undefined, is_archived: true, completed_at: new Date().toISOString()
    }
];

export const MOCK_GOAL_PROGRESS: { [goalId: string]: number } = {
    'goal2': 150
};

export const MOCK_USER_CHALLENGES: UserChallenge[] = [
    {
        id: 1, user_id: 'mock_user', challenge_id: 'c1', started_at: getDateKey(5),
        status: 'active', progress: 4, last_logged_date: getDateKey(1)
    },
    {
        id: 2, user_id: 'mock_user', challenge_id: 'c3', started_at: getDateKey(10),
        status: 'active', progress: 35 // sum of quranPagesRead in MOCK_APP_DATA
    },
    {
        id: 3, user_id: 'mock_user', challenge_id: 'c5', started_at: getDateKey(20),
        status: 'completed', progress: 4, completed_at: getDateKey(2)
    }
];
