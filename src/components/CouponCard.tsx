import { Clock, AlertTriangle, Check } from 'lucide-react';
import { Coupon } from '@/types';
import {
  couponTypeLabels,
  couponTypeColors,
  couponTypeIcons,
} from '@/utils/coupon';
import { daysUntil, formatDateCN, isExpiringSoon } from '@/utils/date';

interface CouponCardProps {
  coupon: Coupon;
  onUse?: () => void;
  showUsed?: boolean;
  delay?: number;
}

const CouponCard = ({
  coupon,
  onUse,
  showUsed = false,
  delay = 0,
}: CouponCardProps) => {
  const expiringSoon = isExpiringSoon(coupon.expireDate, 3);
  const daysLeft = daysUntil(coupon.expireDate);

  if (coupon.isUsed && !showUsed) return null;

  return (
    <div
      className={`coupon animate-coupon-reveal ${
        coupon.isUsed ? 'opacity-60 grayscale' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${couponTypeColors[coupon.type]} flex items-center justify-center shadow-md`}
          >
            <span className="text-2xl">{couponTypeIcons[coupon.type]}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-primary-600">
                ¥{coupon.amount}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${couponTypeColors[coupon.type]} text-white`}
              >
                {couponTypeLabels[coupon.type]}
              </span>
            </div>
            <p className="text-sm text-dark-500 mt-0.5">
              适用：{coupon.category}漫画
            </p>
          </div>
        </div>

        <div className="text-right">
          {coupon.isUsed ? (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <Check size={16} />
              <span>已使用</span>
            </div>
          ) : expiringSoon ? (
            <div className="flex items-center gap-1 text-red-500 text-sm animate-pulse">
              <AlertTriangle size={16} />
              <span>即将到期</span>
            </div>
          ) : null}

          <div className="flex items-center gap-1 text-xs text-dark-400 mt-1">
            <Clock size={12} />
            {coupon.isUsed ? (
              <span>使用于 {coupon.usedForComic}</span>
            ) : daysLeft > 0 ? (
              <span>还剩 {daysLeft} 天</span>
            ) : daysLeft === 0 ? (
              <span className="text-red-500">今天到期</span>
            ) : (
              <span className="text-red-500">已过期</span>
            )}
          </div>

          {!coupon.isUsed && daysLeft >= 0 && onUse && (
            <button
              onClick={onUse}
              className="mt-2 text-sm px-4 py-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              立即使用
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-dashed border-primary-200">
        <p className="text-xs text-dark-400">
          📌 本券仅限用于平台内正版漫画章节，有效期至
          {formatDateCN(coupon.expireDate)}
        </p>
      </div>
    </div>
  );
};

export default CouponCard;
