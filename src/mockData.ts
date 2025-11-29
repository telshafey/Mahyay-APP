import { AppData, PersonalGoal, UserChallenge, FAQ } from './types';

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
        id: 'uc_1', user_id: 'mock_user', challenge_id: 'c1', started_at: getDateKey(5),
        status: 'active', progress: 4, last_logged_date: getDateKey(1)
    },
    {
        id: 'uc_2', user_id: 'mock_user', challenge_id: 'c3', started_at: getDateKey(10),
        status: 'active', progress: 35 // sum of quranPagesRead in MOCK_APP_DATA
    },
    {
        id: 'uc_3', user_id: 'mock_user', challenge_id: 'c5', started_at: getDateKey(20),
        status: 'completed', progress: 4, completed_at: getDateKey(2)
    }
];

// FIX: Add MOCK_FAQS export to resolve import error.
export const MOCK_FAQS: FAQ[] = [
    {
        id: 'faq1',
        q: 'كيف يتم حساب مواقيت الصلاة؟',
        a: 'يستخدم التطبيق موقعك الجغرافي (بعد الحصول على إذنك) لحساب مواقيت الصلاة بدقة عبر واجهة برمجة تطبيقات (API) موثوقة. يمكنك أيضًا اختيار طريقة الحساب المفضلة لديك من الإعدادات. في حالة عدم توفر الموقع، يتم استخدام مواقيت القاهرة كإعداد افتراضي.'
    },
    {
        id: 'faq2',
        q: 'هل بياناتي آمنة؟ وأين يتم تخزينها؟',
        a: 'نعم، بياناتك آمنة تمامًا. يتم تخزين جميع بياناتك محليًا على جهازك فقط ولا يتم رفعها إلى أي خوادم. لديك السيطرة الكاملة على بياناتك ويمكنك حذفها في أي وقت من الإعدادات.'
    },
    {
        id: 'faq3',
        q: 'كيف يعمل نظام النقاط والتحديات؟',
        a: 'تكسب نقاطًا مقابل كل عبادة تقوم بها، مثل الصلوات في وقتها، إتمام الأذكار، وقراءة القرآن. التحديات تمنحك نقاطًا إضافية عند إكمالها، وهي مصممة لمساعدتك على بناء عادات إيمانية قوية ومستمرة.'
    },
    {
        id: 'faq4',
        q: 'ما هي ميزة "رفيق الدعاء"؟',
        a: 'هي ميزة تستخدم الذكاء الاصطناعي لمساعدتك على صياغة أدعية من وحي القرآن والسنة بناءً على ما تشعر به أو تحتاجه. فقط اكتب ما في خاطرك، وسيقوم "رفيق الدعاء" بتقديم دعاء مناسب يمكنك الدعاء به.'
    }
];