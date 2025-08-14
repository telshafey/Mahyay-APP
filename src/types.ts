import type { Dispatch, SetStateAction } from 'react';

export interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  logout: () => void;
  loginAsGuest: () => void;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  renderGoogleButton: (element: HTMLElement) => void;
  updateUserProfile: (name: string) => void;
  updateUserProfilePicture: () => void;
  deleteAccount: () => void;
  getAllUsersForAdmin: () => (User & { id: string; email?: string | undefined; })[];
  updateUserForAdmin: (userId: string, newName: string, newEmail?: string) => void;
  deleteUserForAdmin: (userId: string) => void;
}

export interface SunnahInfo {
  count: number;
  evidence: string;
}

export interface Prayer {
  name: string;
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
}

export interface DailyData {
  prayerData: PrayerData;
  nawafilData: NawafilData;
  azkarProgress: AzkarProgressData;
  azkarStatus: AzkarStatusData;
  quranRead: number;
  quranKhatmat: number;
}

export interface AppData {
    [dateKey: string]: Partial<DailyData>;
}

export type ActivePage = 'home' | 'prayers' | 'azkar' | 'quran' | 'more';
export type MorePage = 'stats' | 'challenges' | 'about' | 'support' | 'settings';

export interface UserStats {
  totalPoints: number;
  streak: number;
  weeklyPrayers: number;
  monthlyPrayers: number;
  quranPages: number;
  completedAzkar: number;
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

export interface CommunityUser {
  id: string;
  name: string;
  picture: string;
}

export type GroupType = 'family' | 'friends';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  members: CommunityUser[];
  createdBy: string;
}

export interface Invitation {
  id: string;
  fromUser: CommunityUser;
  toUserId: string;
  groupId: string;
  groupName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface GroupSharingSettings {
    activity: boolean;
    stats: boolean;
    challenges: boolean;
}

export interface GroupActivity {
    id: string;
    user: CommunityUser;
    message: string;
    icon: string;
    timestamp: Date;
    groupId: string;
}

export interface Wisdom {
    id: string;
    text: string;
    source: string;
    type: 'quran' | 'hadith' | 'dua' | 'monthly_wisdom';
}

export interface IslamicOccasion {
    id: string;
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

export interface AppContextType {
  dailyData: DailyData;
  settings: Settings;
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
  dailyDua: { text: string; source: string; };
  nextPrayer: { prayer: Prayer | null, countdown: string, isNextDay: boolean };
  stats: UserStats;

  // Wisdom & Hijri Year
  dailyWisdom: Wisdom | null;
  hijriYearInfo: HijriYearInfo | null;

  // Islamic Calendar
  currentHijriMonthInfo: HijriMonthInfo | null;
  nextIslamicOccasion: IslamicOccasion | null;

  // Community Features
  friends: CommunityUser[];
  groups: Group[];
  invitations: Invitation[];
  discoverableUsers: CommunityUser[];
  sharingSettings: Record<string, GroupSharingSettings>;
  addFriend: (friendId: string) => void;
  createGroup: (name: string, type: GroupType, memberIds: string[]) => void;
  respondToInvitation: (invitationId: string, response: 'accepted' | 'declined') => void;
  updateSharingSettings: (groupId: string, settings: GroupSharingSettings) => void;
  getGroupFeed: (group: Group) => GroupActivity[];
  getGroupMemberStats: (userId: string) => UserStats;
  getGroupMemberChallenges: (userId: string) => UserChallenge[];

  // Data Management
  exportData: () => void;
  importData: (file: File) => void;
  resetAllData: () => void;
}

// A generic state action for useReducer
export type Action<T> = { type: 'SET'; payload: T };