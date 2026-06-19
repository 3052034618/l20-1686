import { X, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { categories } from '@/data/categories';
import CategoryCard from '@/components/CategoryCard';

const CategorySelectorModal = () => {
  const {
    user,
    showCategorySelector,
    setShowCategorySelector,
    toggleCategory,
    confirmCategories,
  } = useStore();

  if (!showCategorySelector) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setShowCategorySelector(false)}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-bounce-in overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-manga" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-manga flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-gradient">
                  选择你喜欢的漫画分类
                </h2>
                <p className="text-sm text-dark-500">
                  选择感兴趣的分类，我们将为你推荐相关正版漫画
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCategorySelector(false)}
              className="p-2 hover:bg-dark-100 rounded-full transition-colors"
            >
              <X size={20} className="text-dark-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-h-96 overflow-y-auto pr-2">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                selected={user.selectedCategories.includes(category.id)}
                onClick={() => toggleCategory(category.id)}
                delay={index * 50}
              />
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-dark-200">
            <div className="text-sm text-dark-500">
              已选择{' '}
              <span className="font-bold text-primary-500">
                {user.selectedCategories.length}
              </span>{' '}
              个分类
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCategorySelector(false)}
                className="btn-ghost"
              >
                稍后再说
              </button>
              <button
                onClick={confirmCategories}
                disabled={user.selectedCategories.length === 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认选择
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorModal;
