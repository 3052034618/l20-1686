import { Check } from 'lucide-react';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  selected: boolean;
  onClick: () => void;
  delay?: number;
}

const CategoryCard = ({
  category,
  selected,
  onClick,
  delay = 0,
}: CategoryCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 animate-fade-in-up ${
        selected
          ? 'border-primary-500 bg-white shadow-lg scale-105'
          : 'border-dark-200 bg-white/50 hover:border-primary-300 hover:bg-white'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
          <Check size={14} className="text-white" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <span
          className="text-4xl transition-transform duration-300"
          style={{
            filter: selected
              ? `drop-shadow(0 0 10px ${category.color}40)`
              : 'none',
          }}
        >
          {category.emoji}
        </span>
        <span
          className="font-display text-lg font-bold"
          style={{ color: selected ? category.color : undefined }}
        >
          {category.name}
        </span>
        <p className="text-xs text-dark-500 text-center">
          {category.description}
        </p>
      </div>

      {selected && (
        <div
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${category.color} 0%, transparent 70%)`,
          }}
        />
      )}
    </button>
  );
};

export default CategoryCard;
