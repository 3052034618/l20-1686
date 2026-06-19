import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  Coupon,
  Team,
  ReadingRecord,
  Badge,
  ToastMessage,
  TeamMember,
} from '@/types';
import { categories } from '@/data/categories';
import { comics } from '@/data/comics';
import { badgeTemplates } from '@/data/badges';
import {
  createCoupon,
  generateId,
  getAvailableCoupons,
  calculateTotalSaved,
} from '@/utils/coupon';
import { getToday, isYesterday, formatDate, daysUntil } from '@/utils/date';

interface AppState {
  user: User;
  coupons: Coupon[];
  teams: Team[];
  currentTeam: Team | null;
  readingRecords: ReadingRecord[];
  badges: Badge[];
  toasts: ToastMessage[];
  showCategorySelector: boolean;
  showCouponModal: boolean;
  newCoupon: Coupon | null;

  setShowCategorySelector: (show: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  confirmCategories: () => void;

  checkIn: () => void;
  shareChapter: () => void;
  readChapter: (comicId: string, chapters: number) => void;
  claimTaskReward: (taskType: 'checkIn' | 'share' | 'reading') => void;

  createTeam: (name: string) => void;
  joinTeam: (code: string) => void;
  leaveTeam: () => void;
  teamCheckIn: () => void;
  claimTeamReward: () => void;

  useCoupon: (couponId: string, comicId: string) => void;

  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  setShowCouponModal: (show: boolean, coupon?: Coupon | null) => void;

  checkBadges: () => void;
}

const mockUser: User = {
  id: 'user-001',
  name: '漫迷小王',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manga',
  selectedCategories: [],
  continuousCheckInDays: 0,
  lastCheckInDate: '',
  totalSaved: 0,
  todayTasks: {
    checkIn: false,
    share: false,
    reading: 0,
    readingTarget: 3,
  },
};

const mockMembers: TeamMember[] = [
  {
    id: 'member-001',
    name: '漫迷小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manga',
    todayChecked: false,
  },
  {
    id: 'member-002',
    name: '二次元少女',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anime',
    todayChecked: true,
  },
  {
    id: 'member-003',
    name: '热血少年',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shounen',
    todayChecked: false,
  },
];

const mockTeam: Team = {
  id: 'team-001',
  name: '漫协追番小分队',
  code: 'MANGA2024',
  members: mockMembers,
  targetDays: 7,
  currentDays: 3,
  startDate: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
  rewardUnlocked: false,
  rewardAmount: 20,
};

const mockRecords: ReadingRecord[] = [
  {
    id: 'record-001',
    userId: 'user-001',
    comicId: 'comic-001',
    comicTitle: '热血少年王',
    comicCover: comics[0].cover,
    chaptersRead: 5,
    savedAmount: 2.5,
    readDate: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    category: '热血',
  },
  {
    id: 'record-002',
    userId: 'user-001',
    comicId: 'comic-002',
    comicTitle: '樱花下落的速度',
    comicCover: comics[1].cover,
    chaptersRead: 3,
    savedAmount: 1.2,
    readDate: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    category: '恋爱',
  },
];

const initializeBadges = (userId: string): Badge[] => {
  return badgeTemplates.map((template) => ({
    ...template,
    userId,
    unlocked: false,
  }));
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: mockUser,
      coupons: [],
      teams: [mockTeam],
      currentTeam: null,
      readingRecords: mockRecords,
      badges: initializeBadges(mockUser.id),
      toasts: [],
      showCategorySelector: true,
      showCouponModal: false,
      newCoupon: null,

      setShowCategorySelector: (show) => set({ showCategorySelector: show }),

      toggleCategory: (categoryId) => {
        set((state) => ({
          user: {
            ...state.user,
            selectedCategories: state.user.selectedCategories.includes(
              categoryId
            )
              ? state.user.selectedCategories.filter((id) => id !== categoryId)
              : [...state.user.selectedCategories, categoryId],
          },
        }));
      },

      confirmCategories: () => {
        set({ showCategorySelector: false });
        get().checkBadges();
        get().addToast('success', '已保存你的偏好分类！');
      },

      checkIn: () => {
        const { user } = get();
        const today = getToday();

        if (user.todayTasks.checkIn) {
          get().addToast('info', '今天已经签到过啦~');
          return;
        }

        let continuousDays = user.continuousCheckInDays;
        if (isYesterday(user.lastCheckInDate)) {
          continuousDays += 1;
        } else if (user.lastCheckInDate !== today) {
          continuousDays = 1;
        }

        set((state) => ({
          user: {
            ...state.user,
            continuousCheckInDays: continuousDays,
            lastCheckInDate: today,
            todayTasks: {
              ...state.user.todayTasks,
              checkIn: true,
            },
          },
        }));

        get().addToast('success', `签到成功！连续签到 ${continuousDays} 天`);
        get().checkBadges();
      },

      shareChapter: () => {
        const { user } = get();

        if (user.todayTasks.share) {
          get().addToast('info', '今天已经分享过啦~');
          return;
        }

        set((state) => ({
          user: {
            ...state.user,
            todayTasks: {
              ...state.user.todayTasks,
              share: true,
            },
          },
        }));

        get().addToast('success', '分享成功！感谢推广正版阅读~');
        get().checkBadges();
      },

      readChapter: (comicId, chapters) => {
        const comic = comics.find((c) => c.id === comicId);
        if (!comic) return;

        const category = categories.find((c) => c.id === comic.categoryId);

        set((state) => {
          const newReading = Math.min(
            state.user.todayTasks.reading + chapters,
            state.user.todayTasks.readingTarget
          );

          const savedAmount = chapters * comic.pricePerChapter;

          const newRecord: ReadingRecord = {
            id: generateId(),
            userId: state.user.id,
            comicId,
            comicTitle: comic.title,
            comicCover: comic.cover,
            chaptersRead: chapters,
            savedAmount,
            readDate: getToday(),
            category: category?.name || '',
          };

          return {
            user: {
              ...state.user,
              todayTasks: {
                ...state.user.todayTasks,
                reading: newReading,
              },
              totalSaved: state.user.totalSaved + savedAmount,
            },
            readingRecords: [newRecord, ...state.readingRecords],
          };
        });

        get().addToast('success', `阅读了 ${chapters} 章 ${comic.title}！`);
        get().checkBadges();
      },

      claimTaskReward: (taskType) => {
        const { user, coupons } = get();
        const categoryName =
          categories.find((c) => c.id === user.selectedCategories[0])?.name ||
          '通用';

        let amount = 0;
        let couponType: 'daily' | 'share' | 'reading' = 'daily';

        switch (taskType) {
          case 'checkIn':
            if (!user.todayTasks.checkIn) {
              get().addToast('error', '请先完成签到任务');
              return;
            }
            amount = user.continuousCheckInDays >= 7 ? 3 : 1;
            couponType = 'daily';
            break;
          case 'share':
            if (!user.todayTasks.share) {
              get().addToast('error', '请先完成分享任务');
              return;
            }
            amount = 2;
            couponType = 'share';
            break;
          case 'reading':
            if (user.todayTasks.reading < user.todayTasks.readingTarget) {
              get().addToast('error', '阅读章节数还不够哦');
              return;
            }
            amount = 5;
            couponType = 'reading';
            break;
        }

        const coupon = createCoupon(user.id, amount, couponType, categoryName);

        set({
          coupons: [...coupons, coupon],
          newCoupon: coupon,
          showCouponModal: true,
        });

        get().addToast('success', `获得 ${amount} 元阅读券！`);
        get().checkBadges();
      },

      createTeam: (name) => {
        const { user, teams } = get();

        if (get().currentTeam) {
          get().addToast('error', '你已经在一个队伍中了');
          return;
        }

        const code = 'MANGA' + Math.random().toString(36).substr(2, 4).toUpperCase();

        const newMember: TeamMember = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          todayChecked: false,
        };

        const newTeam: Team = {
          id: generateId(),
          name,
          code,
          members: [newMember],
          targetDays: 7,
          currentDays: 0,
          startDate: getToday(),
          rewardUnlocked: false,
          rewardAmount: 20,
        };

        set({
          teams: [...teams, newTeam],
          currentTeam: newTeam,
        });

        get().addToast('success', `队伍创建成功！队伍码：${code}`);
        get().checkBadges();
      },

