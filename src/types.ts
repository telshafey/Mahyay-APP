import type { Session } from '@supabase/supabase-js';

// --- Gemini API Related ---
export interface VerseReflection {
  reflection: string;
  actionable_tip: string;
}

export interface PersonalizedDua {
  dua: string;
  source_info: string;
}

// --- Prayer Related ---
export type PrayerFardStatus = 'not_prayed' | 'early' | 'ontime' | 'late' | 'missed';

export interface PrayerStatus {
  fard: PrayerFardStatus;
  sunnahBefore: boolean;
  sunnahAfter: boolean;
}

export interface Prayer {
  name: string;
  emoji: string;
  virtue: string;
  sunnahBefore?: { count: number; evidence: string };
  sunnahAfter?: { count: number; evidence: string };
}

export interface PrayerTimeData {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise: string;
  [key: string]: string;
}

export interface Nawafil {
  name: string;
  emoji: string;
  isCustom?: boolean;
  evidence: string;
  options?: { count: number; evidence: string }[];
}

export interface NawafilStatus {
  count?: number;
  selectedOption?: number;
}

// --- Azkar Related ---
export interface AzkarType {
  name: string;
  emoji: string;
  time: string;
}

export interface AzkarItem {
  text: string;
  repeat: string;
  evidence: string;
}

// --- User & Auth ---
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
  role: 'admin' | 'user';
}

export interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

// --- Goals & Challenges ---
export type GoalType = 'daily' | 'target';

export interface PersonalGoal {
  id: string;
  title: string;
  icon: string;
  type: GoalType;
  target: number;
  unit?: string;
  endDate?: string;
  createdAt: string;
  isArchived: boolean;
  completedAt?: string | null;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  durationDays: number;
  points: number;
  type: 'prayer' | 'azkar' | 'quran' | 'custom';
  target: number;
  relatedItem?: string;
  tracking: 'auto' | 'manual';
}

export interface UserChallenge {
  id: number | string;
  userId: string;
  challengeId: string;
  startDate: string;
  status: 'active' | 'completed';
  progress: number;
  completedAt?: string | null;
  lastLoggedDate?: string | null;
}

export interface DisplayChallenge extends Challenge {
  progress: number;
  userProgress?: UserChallenge | null;
}


// --- App Data & State ---
export interface DailyData {
  date: string;
  prayerData: { [key: string]: PrayerStatus };
  azkarStatus: { [key: string]: boolean };
  quranRead: number;
  quranKhatmat: number;
  azkarProgress: { [azkarName: string]: { [itemIndex: number]: number } };
  nawafilData: { [key: string]: NawafilStatus };
  dailyGoalProgress: { [goalId: string]: boolean };
}

export type AppData = {
  [dateKey: string]: Partial<DailyData>;
};

export interface UserStats {
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

export interface Settings {
  quranGoal: number;
  prayerMethod: number;
  azkarMorningStart: string; // "HH:mm"
  azkarEveningStart: string; // "HH:mm"
  notifications: {
    prayers: boolean;
    azkar: boolean;
  };
}

export interface HijriMonthInfo {
  number: number;
  name: string;
  year: number;
  definition: string;
  occasions: {
    id: string;
    name: string;
    hijriDay: number;
    description: string;
  }[];
}

export interface IslamicOccasion {
  id: string;
  name: string;
  hijriDay: number;
  hijriMonth: number;
  description: string;
}

export interface PrayerTimesContextType {
  prayerTimes: { [key: string]: string };
  nextPrayer: { prayer: Prayer | null; countdown: string; isNextDay: boolean; };
  coordinates: { latitude: number; longitude: number } | null;
  locationError: string | null;
  detectLocation: () => Promise<void>;
  isPrayerTimesLoading: boolean;
}

export interface AppContextType {
  dailyData: DailyData;
  stats: UserStats;
  settings: Settings;
  isDataLoading: boolean;
  updatePrayerStatus: (prayerName: string, status: PrayerFardStatus) => Promise<boolean>;
  updateSunnahStatus: (prayerName: string, type: 'sunnahBefore' | 'sunnahAfter') => Promise<boolean>;
  updateNawafilOption: (nawafilName: string, optionIndex: number) => Promise<boolean>;
  updateQiyamCount: (nawafilName: string, change: number) => Promise<boolean>;
  dailyWisdom: { text: string; source: string } | null;
  getAzkarProgress: (azkarName: string) => number;
  toggleAzkarItemCompletion: (azkarName: string, itemIndex: number) => void;
  completeAzkarGroup: (azkarName: string) => void;
  updateQuranRead: (change: number) => void;
  completeKhatma: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllData: () => Promise<boolean>;
  hijriDate: string;
  shortHijriDate: string;
  notification: { message: string; icon: string } | null;
  personalGoals: PersonalGoal[];
  goalProgress: { [goalId: string]: number };
  addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'createdAt' | 'isArchived' | 'completedAt'>) => Promise<boolean>;
  updateTargetGoalProgress: (goalId: string, newValue: number) => void;
  toggleDailyGoalCompletion: (goalId: string) => void;
  deletePersonalGoal: (goalId: string) => Promise<boolean>;
  toggleGoalArchivedStatus: (goalId: string) => Promise<boolean>;
  userChallenges: UserChallenge[];
  startChallenge: (challengeId: string) => void;
  logManualChallengeProgress: (challengeId: string) => void;
  currentHijriMonthInfo: HijriMonthInfo | null;
  nextIslamicOccasion: IslamicOccasion | null;
  hijriYearInfo: { year: number; length: number } | null;
  weeklyPrayerCounts: { day: string; count: number }[];
}

// --- Misc ---
export type MorePageType = 'stats' | 'challenges' | 'about' | 'support' | 'settings' | 'goals' | 'privacy' | 'terms';