import { Session, AuthResponse, AuthError } from '@supabase/supabase-js';

// Gemini Service Types
export interface VerseReflection {
  reflection: string;
  actionable_tip: string;
}

export interface PersonalizedDua {
  dua: string;
  source_info: string;
}

// AI Admin Update Types
export type AiUpdateAction = 'add' | 'update' | 'remove';

export interface AiUpdate<T> {
    action: AiUpdateAction;
    item?: Partial<T>; // For updates or removals
    newItem?: T;      // For additions
    reason: string;
}

export type AiUpdateInsight = AiUpdate<{
    setting: string;
    value: any;
}>;

export type AiUpdateOccasion = AiUpdate<IslamicOccasion>;
export type AiUpdatePrayerMethod = AiUpdate<PrayerMethod>;
export type AiUpdatePrayer = AiUpdate<Prayer>;
export type AiUpdateZikr = AiUpdate<Zikr>;


// Prayer Types
export type PrayerFardStatus = 'early' | 'ontime' | 'late' | 'missed' | 'not_prayed';

export interface PrayerStatus {
  fard: PrayerFardStatus;
  sunnahBefore: boolean;
  sunnahAfter: boolean;
}

export interface Prayer {
  name: string;
  emoji: string;
  sunnahBefore?: { count: number; evidence: string };
  sunnahAfter?: { count: number; evidence: string };
  virtue: string;
}

export interface PrayerMethod {
    id: number;
    name: string;
}

export interface Nawafil {
    name: string;
    emoji: string;
    isCustom: boolean;
    evidence: string;
    options?: { count: number; evidence: string }[];
}

export interface NawafilStatus {
    count?: number;
    selectedOption?: number;
}

export interface PrayerTimeData {
    [key: string]: string;
}

// Daily Data Structure
export interface DailyData {
  prayerData: { [key: string]: PrayerStatus };
  azkarStatus: { [key: string]: { [zikrId: number]: number } };
  quranPagesRead: number;
  nawafilData: { [key: string]: NawafilStatus };
  dailyGoalProgress: { [goalId: string]: boolean };
}

export type AppData = {
  [date: string]: Partial<DailyData>;
};


// Settings
export interface Settings {
  khatmaPosition: { surah: number, ayah: number };
  quranGoal: number;
  prayerMethod: number;
  azkarMorningStart: string;
  azkarEveningStart: string;
  notifications: {
      prayers: boolean;
      azkar: boolean;
  };
  featureToggles: {
      challenges: boolean;
      community: boolean;
  };
  hijriDateAdjustment: number;
}

// Stats
export interface AppStats {
    totalPoints: number;
    streak: number;
    weeklyPrayers: number;
    monthlyPrayers: number;
    quranPages: number;
    completedAzkar: number;
    khatmaProgress: {
        pagesReadInCurrent: number;
        percentage: number;
    };
}

// Challenges
export interface BaseChallenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    durationDays: number;
    target: number;
    tracking: 'auto' | 'manual';
    relatedItem?: 'prayer' | 'quran' | 'azkar' | 'charity' | 'surah_kahf' | 'azkar_morning' | 'azkar_evening';
}

export interface UserChallenge {
    id: string;
    user_id: string;
    challenge_id: string;
    started_at: string;
    status: 'active' | 'completed';
    progress: number;
    last_logged_date?: string;
    completed_at?: string;
}

export interface DisplayChallenge extends BaseChallenge {
    progress: number;
    userProgress?: UserChallenge;
}

// Personal Goals
export type GoalType = 'daily' | 'target';

export interface PersonalGoal {
    id: string;
    user_id: string;
    created_at: string;
    title: string;
    icon: string;
    type: GoalType;
    target: number;
    unit?: string;
    end_date?: string;
    is_archived: boolean;
    completed_at?: string | null;
}

// Quran
export interface Surah {
    id: number;
    name: string;
    englishName: string;
    ayahs: number;
    revelationType: 'Meccan' | 'Medinan';
    startPage: number;
}


// UI & Misc
export interface Notification {
    message: string;
    icon: string;
}

export type MorePageType = 'stats' | 'about' | 'support' | 'settings' | 'goals' | 'privacy' | 'terms';

export interface FAQ {
    id: string;
    q: string;
    a: string;
}

// Auth Context
export interface UserProfile {
    id: string;
    name: string;
    email: string | null;
    picture: string;
    role: 'user' | 'admin';
}

export interface AuthContextType {
    session: Session | null;
    profile: UserProfile | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signUp: (email: string, password: string) => Promise<AuthResponse>;
    signOut: () => Promise<{ error: AuthError | null }>;
    toggleRole: () => Promise<void>;
}


// Islamic Calendar Types
export interface IslamicOccasion {
  id: string;
  name: string;
  hijriDay: number;
  hijriMonth: number;
  description: string;
  date?: Date; // Added for sorting
}

export interface HijriMonthInfo {
  name: string;
  definition: string;
  occasions: IslamicOccasion[];
}

export interface HijriYearInfo {
    year: number;
    length: number;
}

export interface ApiHijriDate {
    date: string; // e.g., "18-12-1445"
    format: string; // e.g., "DD-MM-YYYY"
    day: string; // e.g., "18"
    weekday: { en: string; ar: string; };
    month: { number: number; en: string; ar: string; };
    year: string;
}


