import { Session } from '@supabase/supabase-js';

// Gemini Service Types
export interface VerseReflection {
  reflection: string;
  actionable_tip: string;
}

export interface PersonalizedDua {
  dua: string;
  source_info: string;
}

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
  [date: string]: Omit<DailyData, 'dailyGoalProgress' | 'prayerData' | 'azkarStatus' | 'nawafilData'> & {
    prayerData?: { [key: string]: PrayerStatus };
    azkarStatus?: { [key: string]: { [zikrId: number]: number } };
    nawafilData?: { [key: string]: NawafilStatus };
    quranPagesRead?: number;
  };
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
    id: number;
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
    signIn: (email: string, password: string) => Promise<{ data?: any; error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ data?: any; error: Error | null }>;
    signOut: () => Promise<{ error: Error | null }>;
    viewAsUser: boolean;
    toggleViewMode: () => void;
}


// Islamic Calendar Types
export interface IslamicOccasion {
  id: string;
  name: string;
  hijriDay: number;
  hijriMonth: number;
  description: string;
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


// App Context
export interface PersonalGoalsContextType {
    personalGoals: PersonalGoal[];
    goalProgress: { [goalId: string]: number };
    addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'user_id' | 'created_at' | 'is_archived' | 'completed_at'>) => Promise<boolean>;
    updateTargetGoalProgress: (goalId: string, newValue: number) => Promise<boolean>;
    toggleDailyGoalCompletion: (goalId: string) => Promise<void>;
    deletePersonalGoal: (goalId: string) => Promise<boolean>;
    toggleGoalArchivedStatus: (goalId: string) => Promise<boolean>;
}

export type DailyAzkarCategory = 'أذكار الصباح' | 'أذكار المساء' | 'أذكار النوم' | 'أذكار الاستيقاظ';

export interface AppContextType extends PersonalGoalsContextType {
    settings: Settings;
    dailyData: DailyData;
    isDataLoading: boolean;
    appError: string | null;
    notification: Notification | null;
    stats: AppStats;
    hijriDate: string;
    hijriDateParts: { day: string; month: string; };
    currentHijriMonthInfo: HijriMonthInfo | null;
    nextIslamicOccasion: IslamicOccasion | null;
    hijriYearInfo: HijriYearInfo | null;
    dailyWisdom: { text: string; source: string; } | null;
    userChallenges: UserChallenge[];
    challenges: BaseChallenge[];
    islamicOccasions: IslamicOccasion[];
    prayerMethods: PrayerMethod[];
    weeklyPrayerCounts: { day: string; count: number }[];
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    updatePrayerStatus: (prayerName: string, status: PrayerFardStatus) => Promise<void>;
    updateSunnahStatus: (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => Promise<void>;
    updateNawafilOption: (nawafilName: string, optionIndex: number) => Promise<void>;
    updateQiyamCount: (nawafilName: string, change: number) => Promise<void>;
    updateKhatmaPosition: (position: { surah: number; ayah: number }) => Promise<void>;
    resetAllData: () => Promise<boolean>;
    startChallenge: (challengeId: string) => Promise<boolean>;
    logManualChallengeProgress: (challengeId: string) => Promise<boolean>;
    incrementAzkarCount: (categoryName: DailyAzkarCategory, zikrId: number) => Promise<void>;
    completeZikr: (categoryName: DailyAzkarCategory, zikrId: number) => Promise<void>;
    // Admin functions
    addChallenge: (challenge: Omit<BaseChallenge, 'id'>) => Promise<void>;
    updateChallenge: (challenge: BaseChallenge) => Promise<void>;
    deleteChallenge: (challengeId: string) => Promise<void>;
    addIslamicOccasion: (occasion: Omit<IslamicOccasion, 'id'>) => Promise<void>;
    updateIslamicOccasion: (occasion: IslamicOccasion) => Promise<void>;
    deleteIslamicOccasion: (occasionId: string) => Promise<void>;
    addPrayerMethod: (method: Omit<PrayerMethod, 'id'>) => Promise<void>;
    updatePrayerMethod: (method: PrayerMethod) => Promise<void>;
    deletePrayerMethod: (methodId: number) => Promise<void>;
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
}

// Azkar
export interface Zikr {
    id: number;
    category: string;
    text: string;
    repeat: number;
    reference: string;
    notes?: string;
}

export interface AzkarCategory {
    name: 'أذكار الصباح' | 'أذكار المساء' | 'أذكار النوم' | 'أذكار الاستيقاظ' | 'أذكار عامة';
    items: Zikr[];
}