      joinTeam: (code) => {
        const { user, teams } = get();

        if (get().currentTeam) {
          get().addToast('error', '你已经在一个队伍中了');
          return;
        }

        const team = teams.find((t) => t.code.toUpperCase() === code.toUpperCase());
        if (!team) {
          get().addToast('error', '队伍码无效，请检查后重试');
          return;
        }

        if (team.members.length >= 5) {
          get().addToast('error', '队伍已满（最多5人）');
          return;
        }

        if (team.members.some((m) => m.id === user.id)) {
          get().addToast('error', '你已经在这个队伍中了');
          return;
        }

        const newMember: TeamMember = {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          todayChecked: false,
        };

        const updatedTeam = {
          ...team,
          members: [...team.members, newMember],
        };

        set({
          teams: teams.map((t) => (t.id === team.id ? updatedTeam : t)),
          currentTeam: updatedTeam,
        });

        get().addToast('success', `成功加入队伍「${team.name}」！`);
        get().checkBadges();
      },

      leaveTeam: () => {
        const { currentTeam, user, teams } = get();
        if (!currentTeam) return;

        const updatedMembers = currentTeam.members.filter((m) => m.id !== user.id);
        const updatedTeam = { ...currentTeam, members: updatedMembers };

        set({
          teams: teams.map((t) =>
            t.id === currentTeam.id
              ? updatedMembers.length > 0
                ? updatedTeam
                : null
              : t
          ).filter(Boolean) as Team[],
          currentTeam: null,
        });

        get().addToast('info', '已离开队伍');
      },

