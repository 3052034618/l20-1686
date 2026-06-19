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
    share: boolean;
    reading: number;
    readingTarget: number;
  };
  claimedTasks: {
    date: string;
    tasks: ('checkIn' | 'share' | 'reading')[];
  };
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
  usedDate?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  todayChecked: boolean;
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
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
