import { useState } from 'react';
import {
  Receipt,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Coins,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Tag,
  CreditCard,
  Sparkles,
  ShoppingCart,
  MinusCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { comics } from '@/data/comics';
import { Badge, CartItem } from '@/types';
import ProgressBar from '@/components/ProgressBar';
import CouponCard from '@/components/CouponCard';
import BadgeItem from '@/components/BadgeItem';
import BadgeModal from '@/components/Modals/BadgeModal';
import {
  getAvailableCoupons,
  getExpiringCoupons,
  getUsedCoupons,
  getExpiredCoupons,
  couponTypeLabels,
} from '@/utils/coupon';
import { formatDateCN, daysUntil } from '@/utils/date';
import { rarityLabels } from '@/data/badges';

type TabType = 'records' | 'coupons' | 'badges';
type CouponTabType = 'available' | 'used' | 'expired';

const CartSelectPanel = ({
  couponId,
  couponAmount,
  onConfirm,
  onCancel,
}: {
  couponId: string;
  couponAmount: number;
  onConfirm: (cart: CartItem[]) => void;
  onCancel: () => void;
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const toggleComic = (comicId: string) => {
    const existing = cart.find((c) => c.comicId === comicId);
    if (existing) {
      setCart(cart.filter((c) => c.comicId !== comicId));
    } else {
      const comic = comics.find((c) => c.id === comicId);
      if (comic) {
        const defaultChapters = Math.max(
          1,
          Math.min(comic.chapters, Math.floor(couponAmount / comic.pricePerChapter) || 1)
        );
        setCart([...cart, { comicId, chapters: defaultChapters }]);
      }
    }
  };

  const updateChapters = (comicId: string, delta: number) => {
    const comic = comics.find((c) => c.id === comicId);
    if (!comic) return;
    setCart(
      cart.map((item) => {
        if (item.comicId !== comicId) return item;
        const newChapters = Math.min(
          comic.chapters,
          Math.max(1, item.chapters + delta)
        );
        return { ...item, chapters: newChapters };
      })
    );
  };

  const removeFromCart = (comicId: string) => {
    setCart(cart.filter((c) => c.comicId !== comicId));
  };

  const totalOriginalPrice = cart.reduce((sum, item) => {
    const comic = comics.find((c) => c.id === item.comicId);
    return sum + (comic ? item.chapters * comic.pricePerChapter : 0);
  }, 0);

  const actualCouponAmount = Math.min(couponAmount, totalOriginalPrice);
  const selfPay = Math.max(0, totalOriginalPrice - couponAmount);
  const remainingCoupon = Math.max(0, couponAmount - totalOriginalPrice);

  return (
    <div className="mt-4 bg-primary-50 rounded-2xl p-4 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-dark-800 flex items-center gap-2">
          <ShoppingCart size={18} className="text-primary-500" />
          购物车结算
        </h4>
        <button
          onClick={onCancel}
          className="text-dark-400 hover:text-dark-600 transition-colors"
        >
          <XCircle size={20} />
        </button>
      </div>

      <div className="mb-4">
        <p className="text-xs text-dark-500 mb-2 font-medium">点击漫画加入/移出购物车</p>
        <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
          {comics.map((comic) => {
            const isInCart = cart.some((c) => c.comicId === comic.id);
            return (
              <button
                key={comic.id}
                onClick={() => toggleComic(comic.id)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isInCart
                    ? 'bg-primary-100 ring-2 ring-primary-400'
                    : 'bg-white hover:bg-dark-50'
                }`}
              >
                <img
                  src={comic.cover}
                  alt={comic.title}
                  className="w-10 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-bold text-sm truncate ${
                      isInCart ? 'text-primary-700' : 'text-dark-800'
                    }`}
                  >
                    {comic.title}
                  </p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {comic.chapters} 章 · ¥{comic.pricePerChapter}/章
                  </p>
                </div>
                {isInCart && (
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-sm font-bold text-dark-700 mb-3 flex items-center gap-1.5">
            <ShoppingCart size={14} className="text-primary-500" />
            已选漫画 ({cart.length} 部)
          </p>
          <div className="space-y-3">
            {cart.map((item) => {
              const comic = comics.find((c) => c.id === item.comicId);
              if (!comic) return null;
              const itemSubtotal = item.chapters * comic.pricePerChapter;
              return (
                <div
                  key={item.comicId}
                  className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl"
                >
                  <img
                    src={comic.cover}
                    alt={comic.title}
                    className="w-8 h-11 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-dark-800 truncate">
                      {comic.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateChapters(item.comicId, -1)}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-dark-100 transition-colors shadow-sm"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="font-bold text-sm text-dark-800 w-8 text-center">
                          {item.chapters}
                        </span>
                        <button
                          onClick={() => updateChapters(item.comicId, 1)}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center hover:bg-dark-100 transition-colors shadow-sm"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="text-xs text-dark-500">
                        × ¥{comic.pricePerChapter} = ¥{itemSubtotal.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.comicId)}
                    className="text-dark-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <MinusCircle size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Receipt size={14} className="text-dark-400" />
          <span className="text-xs text-dark-500 font-medium">消费明细</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-500 flex items-center gap-1.5">
              <Tag size={14} />
              原价合计
            </span>
            <span className="text-dark-700 font-medium">
              ¥{totalOriginalPrice.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1.5">
              <Sparkles size={14} />
              券抵扣
            </span>
            <span className="text-green-600 font-bold">
              -¥{actualCouponAmount.toFixed(1)}
            </span>
          </div>
          {remainingCoupon > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1.5">
                <Coins size={14} />
                券剩余
              </span>
              <span className="text-green-600 font-medium">
                ¥{remainingCoupon.toFixed(1)}
              </span>
            </div>
          )}
          <div className="border-t-2 border-dashed border-dark-200 my-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-dark-700 font-bold flex items-center gap-1.5">
                <CreditCard size={15} />
                自付
              </span>
              <span
                className={`font-bold text-2xl ${
                  selfPay > 0 ? 'text-red-500' : 'text-green-500'
                }`}
              >
                ¥{selfPay.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {selfPay > 0 && (
          <p className="text-xs text-red-500 mt-3 text-center bg-red-50 py-2 rounded-lg">
            ⚠️ 需自付 ¥{selfPay.toFixed(1)}，券包金额不足
          </p>
        )}

        {selfPay === 0 && cart.length > 0 && (
          <p className="text-xs text-green-600 mt-3 text-center bg-green-50 py-2 rounded-lg">
            ✨ 全额用券，无需自付！
          </p>
        )}
      </div>

      <button
        onClick={() => onConfirm(cart)}
        disabled={cart.length === 0}
        className={`mt-4 w-full py-3 font-bold rounded-xl transition-colors shadow-md ${
          cart.length > 0
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-dark-200 text-dark-400 cursor-not-allowed'
        }`}
      >
        {cart.length > 0 ? `确认使用 (${cart.length} 部)` : '请先选择漫画'}
      </button>
    </div>
  );
};

const Records = () => {
  const { user, coupons, readingRecords, badges, useCouponWithCart } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [couponTab, setCouponTab] = useState<CouponTabType>('available');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [usingCoupon, setUsingCoupon] = useState<string | null>(null);

  const availableCoupons = getAvailableCoupons(coupons);
  const expiringCoupons = getExpiringCoupons(coupons);
  const usedCoupons = getUsedCoupons(coupons);
  const expiredCoupons = getExpiredCoupons(coupons);

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const totalChapters = readingRecords.reduce(
    (sum, r) => sum + r.chaptersRead,
    0
  );
  const uniqueComics = new Set(readingRecords.map((r) => r.comicId)).size;

  const displayedCoupons = {
    available: availableCoupons,
    used: usedCoupons,
    expired: expiredCoupons,
  }[couponTab];

  const tabs = [
    { id: 'records', label: '阅读记录', icon: Receipt },
    { id: 'coupons', label: '券包管理', icon: Coins },
    { id: 'badges', label: '徽章成就', icon: Award },
  ] as const;

  const couponTabs = [
    { id: 'available', label: `可用 (${availableCoupons.length})` },
    { id: 'used', label: `已使用 (${usedCoupons.length})` },
    { id: 'expired', label: `已过期 (${expiredCoupons.length})` },
  ] as const;

  const handleUseCoupon = (couponId: string, cart: CartItem[]) => {
    useCouponWithCart(couponId, cart);
    setUsingCoupon(null);
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-manga-blue via-manga-purple to-manga-pink p-8 text-white animate-fade-in-up">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-bold mb-2 drop-shadow-lg">
            我的兑换记录
          </h1>
          <p className="text-white/80 text-lg">
            看看你支持了多少正版漫画吧~
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        <div className="card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary-100 flex items-center justify-center">
            <Coins size={24} className="text-primary-500" />
          </div>
          <p className="text-sm text-dark-500 mb-1">累计节省</p>
          <p className="font-display text-2xl font-bold text-primary-600">
            ¥{user.totalSaved.toFixed(1)}
          </p>
        </div>

        <div className="card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-manga-blue/20 flex items-center justify-center">
            <BookOpen size={24} className="text-manga-blue" />
          </div>
          <p className="text-sm text-dark-500 mb-1">阅读章节</p>
          <p className="font-display text-2xl font-bold text-dark-800">
            {totalChapters}
          </p>
        </div>

        <div className="card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-manga-purple/20 flex items-center justify-center">
            <Receipt size={24} className="text-manga-purple" />
          </div>
          <p className="text-sm text-dark-500 mb-1">阅读作品</p>
          <p className="font-display text-2xl font-bold text-dark-800">
            {uniqueComics}
          </p>
        </div>

        <div className="card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-manga-yellow/20 flex items-center justify-center">
            <Award size={24} className="text-yellow-500" />
          </div>
          <p className="text-sm text-dark-500 mb-1">获得徽章</p>
          <p className="font-display text-2xl font-bold text-dark-800">
            {unlockedBadges.length}/{badges.length}
          </p>
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up stagger-2">
        <h3 className="font-display text-xl font-bold text-dark-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-primary-500" />
          省钱进度
        </h3>
        <ProgressBar
          progress={Math.min(user.totalSaved, 100)}
          total={100}
          label="距离下一里程碑"
          color="yellow"
          size="lg"
        />
        <p className="text-sm text-dark-500 mt-2">
          累计节省 ¥{user.totalSaved.toFixed(1)}，再节省 ¥
          {Math.max(0, 100 - user.totalSaved).toFixed(1)} 即可解锁「省钱小能手」徽章！
        </p>
      </div>

      {expiringCoupons.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 animate-fade-in-up stagger-3">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="text-red-500 flex-shrink-0 mt-0.5"
              size={24}
            />
            <div className="flex-1">
              <h3 className="font-bold text-red-700 mb-2">
                ⚠️ 券包即将到期提醒
              </h3>
              <p className="text-sm text-red-600 mb-3">
                你有 {expiringCoupons.length} 张券包即将在3天内到期，请尽快使用！
              </p>
              <div className="grid gap-2">
                {expiringCoupons.slice(0, 3).map((coupon) => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between bg-white rounded-xl p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-600">
                        ¥{coupon.amount}
                      </span>
                      <span className="text-sm text-dark-500">
                        {coupon.category}券
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <Clock size={14} />
                      <span>还剩 {daysUntil(coupon.expireDate)} 天</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in-up stagger-4">
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-white text-dark-600 hover:bg-dark-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'records' && (
          <div className="space-y-4">
            {readingRecords.length > 0 ? (
              readingRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="card overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-4 flex gap-4">
                    <img
                      src={record.comicCover}
                      alt={record.comicTitle}
                      className="w-20 h-28 rounded-lg object-cover shadow-md flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-dark-800 truncate">
                            {record.comicTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="inline-block text-xs px-2 py-0.5 bg-primary-100 text-primary-600 rounded-full">
                              {record.category}
                            </span>
                            {record.couponType && (
                              <span className="inline-block text-xs px-2 py-0.5 bg-dark-100 text-dark-500 rounded-full">
                                来自：{couponTypeLabels[record.couponType]}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="flex items-center gap-1 text-green-500 font-bold whitespace-nowrap">
                          <CheckCircle size={16} />
                          省¥{record.savedAmount.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-dark-500 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen size={14} />
                          阅读了 {record.chaptersRead} 章
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateCN(record.readDate)}
                        </span>
                      </div>

                      {(record.totalPrice !== undefined || record.couponAmount !== undefined || record.selfPayAmount !== undefined) && (
                        <div className="bg-gradient-to-br from-dark-50 to-white rounded-xl p-3 border border-dashed border-dark-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Receipt size={14} className="text-dark-400" />
                            <span className="text-xs text-dark-500 font-medium">消费明细</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-dark-500">原价</span>
                              <span className="text-dark-700">
                                ¥{(record.totalPrice ?? 0).toFixed(1)}
                              </span>
                            </div>
                            {(record.couponAmount ?? 0) > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-green-600 flex items-center gap-1">
                                  <Tag size={12} />
                                  券抵扣
                                </span>
                                <span className="text-green-600 font-medium">
                                  -¥{(record.couponAmount ?? 0).toFixed(1)}
                                </span>
                              </div>
                            )}
                            <div className="h-px bg-dark-100 my-1" />
                            <div className="flex items-center justify-between">
                              <span className="text-dark-700 font-medium text-sm">实付</span>
                              <span
                                className={`font-bold ${
                                  (record.selfPayAmount ?? 0) > 0
                                    ? 'text-red-500'
                                    : 'text-green-500'
                                }`}
                              >
                                ¥{(record.selfPayAmount ?? record.totalPrice ?? 0).toFixed(1)}
                              </span>
                            </div>
                            {(record.selfPayAmount ?? 0) === 0 && (record.couponAmount ?? 0) > 0 && (
                              <p className="text-xs text-green-600 mt-2 text-center bg-green-50 py-1.5 rounded-lg">
                                ✨ 全额用券，无需自付！
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="font-display text-xl font-bold text-dark-700 mb-2">
                  还没有阅读记录
                </h3>
                <p className="text-dark-500">
                  快去补给站领取券包，开启你的正版阅读之旅吧！
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coupons' && (
          <div>
            <div className="flex gap-2 mb-6">
              {couponTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCouponTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    couponTab === tab.id
                      ? 'bg-dark-800 text-white'
                      : 'bg-white text-dark-600 hover:bg-dark-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {displayedCoupons.length > 0 ? (
              <div className="space-y-4">
                {displayedCoupons.map((coupon, index) => (
                  <div key={coupon.id}>
                    <CouponCard
                      coupon={coupon}
                      showUsed={couponTab === 'used'}
                      onUse={
                        couponTab === 'available'
                          ? () => setUsingCoupon(coupon.id)
                          : undefined
                      }
                      delay={index * 50}
                    />
                    {couponTab === 'used' && coupon.usedChapters && (
                      <div className="mt-1 px-4 py-2 bg-green-50 rounded-b-xl -mt-2 border-t-0">
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <BookOpen size={12} />
                          已阅读 {coupon.usedChapters} 章
                        </span>
                      </div>
                    )}
                    {usingCoupon === coupon.id && (
                      <CartSelectPanel
                        couponId={coupon.id}
                        couponAmount={coupon.amount}
                        onConfirm={(cart) =>
                          handleUseCoupon(coupon.id, cart)
                        }
                        onCancel={() => setUsingCoupon(null)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-6xl mb-4">
                  {couponTab === 'available' ? '🎫' : couponTab === 'used' ? '✅' : '⏰'}
                </div>
                <h3 className="font-display text-xl font-bold text-dark-700 mb-2">
                  {couponTab === 'available'
                    ? '暂无可用券包'
                    : couponTab === 'used'
                    ? '还没有使用过券包'
                    : '暂无过期券包'}
                </h3>
                <p className="text-dark-500">
                  {couponTab === 'available'
                    ? '完成每日任务获取更多阅读券吧！'
                    : couponTab === 'used'
                    ? '使用券包支持正版漫画，这里会记录你的每一份支持~'
                    : '你的券包都还在有效期内，放心使用！'}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge, index) => (
                <BadgeItem
                  key={badge.id}
                  badge={badge}
                  onClick={() => setSelectedBadge(badge)}
                  delay={index * 50}
                />
              ))}
            </div>

            <div className="mt-8 card p-6">
              <h3 className="font-display text-xl font-bold text-dark-800 mb-4">
                徽章收藏进度
              </h3>
              <ProgressBar
                progress={unlockedBadges.length}
                total={badges.length}
                label="徽章收集进度"
                color="purple"
                size="lg"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {(['common', 'rare', 'epic', 'legendary'] as const).map(
                  (rarity) => {
                    const total = badges.filter((b) => b.rarity === rarity).length;
                    const unlocked = badges.filter(
                      (b) => b.rarity === rarity && b.unlocked
                    ).length;
                    return (
                      <span
                        key={rarity}
                        className="text-sm px-3 py-1.5 bg-dark-100 rounded-full"
                      >
                        {rarityLabels[rarity]}：{unlocked}/{total}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <BadgeModal
        badge={selectedBadge}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
};

export default Records;
