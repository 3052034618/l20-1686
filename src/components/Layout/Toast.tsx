import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

const Toast = () => {
  const { toasts, removeToast } = useStore();

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-fade-in-up ${colors[toast.type]}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <Icon size={20} className={iconColors[toast.type]} />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 p-0.5 hover:bg-white/50 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;
