import { X, PartyPopper } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { couponTypeLabels, couponTypeColors } from '@/utils/coupon';
import { formatDateCN } from '@/utils/date';

const CouponModal = () => {
  const { showCouponModal, newCoupon, setShowCouponModal } = useStore();

  if (!showCouponModal || !newCoupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowCouponModal(false)}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-manga" />

        <div className="p-8 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-bounce-in shadow-2xl">
              <PartyPopper size={48} className="text-white" />
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold text-gradient mb-2">
            恭喜获得补给券！
          </h2>
          <p className="text-dark-500 mb-6">
            {couponTypeLabels[newCoupon.type]}奖励已到账
          </p>

          <div
            className={`coupon mx-auto max-w-xs animate-coupon-reveal mb-6`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${couponTypeColors[newCoupon.type]} flex items-center justify-center shadow-md`}
                >
                  <span className="text-3xl">🎫</span>
                </div>
                <div className="text-left">
                  <span className="font-display text-4xl font-bold text-primary-600">
                    ¥{newCoupon.amount}
                  </span>
                  <p className="text-sm text-dark-500">
                    适用：{newCoupon.category}漫画
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-dashed border-primary-200">
              <p className="text-xs text-dark-400">
                📌 有效期至 {formatDateCN(newCoupon.expireDate)}
              </p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-primary-700">
              💡 <strong>温馨提示：</strong>
              本券仅限用于平台内正版漫画章节，支持正版阅读，从我做起！
            </p>
          </div>

          <button
            onClick={() => setShowCouponModal(false)}
            className="btn-primary w-full"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponModal;
