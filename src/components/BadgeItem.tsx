import { Lock } from 'lucide-react';
import { Badge } from '@/types';
import { rarityColors, rarityLabels } from '@/data/badges';
import { formatDateCN } from '@/utils/date';

interface BadgeItemProps {
  badge: Badge;
  onClick?: () => void;
  delay?: number;
}

const BadgeItem = ({ badge, onClick, delay = 0 }: BadgeItemProps) => {
  return (
    <button
      onClick={onClick}
      disabled={!badge.unlocked}
      className={`relative group p-4 rounded-2xl transition-all duration-300 animate-fade-in-up ${
        badge.unlocked
          ? 'bg-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer badge-unlocked'
          : 'bg-dark-100 cursor-not-allowed opacity-60'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${
          badge.unlocked ? rarityColors[badge.rarity] : 'from-dark-300 to-dark-400'
        } flex items-center justify-center text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        {badge.unlocked ? (
          <span className="drop-shadow-lg">{badge.icon}</span>
        ) : (
          <Lock size={24} className="text-dark-500" />
        )}
      </div>

      <h4
        className={`font-display text-sm font-bold text-center mb-1 ${
          badge.unlocked ? 'text-dark-800' : 'text-dark-400'
        }`}
      >
        {badge.unlocked ? badge.name : '???'}
      </h4>

      <span
        className={`block text-xs text-center px-2 py-0.5 rounded-full ${
          badge.unlocked
            ? `bg-gradient-to-r ${rarityColors[badge.rarity]} text-white`
            : 'bg-dark-200 text-dark-500'
        }`}
      >
        {badge.unlocked
          ? rarityLabels[badge.rarity]
          : `解锁条件：${badge.condition}`}
      </span>

      {badge.unlocked && badge.unlockedAt && (
        <p className="text-xs text-dark-400 text-center mt-2">
          解锁于 {formatDateCN(badge.unlockedAt)}
        </p>
      )}

      {badge.unlocked && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
        </div>
      )}
    </button>
  );
};

export default BadgeItem;
