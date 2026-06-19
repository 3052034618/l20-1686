import { Coupon, CouponType } from '@/types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const couponTypeLabels: Record<CouponType, string> = {
  daily: '每日签到',
  share: '分享奖励',
  reading: '阅读奖励',
  team: '组队奖励',
};

export const couponTypeColors: Record<CouponType, string> = {
  daily: 'from-primary-400 to-primary-600',
  share: 'from-manga-blue to-cyan-600',
  reading: 'from-manga-purple to-purple-600',
  team: 'from-manga-pink to-rose-500',
};

export const couponTypeIcons: Record<CouponType, string> = {
  daily: '📅',
  share: '📤',
  reading: '📖',
  team: '👥',
};

export const createCoupon = (
  userId: string,
  amount: number,
  type: CouponType,
  category: string,
  expireDays = 7
): Coupon => {
  const expireDate = new Date();
  expireDate.setDate(expireDate.getDate() + expireDays);

  return {
    id: generateId(),
    userId,
    amount,
    type,
    category,
    expireDate: expireDate.toISOString(),
    isUsed: false,
  };
};

export const getAvailableCoupons = (coupons: Coupon[]): Coupon[] => {
  const now = new Date();
  return coupons.filter(
    (coupon) => !coupon.isUsed && new Date(coupon.expireDate) > now
  );
};

export const getExpiringCoupons = (coupons: Coupon[], days = 3): Coupon[] => {
  return getAvailableCoupons(coupons).filter((coupon) => {
    const expireDate = new Date(coupon.expireDate);
    const diffTime = expireDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  });
};

export const getExpiredCoupons = (coupons: Coupon[]): Coupon[] => {
  const now = new Date();
  return coupons.filter(
    (coupon) => !coupon.isUsed && new Date(coupon.expireDate) <= now
  );
};

export const getUsedCoupons = (coupons: Coupon[]): Coupon[] => {
  return coupons.filter((coupon) => coupon.isUsed);
};

export const calculateTotalSaved = (coupons: Coupon[]): number => {
  return getUsedCoupons(coupons).reduce((sum, coupon) => sum + coupon.amount, 0);
};
