import { useState, useEffect } from 'react';
import {
  Calendar,
  Flame,
  Settings,
  Sparkles,
  Gift,
  BookOpen,
  Share2,
  TrendingUp,
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

const Supply = () => {
  const {
    user,
    coupons,
    checkIn,
    shareChapter,
    readChapter,
    claimTaskReward,
    setShowCategorySelector,
    useCoupon,
  } = useStore();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const availableCoupons = getAvailableCoupons(coupons);
  const expiringCoupons = getExpiringCoupons(coupons);

  useEffect(() => {
    const today = getToday();
    const isClaimed = (taskType: 'checkIn' | 'share' | 'reading') => {
      return user.claimedTasks.date === today && user.claimedTasks.tasks.includes(taskType);
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
        <h2 className="font-display text-2xl font-bold text-dark-800 mb-4 flex items-center gap-2">
          <Gift size={24} className="text-primary-500" />
          今日任务
        </h2>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
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
          ))}
        </div>
      </div>

      {recommendedComics.length > 0 && (
        <div className="animate-fade-in-up stagger-4">
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
                      disabled={user.todayTasks.reading >= user.todayTasks.readingTarget}
                      className="w-full text-xs py-1.5 bg-manga-blue text-white rounded-full hover:bg-manga-blue/80 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {user.todayTasks.reading >= user.todayTasks.readingTarget
                        ? '今日阅读已完成'
                        : `模拟阅读1章 (+¥${comic.pricePerChapter})`}
                    </button>
                    {availableCoupons.length > 0 && (
                      <button
                        onClick={() =>
                          useCoupon(availableCoupons[0].id, comic.id)
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
                    useCoupon(coupon.id, recommendedComics[0].id);
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
