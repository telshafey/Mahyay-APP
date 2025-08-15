

import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  updateUserProfile: (name: string, picture?: string) => Promise<void>;
  updateUserProfilePicture: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
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
  prayerMethod: number;
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

export interface CommunityUser {
  id: string;
  name: string;
  picture: string;
}

export interface Friend extends CommunityUser {
    status: 'pending' | 'accepted';
    action_by_user_id: string;
}

export type GroupType = 'family' | 'friends';

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  members: CommunityUser[];
  created_by: string;
}

export interface Invitation {
  id: string;
  group_id: string;
  group_name: string;
  inviter_id: string;
  inviter_name: string;
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
  dailyDua: { text: string; source: string; };
  nextPrayer: { prayer: Prayer | null, countdown: string, isNextDay: boolean };
  stats: UserStats;
  weeklyPrayerCounts: { day: string; count: number; }[];
  dailyWisdom: Wisdom | null;
  hijriYearInfo: HijriYearInfo | null;
  currentHijriMonthInfo: HijriMonthInfo | null;
  nextIslamicOccasion: IslamicOccasion | null;
  
  // Location
  coordinates: { lat: number; lon: number } | null;
  locationError: string | null;
  detectLocation: () => void;

  // Notifications
  notification: { message: string; icon: string } | null;

  // Community Features
  isCommunityLoading: boolean;
  friends: Friend[];
  friendRequests: Friend[];
  groups: Group[];
  invitations: Invitation[];
  discoverableUsers: CommunityUser[];
  sharingSettings: Record<string, GroupSharingSettings>;
  addFriend: (friendId: string) => Promise<void>;
  respondToFriendRequest: (friendId: string, response: 'accepted' | 'declined') => Promise<void>;
  createGroup: (name: string, type: GroupType, memberIds: string[]) => Promise<void>;
  respondToInvitation: (invitationId: string, response: 'accepted' | 'declined') => Promise<void>;
  updateSharingSettings: (groupId: string, settings: GroupSharingSettings) => Promise<void>;
  getGroupFeed: (group: Group) => Promise<GroupActivity[]>;
  getGroupMemberStats: (userId: string, groupId: string) => Promise<UserStats | null>;
  getGroupMemberChallenges: (userId: string, groupId: string) => Promise<UserChallenge[] | null>;
  
  // Data Management
  resetAllData: () => Promise<void>;
}