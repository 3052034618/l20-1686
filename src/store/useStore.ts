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
  TeamDailyRecord,
  CartItem,
} from '@/types';
import { categories } from '@/data/categories';
import { comics } from '@/data/comics';
import { badgeTemplates } from '@/data/badges';
import {
  createCoupon,
  generateId,
  calculateTotalSaved,
} from '@/utils/coupon';
import { getToday, isYesterday, formatDate, getWeekKey } from '@/utils/date';

const randomMemberPool = [
  { name: '二次元少女', seed: 'anime' },
  { name: '热血少年', seed: 'shounen' },
  { name: '推理迷', seed: 'detective' },
  { name: '奇幻旅人', seed: 'fantasy' },
  { name: '笑点担当', seed: 'comedy' },
  { name: '运动健将', seed: 'sports' },
  { name: '画师小梦', seed: 'artist' },
  { name: '漫社社长', seed: 'president' },
];

const weeklyRewardAmounts = {
  checkIn: 10,
  share: 10,
  reading: 15,
};

const weeklyTargets = {
  checkIn: 7,
  share: 7,
  reading: 7,
};

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

  weeklyRewardAmounts: typeof weeklyRewardAmounts;
  weeklyTargets: typeof weeklyTargets;

  refreshDailyState: () => void;
  setShowCategorySelector: (show: boolean) => void;
  toggleCategory: (categoryId: string) => void;
  confirmCategories: () => void;

  checkIn: () => void;
  shareChapter: () => void;
  readChapter: (comicId: string, chapters: number) => void;
  claimTaskReward: (taskType: 'checkIn' | 'share' | 'reading') => void;
  claimWeeklyReward: (taskType: 'checkIn' | 'share' | 'reading') => void;

  createTeam: (name: string) => void;
  joinTeam: (code: string) => void;
  leaveTeam: () => void;
  teamCheckIn: () => void;
  claimTeamReward: () => void;
  inviteRandomMember: () => void;
  simulateTeamMemberCheckIn: (memberId: string) => void;
  simulateTeamMemberReading: (memberId: string, chapters: number) => void;
  useCaptainDailySupply: (targetMemberId: string, action: 'checkIn' | 'reading') => void;

  useCoupon: (couponId: string, comicId: string, chapters: number) => void;
  useCouponWithCart: (couponId: string, cart: CartItem[]) => void;

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
  lastActiveDate: getToday(),
  todayTasks: {
    checkIn: false,
    checkInTime: '',
    share: false,
    shareTime: '',
    reading: 0,
    readingTime: '',
    readingTarget: 3,
    weeklyCounted: {
      checkIn: false,
      share: false,
      reading: false,
    },
  },
  claimedTasks: {
    date: '',
    tasks: [],
  },
  weeklyTasks: {
    weekKey: '',
    checkInDays: 0,
    shareDays: 0,
    readingDays: 0,
    claimedWeeks: [],
  },
};

const mockMembers: TeamMember[] = [
  {
    id: 'member-001',
    name: '漫迷小王',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manga',
    todayChecked: false,
    todayReadingChapters: 0,
  },
  {
    id: 'member-002',
    name: '二次元少女',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anime',
    todayChecked: true,
    todayReadingChapters: 0,
  },
  {
    id: 'member-003',
    name: '热血少年',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shounen',
    todayChecked: false,
    todayReadingChapters: 0,
  },
];

