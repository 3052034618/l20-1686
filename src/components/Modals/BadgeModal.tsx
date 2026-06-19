import { X, Info } from 'lucide-react';
import { Badge } from '@/types';
import { rarityColors, rarityLabels } from '@/data/badges';
import { formatDateCN } from '@/utils/date';

interface BadgeModalProps {
  badge: Badge | null;
  onClose: () => void;
}

const BadgeModal = ({ badge, onClose }: BadgeModalProps) => {
  if (!badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-bounce-in overflow-hidden">
        <div
          className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${rarityColors[badge.rarity]}`}
        />

        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-dark-100 rounded-full transition-colors z-10"
          >
            <X size={20} className="text-dark-400" />
          </button>

          <div
            className={`w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br ${
              badge.unlocked ? rarityColors[badge.rarity] : 'from-dark-300 to-dark-400'
            } flex items-center justify-center text-5xl shadow-xl ${
              badge.unlocked ? 'badge-unlocked' : ''
            }`}
          >
            {badge.unlocked ? (
              <span className="drop-shadow-lg">{badge.icon}</span>
            ) : (
              <span className="text-dark-500">🔒</span>
            )}
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${rarityColors[badge.rarity]} mb-3`}
          >
            {rarityLabels[badge.rarity]}
          </span>

          <h2 className="font-display text-2xl font-bold text-dark-800 mb-2">
            {badge.unlocked ? badge.name : '未解锁徽章'}
          </h2>

          <p className="text-dark-500 mb-4">{badge.description}</p>

          {badge.unlocked && badge.unlockedAt && (
            <p className="text-sm text-primary-500 mb-4">
              🎉 解锁于 {formatDateCN(badge.unlockedAt)}
            </p>
          )}

          <div className="bg-dark-100 rounded-2xl p-4">
            <div className="flex items-start gap-3 text-left">
              <Info size={18} className="text-dark-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-dark-700">解锁条件</p>
                <p className="text-sm text-dark-500">{badge.condition}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
