import { useState, useEffect } from 'react';
import {
  Calendar,
  Flame,
  Settings,
  Sparkles,
  Gift,
  BookOpen,
  Clock,
  Share2,
  TrendingUp,
  Timer,
  Wallet,
  Target,
  Award,
  Trophy,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { categories } from '@/data/categories';
import { comics } from '@/data/comics';
import { DailyTask } from '@/types';
import TaskCard from '@/components/TaskCard';
import CouponCard from '@/components/CouponCard';
import ProgressBar from '@/components/ProgressBar';
import { getAvailableCoupons, getExpiringCoupons } from '@/utils/coupon';
import { getToday, getDaysInMonth, getFirstDayOfMonth } from '@/utils/date';

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `完成于 ${h}:${m}`;
};

const Supply = () => {
  const {
    user,
    coupons,
    checkIn,
    shareChapter,
    readChapter,
    claimTaskReward,
    claimWeeklyReward,
    setShowCategorySelector,
    useCoupon,
    refreshDailyState,
    weeklyTargets,
    weeklyRewardAmounts,
  } = useStore();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [countdown, setCountdown] = useState('');
  const availableCoupons = getAvailableCoupons(coupons);
  const expiringCoupons = getExpiringCoupons(coupons);

  useEffect(() => {
    refreshDailyState();
  }, []);

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = getToday();
    const isClaimed = (taskType: 'checkIn' | 'share' | 'reading') => {
      return (
        user.claimedTasks.date === today &&
        user.claimedTasks.tasks.includes(taskType)
      );
    };

    const dailyTasks: DailyTask[] = [
      {
        id: 'task-checkin',
        type: 'checkIn',
        title: '每日签到',
        description: '每天签到领取阅读券，连续签到奖励更丰厚',
        icon: '📅',
        reward: user.continuousCheckInDays >= 7 ? 3 : 1,
        progress: user.todayTasks.checkIn ? 1 : 0,
        target: 1,
        completed: user.todayTasks.checkIn,
        claimed: isClaimed('checkIn'),
        completedAt: user.todayTasks.checkInTime,
      },
      {
        id: 'task-share',
        type: 'share',
        title: '分享正版章节',
        description: '分享你喜欢的正版漫画章节给好友',
        icon: '📤',
        reward: 2,
        progress: user.todayTasks.share ? 1 : 0,
        target: 1,
        completed: user.todayTasks.share,
        claimed: isClaimed('share'),
        completedAt: user.todayTasks.shareTime,
      },
      {
        id: 'task-reading',
        type: 'reading',
        title: '连续阅读',
        description: `今日阅读 ${user.todayTasks.readingTarget} 章正版漫画`,
        icon: '📖',
        reward: 5,
        progress: user.todayTasks.reading,
        target: user.todayTasks.readingTarget,
        completed: user.todayTasks.reading >= user.todayTasks.readingTarget,
        claimed: isClaimed('reading'),
        completedAt: user.todayTasks.readingTime,
      },
    ];
    setTasks(dailyTasks);
  }, [user.todayTasks, user.continuousCheckInDays, user.claimedTasks]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayDate = today.getDate();

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const selectedCategories = categories.filter((c) =>
    user.selectedCategories.includes(c.id)
  );

  const recommendedComics = comics.filter((c) =>
    user.selectedCategories.includes(c.categoryId)
  );

  const taskRewardMap: Record<string, number> = {
    checkIn: user.continuousCheckInDays >= 7 ? 3 : 1,
    share: 2,
    reading: 5,
  };
  const todayClaimedAmount = user.claimedTasks.tasks.reduce(
    (sum, t) => sum + (taskRewardMap[t] || 0),
    0
  );

  const weeklyTaskList = [
    {
      type: 'checkIn' as const,
      title: '签到挑战',
      description: '本周连续签到7天',
      icon: Target,
      progress: user.weeklyTasks.checkInDays,
      target: weeklyTargets.checkIn,
      reward: weeklyRewardAmounts.checkIn,
      color: 'from-manga-blue to-cyan-500',
    },
    {
      type: 'share' as const,
      title: '分享挑战',
      description: '本周分享7天正版漫画',
      icon: Award,
      progress: user.weeklyTasks.shareDays,
      target: weeklyTargets.share,
      reward: weeklyRewardAmounts.share,
      color: 'from-manga-purple to-purple-500',
    },
    {
      type: 'reading' as const,
      title: '阅读挑战',
      description: '本周完成7天阅读任务',
      icon: Trophy,
      progress: user.weeklyTasks.readingDays,
      target: weeklyTargets.reading,
      reward: weeklyRewardAmounts.reading,
      color: 'from-manga-pink to-rose-500',
    },
  ];

  const isWeeklyClaimed = (taskType: 'checkIn' | 'share' | 'reading') => {
    const weekKeyWithType = `${user.weeklyTasks.weekKey}-${taskType}`;
    return user.weeklyTasks.claimedWeeks.includes(weekKeyWithType);
  };

  const weeklyClaimedAmount = weeklyTaskList.reduce((sum, task) => {
    return sum + (isWeeklyClaimed(task.type) ? task.reward : 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-manga p-8 text-white animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold mb-2 drop-shadow-lg">
                欢迎回来，{user.name}！
              </h1>
              <p className="text-white/80 text-lg">
                今天也要支持正版漫画哦~
              </p>
            </div>
            <button
              onClick={() => setShowCategorySelector(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              <Settings size={18} />
              <span>编辑偏好</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 animate-fade-in-up stagger-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Flame size={20} />
                </div>
                <span className="text-white/80">连续签到</span>
              </div>
              <p className="font-display text-3xl font-bold">
                {user.continuousCheckInDays} 天
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 animate-fade-in-up stagger-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <span className="text-white/80">累计节省</span>
              </div>
              <p className="font-display text-3xl font-bold">
                ¥{user.totalSaved.toFixed(1)}
              </p>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 animate-fade-in-up stagger-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Gift size={20} />
                </div>
                <span className="text-white/80">可用券包</span>
              </div>
              <p className="font-display text-3xl font-bold">
                {availableCoupons.length} 张
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="animate-fade-in-up stagger-1">
          <h2 className="font-display text-2xl font-bold text-dark-800 mb-4 flex items-center gap-2">
            <Sparkles size={24} className="text-primary-500" />
            我的偏好分类
          </h2>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium shadow-lg"
                style={{ backgroundColor: cat.color }}
              >
                <span className="text-xl">{cat.emoji}</span>
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-in-up stagger-2">
        <h2 className="font-display text-2xl font-bold text-dark-800 mb-4 flex items-center gap-2">
          <Calendar size={24} className="text-primary-500" />
          签到日历
        </h2>
        <div className="card p-6">
          <div className="text-center mb-4">
            <h3 className="font-display text-xl font-bold text-dark-800">
              {year}年{month + 1}月
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-dark-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === todayDate;
              const isChecked = day < todayDate;
              const isFuture = day > todayDate;

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-xl font-medium transition-all ${
                    isToday
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-lg scale-110'
                      : isChecked
                      ? 'bg-green-100 text-green-600'
                      : isFuture
                      ? 'text-dark-300'
                      : 'bg-dark-100 text-dark-600'
                  }`}
                >
                  {isChecked ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className={isToday ? 'font-bold' : ''}>{day}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-dark-800 flex items-center gap-2">
            <Gift size={24} className="text-primary-500" />
            今日任务
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-primary-600 font-medium bg-primary-50 px-3 py-1.5 rounded-full">
              <Wallet size={16} />
              <span>已领 ¥{todayClaimedAmount.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-dark-500 bg-dark-50 px-3 py-1.5 rounded-full">
              <Timer size={16} />
              <span className="font-mono tabular-nums">{countdown}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-primary-50 via-white to-purple-50 p-1">
          <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 space-y-3">
            {tasks.map((task, index) => (
              <div key={task.id}>
                <TaskCard
                  task={task}
                  onComplete={
                    task.type === 'checkIn'
                      ? checkIn
                      : task.type === 'share'
                      ? shareChapter
                      : undefined
                  }
                  onClaim={() => claimTaskReward(task.type)}
                  delay={index * 100}
                />
                {task.completed && task.completedAt && (
                  <p className="text-xs text-dark-400 mt-1 ml-[4.5rem] flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(task.completedAt)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-dark-800 flex items-center gap-2">
            <Trophy size={24} className="text-manga-yellow" />
            本周挑战
          </h2>
          <div className="flex items-center gap-1.5 text-manga-purple font-medium bg-purple-50 px-3 py-1.5 rounded-full text-sm">
            <Award size={16} />
            <span>本周已领 ¥{weeklyClaimedAmount.toFixed(1)}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-1">
          <div className="rounded-xl bg-white/80 backdrop-blur-sm p-4 space-y-3">
            {weeklyTaskList.map((task, index) => {
              const Icon = task.icon;
              const isCompleted = task.progress >= task.target;
              const isClaimed = isWeeklyClaimed(task.type);
              const canClaim = isCompleted && !isClaimed;

              return (
                <div
                  key={task.type}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/70 shadow-sm hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${task.color} flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <Icon size={28} className="text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-lg font-bold text-dark-800">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-1 text-manga-blue">
                        <Gift size={16} />
                        <span className="font-bold">+{task.reward}元</span>
                      </div>
                    </div>

                    <p className="text-sm text-dark-500 mb-3">{task.description}</p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar
                          progress={task.progress}
                          total={task.target}
                          color="blue"
                          size="md"
                        />
                        <div className="flex justify-between mt-1 text-xs text-dark-500">
                          <span>本周已完成 {task.progress} 天</span>
                          <span>目标 {task.target} 天</span>
                        </div>
                      </div>

                      {canClaim && (
                        <button
                          onClick={() => claimWeeklyReward(task.type)}
                          className="bg-gradient-to-r from-manga-blue to-cyan-500 text-white text-sm px-4 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 animate-pulse-glow"
                        >
                          领取
                        </button>
                      )}

                      {isClaimed && (
                        <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                          <Award size={18} />
                          已领取
                        </div>
                      )}

                      {!isCompleted && (
                        <div className="flex items-center gap-1 text-dark-400 text-sm">
                          <Target size={16} />
                          进行中
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {recommendedComics.length > 0 && (
        <div className="animate-fade-in-up stagger-5">
          <h2 className="font-display text-2xl font-bold text-dark-800 mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-primary-500" />
            为你推荐
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendedComics.slice(0, 6).map((comic, index) => (
              <div
                key={comic.id}
                className="card overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={comic.cover}
                    alt={comic.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-dark-800 truncate text-sm">
                    {comic.title}
                  </h4>
                  <p className="text-xs text-dark-500 mb-2">
                    {comic.chapters} 话 · ¥{comic.pricePerChapter}/章
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => readChapter(comic.id, 1)}
                      disabled={
                        user.todayTasks.reading >=
                        user.todayTasks.readingTarget
                      }
                      className="w-full text-xs py-1.5 bg-manga-blue text-white rounded-full hover:bg-manga-blue/80 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {user.todayTasks.reading >=
                      user.todayTasks.readingTarget
                        ? '今日阅读已完成'
                        : `模拟阅读1章 (+¥${comic.pricePerChapter})`}
                    </button>
                    {availableCoupons.length > 0 && (
                      <button
                        onClick={() =>
                          useCoupon(
                            availableCoupons[0].id,
                            comic.id,
                            Math.floor(
                              availableCoupons[0].amount / comic.pricePerChapter
                            )
                          )
                        }
                        className="w-full text-xs py-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
                      >
                        用券阅读
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableCoupons.length > 0 && (
        <div className="animate-fade-in-up stagger-5">
          <h2 className="font-display text-2xl font-bold text-dark-800 mb-4 flex items-center gap-2">
            <Gift size={24} className="text-primary-500" />
            我的券包
            {expiringCoupons.length > 0 && (
              <span className="text-sm font-normal text-red-500 animate-pulse">
                ({expiringCoupons.length} 张即将到期)
              </span>
            )}
          </h2>
          <div className="grid gap-4">
            {availableCoupons.slice(0, 5).map((coupon, index) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onUse={() => {
                  if (recommendedComics.length > 0) {
                    useCoupon(
                      coupon.id,
                      recommendedComics[0].id,
                      Math.floor(coupon.amount / recommendedComics[0].pricePerChapter)
                    );
                  }
                }}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Supply;
