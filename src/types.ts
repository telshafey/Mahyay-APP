import { AuthError, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string | undefined;
  picture: string;
  role?: 'admin' | 'user';
}

export interface AuthContextType {
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

export interface SunnahInfo {
  count: number;
  evidence: string;
}

export interface Prayer {
  name:string;
  emoji: string;
  virtue: string;
  sunnahBefore: SunnahInfo | null;
  sunnahAfter: SunnahInfo | null;
}

export type PrayerFardStatus = 'not_prayed' | 'early' | 'ontime' | 'late' | 'missed';

export interface PrayerStatus {
  fard: PrayerFardStatus;
  sunnahBefore: boolean;
  sunnahAfter: boolean;
}

export interface PrayerData {
  [prayerName: string]: PrayerStatus;
}

export interface NawafilOption {
  count: number;
  evidence: string;
}

export interface Nawafil {
  name: string;
  emoji: string;
  time: string;
  options?: NawafilOption[];
  isCustom?: boolean;
  evidence?: string;
}

export interface NawafilStatus {
  selectedOption?: number;
  count?: number;
}

export interface NawafilData {
  [nawafilName: string]: NawafilStatus;
}

export interface AzkarType {
  name: string;
  emoji: string;
  time: string;
  startHour: number;
  endHour: number;
}

export interface AzkarItem {
  text: string;
  repeat: string;
  evidence: string;
}

export interface AzkarProgress {
  [azkarIndex: number]: number; // count
}

export interface AzkarProgressData {
  [azkarName: string]: AzkarProgress;
}

export interface AzkarStatusData {
    [azkarName: string]: boolean; // isCompleted
}

export interface Settings {
  quranGoal: number;
  notifications: {
      prayers: boolean;
      azkar: boolean;
  };
  azkarMorningStart: string; // e.g., "04:00"
  azkarEveningStart: string; // e.g., "16:00"
  prayerMethod: number;
}

export interface DailyData {
  prayerData: PrayerData;
  nawafilData: NawafilData;
  azkarProgress: AzkarProgressData;
  azkarStatus: AzkarStatusData;
  quranRead: number;
  quranKhatmat: number;
  dailyGoalProgress: { [goalId: string]: boolean }; // for 'daily' type goals
}

export interface AppData {
    [dateKey: string]: Partial<DailyData>;
}

export type ActivePage = 'home' | 'prayers' | 'azkar' | 'quran' | 'more';
export type MorePage = 'stats' | 'challenges' | 'about' | 'support' | 'settings' | 'goals' | 'privacy' | 'terms';

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

export interface UserChallenge {
  id: string;
  title: string;
  desc: string;
  icon: string;
  progress: number;
  total: number;
  reward: string;
  status: 'active' | 'available' | 'completed';
}

export interface Wisdom {
    id: string;
    text: string;
    source: string;
    type: 'quran' | 'hadith' | 'dua' | 'monthly_wisdom';
}

export interface IslamicOccasion {
    id:string;
    name: string;
    hijriMonth: number;
    hijriDay: number;
    description: string;
    evidence: string;
    isRecurring?: boolean; // For events like White Days
}

export interface HijriMonthInfo {
    name: string;
    number: number;
    year: string;
    definition: string;
    occasions: IslamicOccasion[];
    wisdoms: Wisdom[];
}

export interface HijriYearInfo {
    year: string;
    length: number;
}

export type GoalType = 'daily' | 'target';

export interface PersonalGoal {
  id: string;
  title: string;
  icon: string;
  type: GoalType;
  target: number; // For daily, target is 1. For target, it's the total amount.
  unit?: string; // e.g., 'صفحة', 'مرة'
  endDate?: string; // ISO string 'YYYY-MM-DD'
  createdAt: string; // ISO string
  isArchived: boolean;
  completedAt?: string; // For target goals
}

export interface GoalProgress {
    [goalId: string]: number; // For target goals, this is the current value.
}

export interface AppContextType {
  dailyData: DailyData;
  settings: Settings;
  isDataLoading: boolean;
  dataError: string | null;
  prayerTimes: Record<string, string>;
  updatePrayerStatus: (prayerName: string, status: PrayerFardStatus) => void;
  updateSunnahStatus: (prayerName: string, sunnahType: 'sunnahBefore' | 'sunnahAfter') => void;
  updateNawafilOption: (prayerName: string, optionIndex: number) => void;
  updateQiyamCount: (prayerName: string, change: number) => void;
  getAzkarProgress: (azkarName: string) => number;
  incrementAzkarCount: (azkarName: string, azkarIndex: number) => void;
  completeAzkarGroup: (azkarName: string) => void;
  updateQuranRead: (change: number) => void;
  completeKhatma: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  hijriDate: string;
  gregorianDate: string;
  shortHijriDate: string;
  shortGregorianDate: string;
  dailyDua: { text: string; source: string; };
  nextPrayer: { prayer: Prayer | null, countdown: string, isNextDay: boolean };
  stats: UserStats;
  weeklyPrayerCounts: { day: string; count: number; }[];
  dailyWisdom: Wisdom | null;
  hijriYearInfo: HijriYearInfo | null;
  currentHijriMonthInfo: HijriMonthInfo | null;
  nextIslamicOccasion: IslamicOccasion | null;
  
  // Goals
  personalGoals: PersonalGoal[];
  goalProgress: GoalProgress;
  addPersonalGoal: (goal: Omit<PersonalGoal, 'id' | 'createdAt' | 'isArchived' | 'completedAt'>) => void;
  updatePersonalGoal: (goalId: string, updates: Partial<PersonalGoal>) => void;
  archivePersonalGoal: (goalId: string) => void;
  updateTargetGoalProgress: (goalId: string, newValue: number) => void;
  toggleDailyGoalCompletion: (goalId: string) => void;
  deletePersonalGoal: (goalId: string) => void;

  // Location
  coordinates: { lat: number; lon: number } | null;
  locationError: string | null;
  detectLocation: () => void;

  // Notifications
  notification: { message: string; icon: string } | null;
  showNotification: (message: string, icon: string) => void;

  // Data Management
  resetAllData: () => Promise<void>;
}

// AI Feature Types
export interface VerseReflection {
    reflection: string;
    actionable_tip: string;
}

export interface PersonalizedDua {
    dua: string;
    source_info: string;
}