export interface User {
  id: string;
  name: string;
  avatar: string;
  selectedCategories: string[];
  continuousCheckInDays: number;
  lastCheckInDate: string;
  totalSaved: number;
  lastActiveDate: string;
  todayTasks: {
    checkIn: boolean;
    checkInTime?: string;
    share: boolean;
    shareTime?: string;
    reading: number;
    readingTime?: string;
    readingTarget: number;
    weeklyCounted: {
      checkIn: boolean;
      share: boolean;
      reading: boolean;
    };
  };
  claimedTasks: {
    date: string;
    tasks: ('checkIn' | 'share' | 'reading')[];
  };
  weeklyTasks: {
    weekKey: string;
    checkInDays: number;
    shareDays: number;
    readingDays: number;
    claimedWeeks: string[];
  };
}

export interface CartItem {
  comicId: string;
  chapters: number;
}

export type CouponType = 'daily' | 'share' | 'reading' | 'team';

export interface Coupon {
  id: string;
  userId: string;
  amount: number;
  type: CouponType;
  category: string;
  expireDate: string;
  isUsed: boolean;
  usedForComic?: string;
  usedChapters?: number;
  usedDate?: string;
  remainingAmount?: number;
}

export interface TeamDailyRecord {
  date: string;
  members: {
    memberId: string;
    memberName: string;
    memberAvatar: string;
    checkedIn: boolean;
    readingChapters: number;
    checkInSource?: 'self' | 'captain';
    readingSource?: 'self' | 'captain';
  }[];
  allChecked: boolean;
  captainSupplyUsed?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  todayChecked: boolean;
  todayReadingChapters?: number;
  checkInSource?: 'self' | 'captain';
  readingSource?: 'self' | 'captain';
}

export interface CaptainSupplyLogEntry {
  date: string;
  targetMemberId: string;
  targetMemberName: string;
  action: 'checkIn' | 'reading';
  pushedProgress: boolean;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  members: TeamMember[];
  targetDays: number;
  currentDays: number;
  startDate: string;
  rewardUnlocked: boolean;
  rewardClaimed: boolean;
  rewardAmount: number;
  lastTeamCheckDate: string;
  dailyHistory: TeamDailyRecord[];
  captainDailySupplyUsed: boolean;
  captainSupplyUsedDate: string;
  captainSupplyLog: CaptainSupplyLogEntry[];
}

export interface ReadingRecord {
  id: string;
  userId: string;
  comicId: string;
  comicTitle: string;
  comicCover: string;
  chaptersRead: number;
  savedAmount: number;
  readDate: string;
  category: string;
  couponType?: CouponType;
  couponId?: string;
  couponAmount?: number;
  selfPayAmount?: number;
  totalPrice?: number;
}

export interface Badge {
  id: string;
  userId: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export interface Comic {
  id: string;
  title: string;
  cover: string;
  categoryId: string;
  chapters: number;
  pricePerChapter: number;
  description: string;
  author: string;
}

export interface DailyTask {
  id: string;
  type: 'checkIn' | 'share' | 'reading';
  title: string;
  description: string;
  icon: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  completedAt?: string;
}

export interface WeeklyTask {
  type: 'checkIn' | 'share' | 'reading';
  title: string;
  description: string;
  icon: string;
  target: number;
  reward: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