const generateMockDailyHistory = (): TeamDailyRecord[] => {
  const history: TeamDailyRecord[] = [];
  const baseMembers = [
    { memberId: 'member-001', memberName: '漫迷小王', memberAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manga' },
    { memberId: 'member-002', memberName: '二次元少女', memberAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anime' },
    { memberId: 'member-003', memberName: '热血少年', memberAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shounen' },
  ];

  for (let i = 6; i >= 1; i--) {
    const date = formatDate(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const hasCaptainSupply = Math.random() > 0.6;
    const members = baseMembers.map((m, idx) => {
      const checkedIn = Math.random() > 0.3;
      const readingChapters = checkedIn ? Math.floor(Math.random() * 5) + 1 : 0;
      const isCapSupply = hasCaptainSupply && idx === 2;
      return {
        ...m,
        checkedIn,
        checkInSource: checkedIn ? (isCapSupply ? 'captain' as const : 'self' as const) : undefined,
        readingChapters,
        readingSource: readingChapters > 0 ? (isCapSupply ? 'captain' as const : 'self' as const) : undefined,
      };
    });
    const allChecked = members.every((m) => m.checkedIn);
    history.push({ date, members, allChecked, captainSupplyUsed: hasCaptainSupply });
  }

  return history;
};

const mockTeam: Team = {
  id: 'team-001',
  name: '漫协追番小分队',
  code: 'MANGA2024',
  members: mockMembers,
  targetDays: 7,
  currentDays: 3,
  startDate: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
  rewardUnlocked: false,
  rewardClaimed: false,
  rewardAmount: 20,
  lastTeamCheckDate: '',
  dailyHistory: generateMockDailyHistory(),
  captainDailySupplyUsed: false,
  captainSupplyUsedDate: '',
  captainSupplyLog: [],
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
    couponType: 'daily',
    couponId: 'coupon-mock-001',
    totalPrice: 2.5,
    couponAmount: 2.5,
    selfPayAmount: 0,
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
    totalPrice: 1.2,
    couponAmount: 0,
    selfPayAmount: 1.2,
  },
];

const initializeBadges = (userId: string): Badge[] => {
  return badgeTemplates.map((template) => ({
    ...template,
    userId,
    unlocked: false,
  }));
};

const refreshDailyTasks = (user: User): User => {
  const today = getToday();
  const currentWeekKey = getWeekKey(today);

  if (user.claimedTasks.date !== today) {
    let continuousDays = user.continuousCheckInDays;
    if (user.lastCheckInDate && !isYesterday(user.lastCheckInDate) && user.lastCheckInDate !== today) {
      continuousDays = 0;
    }

    let weeklyTasks = { ...user.weeklyTasks };

    if (weeklyTasks.weekKey !== currentWeekKey) {
      weeklyTasks = {
        weekKey: currentWeekKey,
        checkInDays: 0,
        shareDays: 0,
        readingDays: 0,
        claimedWeeks: weeklyTasks.claimedWeeks,
      };
    }

    return {
      ...user,
      lastActiveDate: today,
      continuousCheckInDays: continuousDays,
      todayTasks: {
        checkIn: false,
        checkInTime: '',
        share: false,
        shareTime: '',
        reading: 0,
        readingTime: '',
        readingTarget: 3,
        weeklyCounted: {
          checkIn: false,
          share: false,
          reading: false,
        },
      },
      claimedTasks: {
        date: today,
        tasks: [],
      },
      weeklyTasks,
    };
  }

  return user;
};

const refreshTeamDailyState = (team: Team): Team => {
  const today = getToday();

  if (team.lastTeamCheckDate !== today) {
    const yesterdayMembers = team.members.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      memberAvatar: m.avatar,
      checkedIn: m.todayChecked,
      readingChapters: m.todayReadingChapters || 0,
      checkInSource: m.checkInSource,
      readingSource: m.readingSource,
    }));
    const allChecked = yesterdayMembers.every((m) => m.checkedIn);

    const yesterdayRecord: TeamDailyRecord = {
      date: team.lastTeamCheckDate || getToday(),
      members: yesterdayMembers,
      allChecked,
      captainSupplyUsed: team.captainDailySupplyUsed,
    };

    let newDailyHistory = [...team.dailyHistory];
    if (team.lastTeamCheckDate) {
      newDailyHistory = [yesterdayRecord, ...team.dailyHistory].slice(0, 14);
    }

    const refreshedMembers = team.members.map((m) => ({
      ...m,
      todayChecked: false,
      todayReadingChapters: 0,
      checkInSource: undefined,
      readingSource: undefined,
    }));

    return {
      ...team,
      members: refreshedMembers,
      lastTeamCheckDate: today,
      dailyHistory: newDailyHistory,
      captainDailySupplyUsed: false,
      captainSupplyUsedDate: '',
    };
  }

  return team;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      const initialUser = refreshDailyTasks(mockUser);
      const initialTeams = [mockTeam].map(refreshTeamDailyState);

      return {
      user: initialUser,
      coupons: [],
      teams: initialTeams,
      currentTeam: null,
      readingRecords: mockRecords,
      badges: initializeBadges(initialUser.id),
      toasts: [],
      showCategorySelector: true,
      showCouponModal: false,
      newCoupon: null,

      weeklyRewardAmounts,
      weeklyTargets,

      refreshDailyState: () => {
        set((state) => {
          const refreshedUser = refreshDailyTasks(state.user);
          const refreshedTeams = state.teams.map(refreshTeamDailyState);
          const refreshedCurrentTeam = state.currentTeam
            ? refreshTeamDailyState(state.currentTeam)
            : null;

          return {
            user: refreshedUser,
            teams: refreshedTeams,
            currentTeam: refreshedCurrentTeam,
          };
        });
      },

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
        get().refreshDailyState();
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

        set((state) => {
          const shouldCountWeekly = !state.user.todayTasks.weeklyCounted.checkIn;
          const newWeeklyDays = shouldCountWeekly
            ? state.user.weeklyTasks.checkInDays + 1
            : state.user.weeklyTasks.checkInDays;

          return {
            user: {
              ...state.user,
              continuousCheckInDays: continuousDays,
              lastCheckInDate: today,
              todayTasks: {
                ...state.user.todayTasks,
                checkIn: true,
                checkInTime: new Date().toISOString(),
                weeklyCounted: {
                  ...state.user.todayTasks.weeklyCounted,
                  checkIn: true,
                },
              },
              weeklyTasks: {
                ...state.user.weeklyTasks,
                checkInDays: newWeeklyDays,
              },
            },
          };
        });

        get().addToast('success', `签到成功！连续签到 ${continuousDays} 天`);
        get().checkBadges();
      },

      shareChapter: () => {
        get().refreshDailyState();
        const { user } = get();

        if (user.todayTasks.share) {
          get().addToast('info', '今天已经分享过啦~');
          return;
        }

        set((state) => {
          const shouldCountWeekly = !state.user.todayTasks.weeklyCounted.share;
          const newWeeklyDays = shouldCountWeekly
            ? state.user.weeklyTasks.shareDays + 1
            : state.user.weeklyTasks.shareDays;

          return {
            user: {
              ...state.user,
              todayTasks: {
                ...state.user.todayTasks,
                share: true,
                shareTime: new Date().toISOString(),
                weeklyCounted: {
                  ...state.user.todayTasks.weeklyCounted,
                  share: true,
                },
              },
              weeklyTasks: {
                ...state.user.weeklyTasks,
                shareDays: newWeeklyDays,
              },
            },
          };
        });

        get().addToast('success', '分享成功！感谢推广正版阅读~');
        get().checkBadges();
      },

      readChapter: (comicId, chapters) => {
        get().refreshDailyState();
        const comic = comics.find((c) => c.id === comicId);
        if (!comic) return;

        const category = categories.find((c) => c.id === comic.categoryId);

        set((state) => {
          const oldReading = state.user.todayTasks.reading;
          const wasCompleted = oldReading >= state.user.todayTasks.readingTarget;
          const newReading = Math.min(
            oldReading + chapters,
            state.user.todayTasks.readingTarget
          );
          const isNowCompleted = newReading >= state.user.todayTasks.readingTarget;

          const shouldCountWeekly = !wasCompleted && isNowCompleted && !state.user.todayTasks.weeklyCounted.reading;
          const newWeeklyDays = shouldCountWeekly
            ? state.user.weeklyTasks.readingDays + 1
            : state.user.weeklyTasks.readingDays;

          const totalPrice = chapters * comic.pricePerChapter;
          const savedAmount = totalPrice;

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
            totalPrice,
            couponAmount: 0,
            selfPayAmount: totalPrice,
          };

          return {
            user: {
              ...state.user,
              todayTasks: {
                ...state.user.todayTasks,
                reading: newReading,
                readingTime: new Date().toISOString(),
                weeklyCounted: {
                  ...state.user.todayTasks.weeklyCounted,
                  reading: isNowCompleted ? true : state.user.todayTasks.weeklyCounted.reading,
                },
              },
              weeklyTasks: {
                ...state.user.weeklyTasks,
                readingDays: newWeeklyDays,
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
        get().refreshDailyState();
        const { user } = get();

        const today = getToday();
        if (user.claimedTasks.date !== today) {
          set((state) => ({
            user: {
              ...state.user,
              claimedTasks: {
                date: today,
                tasks: [],
              },
            },
          }));
        }

        const currentUser = get().user;
        if (currentUser.claimedTasks.tasks.includes(taskType)) {
          get().addToast('info', '今天已经领取过这个奖励了~');
          return;
        }

        const categoryName =
          categories.find((c) => c.id === currentUser.selectedCategories[0])?.name ||
          '通用';

        let amount = 0;
        let couponType: 'daily' | 'share' | 'reading' = 'daily';

        switch (taskType) {
          case 'checkIn':
            if (!currentUser.todayTasks.checkIn) {
              get().addToast('error', '请先完成签到任务');
              return;
            }
            amount = currentUser.continuousCheckInDays >= 7 ? 3 : 1;
            couponType = 'daily';
            break;
          case 'share':
            if (!currentUser.todayTasks.share) {
              get().addToast('error', '请先完成分享任务');
              return;
            }
            amount = 2;
            couponType = 'share';
            break;
          case 'reading':
            if (currentUser.todayTasks.reading < currentUser.todayTasks.readingTarget) {
              get().addToast('error', '阅读章节数还不够哦');
              return;
            }
            amount = 5;
            couponType = 'reading';
            break;
        }

        const coupon = createCoupon(currentUser.id, amount, couponType, categoryName);

        set((state) => ({
          coupons: [...state.coupons, coupon],
          newCoupon: coupon,
          showCouponModal: true,
          user: {
            ...state.user,
            claimedTasks: {
              date: today,
              tasks: [...state.user.claimedTasks.tasks, taskType],
            },
          },
        }));

        get().addToast('success', `获得 ${amount} 元阅读券！`);
        get().checkBadges();
      },

      claimWeeklyReward: (taskType) => {
        get().refreshDailyState();
        const { user } = get();
        const currentWeekKey = getWeekKey(getToday());

        if (user.weeklyTasks.weekKey !== currentWeekKey) {
          get().addToast('error', '本周数据异常，请刷新后重试');
          return;
        }

        const weekKeyWithType = `${currentWeekKey}-${taskType}`;
        if (user.weeklyTasks.claimedWeeks.includes(weekKeyWithType)) {
          get().addToast('info', '本周已经领取过这个奖励了~');
          return;
        }

        let progress = 0;
        switch (taskType) {
          case 'checkIn':
            progress = user.weeklyTasks.checkInDays;
            break;
          case 'share':
            progress = user.weeklyTasks.shareDays;
            break;
          case 'reading':
            progress = user.weeklyTasks.readingDays;
            break;
        }

        if (progress < weeklyTargets[taskType]) {
          get().addToast('error', `本周进度不够哦，还差 ${weeklyTargets[taskType] - progress} 天`);
          return;
        }

        const categoryName =
          categories.find((c) => c.id === user.selectedCategories[0])?.name ||
          '通用';

        const amount = weeklyRewardAmounts[taskType];
        const coupon = createCoupon(user.id, amount, taskType === 'checkIn' ? 'daily' : taskType, categoryName, 30);

        set((state) => ({
          coupons: [...state.coupons, coupon],
          newCoupon: coupon,
          showCouponModal: true,
          user: {
            ...state.user,
            weeklyTasks: {
              ...state.user.weeklyTasks,
              claimedWeeks: [...state.user.weeklyTasks.claimedWeeks, weekKeyWithType],
            },
          },
        }));

        get().addToast('success', `获得周任务奖励 ${amount} 元阅读券！`);
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
          todayReadingChapters: 0,
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
          rewardClaimed: false,
          rewardAmount: 20,
          lastTeamCheckDate: getToday(),
          dailyHistory: [],
          captainDailySupplyUsed: false,
          captainSupplyUsedDate: '',
          captainSupplyLog: [],
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
          todayReadingChapters: 0,
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
        get().refreshDailyState();
        const { currentTeam, user } = get();
        if (!currentTeam) return;

        const member = currentTeam.members.find((m) => m.id === user.id);
        if (member?.todayChecked) {
          get().addToast('info', '今天已经在队伍中打卡过了');
          return;
        }

        const memberCount = currentTeam.members.length;
        const minMembers = 3;
        const needsMore = minMembers - memberCount;

        const updatedMembers = currentTeam.members.map((m) =>
          m.id === user.id ? { ...m, todayChecked: true, checkInSource: 'self' as const } : m
        );

        const allChecked = updatedMembers.every((m) => m.todayChecked);
        let newCurrentDays = currentTeam.currentDays;
        let rewardUnlocked = currentTeam.rewardUnlocked;

        if (allChecked && memberCount >= minMembers) {
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

        if (memberCount < minMembers) {
          get().addToast(
            'info',
            `队伍还差 ${needsMore} 人才能解锁全队奖励进度，快邀请小伙伴加入吧！`
          );
        } else if (allChecked) {
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
        get().refreshDailyState();
        const { currentTeam, user, coupons, teams } = get();
        if (!currentTeam || !currentTeam.rewardUnlocked) {
          get().addToast('error', '奖励还未解锁哦');
          return;
        }

        if (currentTeam.rewardClaimed) {
          get().addToast('info', '全队奖励已经领取过了~');
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

        const updatedTeam = {
          ...currentTeam,
          rewardClaimed: true,
        };

        set({
          coupons: [...coupons, coupon],
          newCoupon: coupon,
          showCouponModal: true,
          teams: teams.map((t) =>
            t.id === currentTeam.id ? updatedTeam : t
          ),
          currentTeam: updatedTeam,
        });

        get().addToast(
          'success',
          `获得全队奖励 ${currentTeam.rewardAmount} 元阅读券！`
        );
        get().checkBadges();
      },

      inviteRandomMember: () => {
        const { currentTeam, user } = get();
        if (!currentTeam) {
          get().addToast('error', '你还没有加入队伍');
          return;
        }

        if (currentTeam.members[0]?.id !== user.id) {
          get().addToast('error', '只有队长才能邀请成员');
          return;
        }

        if (currentTeam.members.length >= 5) {
          get().addToast('error', '队伍已满（最多5人）');
          return;
        }

        const existingNames = new Set(currentTeam.members.map((m) => m.name));
        const available = randomMemberPool.filter((p) => !existingNames.has(p.name));
        if (available.length === 0) {
          get().addToast('info', '没有更多可邀请的成员了');
          return;
        }

        const pick = available[Math.floor(Math.random() * available.length)];
        const newMember: TeamMember = {
          id: generateId(),
          name: pick.name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pick.seed}`,
          todayChecked: false,
          todayReadingChapters: 0,
        };

        const updatedTeam = {
          ...currentTeam,
          members: [...currentTeam.members, newMember],
        };

        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === currentTeam.id ? updatedTeam : t
          ),
          currentTeam: updatedTeam,
        }));

        get().addToast('success', `${pick.name} 加入了队伍！`);
        get().checkBadges();
      },

      simulateTeamMemberCheckIn: (memberId) => {
        get().refreshDailyState();
        const { currentTeam, user } = get();
        if (!currentTeam) return;

        if (currentTeam.members[0]?.id !== user.id) {
          get().addToast('error', '只有队长才能补打卡');
          return;
        }

        const member = currentTeam.members.find((m) => m.id === memberId);
        if (!member) {
          get().addToast('error', '未找到该成员');
          return;
        }

        if (member.todayChecked) {
          get().addToast('info', '该成员今天已经打卡过了');
          return;
        }

        const memberCount = currentTeam.members.length;
        const minMembers = 3;

        const updatedMembers = currentTeam.members.map((m) =>
          m.id === memberId ? { ...m, todayChecked: true, checkInSource: 'captain' as const } : m
        );

        const allChecked = updatedMembers.every((m) => m.todayChecked);
        let newCurrentDays = currentTeam.currentDays;
        let rewardUnlocked = currentTeam.rewardUnlocked;

        if (allChecked && memberCount >= minMembers) {
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

        get().addToast('success', `已为 ${member.name} 补打卡`);

        if (allChecked && memberCount >= minMembers) {
          get().addToast(
            'success',
            `全队今日都打卡了！累计 ${newCurrentDays}/${currentTeam.targetDays} 天`
          );
        }

        if (rewardUnlocked) {
          get().addToast('success', '🎉 组队任务完成！可以领取全队奖励了！');
        }
      },

      simulateTeamMemberReading: (memberId, chapters) => {
        get().refreshDailyState();
        const { currentTeam, user } = get();
        if (!currentTeam) return;

        if (currentTeam.members[0]?.id !== user.id) {
          get().addToast('error', '只有队长才能补阅读');
          return;
        }

        const member = currentTeam.members.find((m) => m.id === memberId);
        if (!member) {
          get().addToast('error', '未找到该成员');
          return;
        }

        const updatedMembers = currentTeam.members.map((m) =>
          m.id === memberId
            ? { ...m, todayReadingChapters: (m.todayReadingChapters || 0) + chapters, readingSource: 'captain' as const }
            : m
        );

        const updatedTeam = {
          ...currentTeam,
          members: updatedMembers,
        };

        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === currentTeam.id ? updatedTeam : t
          ),
          currentTeam: updatedTeam,
        }));

        get().addToast('success', `已为 ${member.name} 补阅读 ${chapters} 章`);
      },

      useCaptainDailySupply: (targetMemberId, action) => {
        get().refreshDailyState();
        const { currentTeam, user } = get();
        if (!currentTeam) {
          get().addToast('error', '你还没有加入队伍');
          return;
        }

        if (currentTeam.members[0]?.id !== user.id) {
          get().addToast('error', '只有队长才能使用补给');
          return;
        }

        const today = getToday();
        if (currentTeam.captainDailySupplyUsed && currentTeam.captainSupplyUsedDate === today) {
          get().addToast('info', '今日补给机会已用完，明天再来吧！');
          return;
        }

        const targetMember = currentTeam.members.find((m) => m.id === targetMemberId);
        if (!targetMember) {
          get().addToast('error', '未找到该成员');
          return;
        }

        const memberCount = currentTeam.members.length;
        const minMembers = 3;
        let pushedProgress = false;

        if (action === 'checkIn') {
          if (targetMember.todayChecked) {
            get().addToast('info', `${targetMember.name} 今天已经打卡过了`);
            return;
          }
        }

        const updatedMembers = currentTeam.members.map((m) => {
          if (m.id === targetMemberId) {
            if (action === 'checkIn') {
              return { ...m, todayChecked: true, checkInSource: 'captain' as const };
            } else {
              return { ...m, todayReadingChapters: (m.todayReadingChapters || 0) + 2, readingSource: 'captain' as const };
            }
          }
          return m;
        });

        const allChecked = updatedMembers.every((m) => m.todayChecked);
        let newCurrentDays = currentTeam.currentDays;
        let rewardUnlocked = currentTeam.rewardUnlocked;

        if (action === 'checkIn' && allChecked && memberCount >= minMembers) {
          pushedProgress = true;
          newCurrentDays += 1;
          if (newCurrentDays >= currentTeam.targetDays) {
            rewardUnlocked = true;
          }
        }

        const newLogEntry = {
          date: today,
          targetMemberId,
          targetMemberName: targetMember.name,
          action,
          pushedProgress,
        };

        const updatedTeam = {
          ...currentTeam,
          members: updatedMembers,
          currentDays: newCurrentDays,
          rewardUnlocked,
          captainDailySupplyUsed: true,
          captainSupplyUsedDate: today,
          captainSupplyLog: [...currentTeam.captainSupplyLog, newLogEntry],
        };

        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === currentTeam.id ? updatedTeam : t
          ),
          currentTeam: updatedTeam,
        }));

        const actionText = action === 'checkIn' ? '打卡' : '阅读';
        get().addToast('success', `已为 ${targetMember.name} 补给${actionText}！今日补给机会已用完`);

        if (pushedProgress) {
          get().addToast(
            'success',
            `全队今日都打卡了！累计 ${newCurrentDays}/${currentTeam.targetDays} 天`
          );
        }

        if (rewardUnlocked) {
          get().addToast('success', '🎉 组队任务完成！可以领取全队奖励了！');
        }
      },

      useCoupon: (couponId, comicId, chapters) => {
        get().useCouponWithCart(couponId, [{ comicId, chapters }]);
      },

      useCouponWithCart: (couponId, cart) => {
        const { coupons, user } = get();
        const coupon = coupons.find((c) => c.id === couponId);

        if (!coupon) return;
        if (coupon.isUsed) {
          get().addToast('error', '这张券已经用过了');
          return;
        }

        if (cart.length === 0) {
          get().addToast('error', '购物车不能为空');
          return;
        }

        const comicPrices = cart.map((item) => {
          const comic = comics.find((c) => c.id === item.comicId);
          if (!comic) return null;
          return {
            item,
            comic,
            itemTotalPrice: item.chapters * comic.pricePerChapter,
          };
        }).filter(Boolean) as Array<{ item: CartItem; comic: typeof comics[0]; itemTotalPrice: number }>;

        if (comicPrices.length !== cart.length) {
          get().addToast('error', '存在无效的作品');
          return;
        }

        const totalPrice = comicPrices.reduce((sum, cp) => sum + cp.itemTotalPrice, 0);
        const couponAmount = Math.min(coupon.amount, totalPrice);
        const remainingAmount = Math.max(0, coupon.amount - totalPrice);
        const totalChapters = cart.reduce((sum, item) => sum + item.chapters, 0);

        const newRecords: ReadingRecord[] = comicPrices.map(({ item, comic, itemTotalPrice }) => {
          const category = categories.find((c) => c.id === comic.categoryId);
          const ratio = totalPrice > 0 ? itemTotalPrice / totalPrice : 0;
          const allocatedCoupon = Math.round(couponAmount * ratio * 100) / 100;

          return {
            id: generateId(),
            userId: user.id,
            comicId: comic.id,
            comicTitle: comic.title,
            comicCover: comic.cover,
            chaptersRead: item.chapters,
            savedAmount: allocatedCoupon,
            readDate: getToday(),
            category: category?.name || '',
            couponType: coupon.type,
            couponId: coupon.id,
            totalPrice: itemTotalPrice,
            couponAmount: allocatedCoupon,
            selfPayAmount: Math.max(0, itemTotalPrice - allocatedCoupon),
          };
        });

        const updatedCoupons = coupons.map((c) =>
          c.id === couponId
            ? { 
                ...c, 
                isUsed: true, 
                usedForComic: cart.length > 1 ? '多部作品' : (comicPrices[0]?.comic.title || ''), 
                usedDate: getToday(), 
                usedChapters: totalChapters,
                remainingAmount: remainingAmount > 0 ? remainingAmount : undefined,
              }
            : c
        );

        set({
          coupons: updatedCoupons,
          readingRecords: [...newRecords, ...get().readingRecords],
          user: {
            ...get().user,
            totalSaved: get().user.totalSaved + couponAmount,
          },
        });

        if (cart.length === 1) {
          get().addToast('success', `使用券阅读了 ${comicPrices[0].comic.title} ${cart[0].chapters} 章！`);
        } else {
          get().addToast('success', `使用券阅读了 ${cart.length} 部作品共 ${totalChapters} 章！`);
        }
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
      };
    },
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