      teamCheckIn: () => {
        const { currentTeam, user } = get();
        if (!currentTeam) return;

        const member = currentTeam.members.find((m) => m.id === user.id);
        if (member?.todayChecked) {
          get().addToast('info', '今天已经在队伍中打卡过了');
          return;
        }

        const updatedMembers = currentTeam.members.map((m) =>
          m.id === user.id ? { ...m, todayChecked: true } : m
        );

        const allChecked = updatedMembers.every((m) => m.todayChecked);
        let newCurrentDays = currentTeam.currentDays;
        let rewardUnlocked = currentTeam.rewardUnlocked;

        if (allChecked) {
          newCurrentDays += 1;
          if (newCurrentDays >= currentTeam.targetDays) {
            rewardUnlocked = true;
          }
        }

        const updatedTeam = {
          ...currentTeam,
          members: updatedMembers,
          currentDays: newCurrentDays,
          rewardUnlocked,
        };

        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === currentTeam.id ? updatedTeam : t
          ),
          currentTeam: updatedTeam,
        }));

        get().addToast('success', '队伍打卡成功！');

        if (allChecked) {
          get().addToast(
            'success',
            `全队今日都打卡了！累计 ${newCurrentDays}/${currentTeam.targetDays} 天`
          );
        }

        if (rewardUnlocked) {
          get().addToast('success', '🎉 组队任务完成！可以领取全队奖励了！');
        }
      },

      claimTeamReward: () => {
        const { currentTeam, user, coupons } = get();
        if (!currentTeam || !currentTeam.rewardUnlocked) {
          get().addToast('error', '奖励还未解锁哦');
          return;
        }

        const categoryName =
          categories.find((c) => c.id === user.selectedCategories[0])?.name ||
          '通用';

        const coupon = createCoupon(
          user.id,
          currentTeam.rewardAmount,
          'team',
          categoryName,
          14
        );

        set({
          coupons: [...coupons, coupon],
          newCoupon: coupon,
          showCouponModal: true,
        });

        get().addToast(
          'success',
          `获得全队奖励 ${currentTeam.rewardAmount} 元阅读券！`
        );
        get().checkBadges();
      },

      useCoupon: (couponId, comicId) => {
        const { coupons, user } = get();
        const coupon = coupons.find((c) => c.id === couponId);
        const comic = comics.find((c) => c.id === comicId);

        if (!coupon || !comic) return;
        if (coupon.isUsed) {
          get().addToast('error', '这张券已经用过了');
          return;
        }

        const category = categories.find((c) => c.id === comic.categoryId);

        const updatedCoupons = coupons.map((c) =>
          c.id === couponId
            ? { ...c, isUsed: true, usedForComic: comic.title, usedDate: getToday() }
            : c
        );

        const newRecord: ReadingRecord = {
          id: generateId(),
          userId: user.id,
          comicId,
          comicTitle: comic.title,
          comicCover: comic.cover,
          chaptersRead: Math.floor(coupon.amount / comic.pricePerChapter),
          savedAmount: coupon.amount,
          readDate: getToday(),
          category: category?.name || '',
        };

        set({
          coupons: updatedCoupons,
          readingRecords: [newRecord, ...get().readingRecords],
          user: {
            ...get().user,
            totalSaved: get().user.totalSaved + coupon.amount,
          },
        });

        get().addToast('success', `使用券阅读了 ${comic.title}！`);
        get().checkBadges();
      },

      addToast: (type, message) => {
        const toast: ToastMessage = {
          id: generateId(),
          type,
          message,
        };
        set((state) => ({
          toasts: [...state.toasts, toast],
        }));

        setTimeout(() => {
          get().removeToast(toast.id);
        }, 3000);
      },

      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      setShowCouponModal: (show, coupon = null) => {
        set({ showCouponModal: show, newCoupon: coupon });
      },

      checkBadges: () => {
        const { user, coupons, readingRecords, currentTeam, badges } = get();

        const usedCoupons = coupons.filter((c) => c.isUsed);
        const uniqueComics = new Set(usedCoupons.map((c) => c.usedForComic)).size;
        const totalChapters = readingRecords.reduce(
          (sum, r) => sum + r.chaptersRead,
          0
        );
        const totalSaved = calculateTotalSaved(coupons);
        const shareCount = coupons.filter((c) => c.type === 'share').length;

        const updatedBadges = badges.map((badge) => {
          if (badge.unlocked) return badge;

          let unlocked = false;

          switch (badge.id) {
            case 'badge-001':
              unlocked = user.continuousCheckInDays >= 1;
              break;
            case 'badge-002':
              unlocked = user.continuousCheckInDays >= 7;
              break;
            case 'badge-003':
              unlocked = user.continuousCheckInDays >= 30;
              break;
            case 'badge-004':
              unlocked = shareCount >= 10;
              break;
            case 'badge-005':
              unlocked = totalChapters >= 10;
              break;
            case 'badge-006':
              unlocked = totalChapters >= 100;
              break;
            case 'badge-007':
              unlocked = currentTeam !== null;
              break;
            case 'badge-008':
              unlocked =
                currentTeam !== null &&
                currentTeam.rewardUnlocked &&
                currentTeam.members[0]?.id === user.id;
              break;
            case 'badge-009':
              unlocked = uniqueComics >= 5;
              break;
            case 'badge-010':
              unlocked = totalSaved >= 100;
              break;
            case 'badge-011':
              unlocked = user.selectedCategories.length >= 6;
              break;
            case 'badge-012':
              unlocked = badges.filter((b) => b.unlocked).length >= badges.length - 1;
              break;
          }

          if (unlocked) {
            setTimeout(() => {
              get().addToast('success', `🎉 解锁徽章：${badge.name}！`);
            }, 500);
            return { ...badge, unlocked: true, unlockedAt: getToday() };
          }

          return badge;
        });

        set({ badges: updatedBadges });
      },
    }),
    {
      name: 'manga-supply-station',
      partialize: (state) => ({
        user: state.user,
        coupons: state.coupons,
        teams: state.teams,
        currentTeam: state.currentTeam,
        readingRecords: state.readingRecords,
        badges: state.badges,
      }),
    }
  )
);