// App Context
export interface PersonalGoalsContextType {
    personalGoals: PersonalGoal[];
    goalProgress: { [goalId: string]: number };
    addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>) => Promise<boolean>;
    updateTargetGoalProgress: (goalId: string, newValue: number) => Promise<boolean>;
    toggleDailyGoalCompletion: (goalId: string) => void;
    deletePersonalGoal: (goalId: string) => Promise<boolean>;
    toggleGoalArchivedStatus: (goalId: string) => Promise<boolean>;
}

export type DailyAzkarCategory = 'أذكار الصباح' | 'أذكار المساء' | 'أذكار النوم' | 'أذكار الاستيقاظ' | 'أذكار عامة';

export interface Zikr {
    id: number;
    category: string;
    text: string;
    repeat: number;
    reference: string;
    notes?: string;
}

export interface AzkarCategory {
    name: DailyAzkarCategory | string;
    items: Zikr[];
}


export interface AppContextType {
    settings: Settings;
    dailyData: DailyData;
    isDataLoading: boolean;
    appError: string | null;
    notification: Notification | null;
    stats: AppStats;
    hijriDate: string;
    hijriDateParts: { day: string; month: string; };
    currentHijriMonthInfo: HijriMonthInfo;
    nextIslamicOccasion: IslamicOccasion | null;
    hijriYearInfo: HijriYearInfo;
    dailyWisdom: { text: string; source: string; };
    userChallenges: UserChallenge[];
    weeklyPrayerCounts: { day: string; count: number }[];
    featureToggles: { challenges: boolean; community: boolean };
    faqs: FAQ[];
    challenges: BaseChallenge[];
    islamicOccasions: IslamicOccasion[];
    prayerMethods: PrayerMethod[];
    prayers: Prayer[];
    nawafilPrayers: Nawafil[];
    azkarData: AzkarCategory[];
    quranSurahs: Surah[];
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    updatePrayerStatus: (prayerName: string, status: PrayerFardStatus) => Promise<void>;
    updateSunnahStatus: (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => Promise<void>;
    updateNawafilOption: (nawafilName: string, optionIndex: number) => Promise<void>;
    updateQiyamCount: (nawafilName: string, change: number) => Promise<void>;
    updateKhatmaPosition: (position: { surah: number; ayah: number }) => Promise<void>;
    resetAllData: () => Promise<boolean>;
    startChallenge: (challengeId: string) => Promise<boolean>;
    logManualChallengeProgress: (challengeId: string) => Promise<boolean>;
    incrementAzkarCount: (categoryName: DailyAzkarCategory | string, zikrId: number) => Promise<void>;
    completeZikr: (categoryName: DailyAzkarCategory | string, zikrId: number) => Promise<void>;
    updateFeatureToggles: (toggles: { challenges: boolean; community: boolean }) => void;
    // Personal Goals
    personalGoals: PersonalGoal[];
    goalProgress: { [goalId: string]: number };
    addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>) => Promise<boolean>;
    updateTargetGoalProgress: (goalId: string, newValue: number) => Promise<boolean>;
    toggleDailyGoalCompletion: (goalId: string) => void;
    deletePersonalGoal: (goalId: string) => Promise<boolean>;
    toggleGoalArchivedStatus: (goalId: string) => Promise<boolean>;
    // Admin functions
    addChallenge: (item: Omit<BaseChallenge, 'id'>) => Promise<void>;
    updateChallenge: (item: BaseChallenge) => Promise<void>;
    deleteChallenge: (id: string) => Promise<void>;
    addIslamicOccasion: (item: Omit<IslamicOccasion, 'id'>) => Promise<void>;
    updateIslamicOccasion: (item: IslamicOccasion) => Promise<void>;
    deleteIslamicOccasion: (id: string) => Promise<void>;
    addPrayerMethod: (item: Omit<PrayerMethod, 'id'>) => Promise<void>;
    updatePrayerMethod: (item: PrayerMethod) => Promise<void>;
    deletePrayerMethod: (id: number) => Promise<void>;
    addFaq: (item: Omit<FAQ, 'id'>) => Promise<void>;
    updateFaq: (item: FAQ) => Promise<void>;
    deleteFaq: (id: string) => Promise<void>;
    updateFardhPrayer: (p: Prayer) => Promise<void>;
    updateNawafilPrayer: (n: Nawafil) => Promise<void>;
    updateSurah: (s: Surah) => Promise<void>;
    addZikr: (categoryName: AzkarCategory['name'], zikr: Omit<Zikr, 'id' | 'category'>) => Promise<void>;
    updateZikr: (categoryName: AzkarCategory['name'], zikr: Zikr) => Promise<void>;
    deleteZikr: (categoryName: AzkarCategory['name'], zikrId: number) => Promise<void>;
    addAzkarCategory: (name: AzkarCategory['name']) => Promise<void>;
    deleteAzkarCategory: (name: AzkarCategory['name']) => Promise<void>;
}


// Prayer Times Context
export interface PrayerTimesContextType {
    prayerTimes: { [key: string]: string };
    nextPrayer: {
        prayer: Prayer | null;
        countdown: string;
        isNextDay: boolean;
    };
    coordinates: { latitude: number, longitude: number } | null;
    locationError: string | null;
    detectLocation: () => Promise<void>;
    isPrayerTimesLoading: boolean;
    apiHijriDate: ApiHijriDate | null;
}
