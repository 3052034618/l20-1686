import { Check, Gift, Calendar, Share2, BookOpen } from 'lucide-react';
import { DailyTask } from '@/types';

interface TaskCardProps {
  task: DailyTask;
  onComplete?: () => void;
  onClaim: () => void;
  delay?: number;
}

const taskIcons = {
  checkIn: Calendar,
  share: Share2,
  reading: BookOpen,
};

const taskColors = {
  checkIn: 'from-primary-400 to-primary-600',
  share: 'from-manga-blue to-cyan-600',
  reading: 'from-manga-purple to-purple-600',
};

const TaskCard = ({ task, onComplete, onClaim, delay = 0 }: TaskCardProps) => {
  const Icon = taskIcons[task.type];
  const progress = Math.min((task.progress / task.target) * 100, 100);
  const canClaim = task.completed && !task.claimed;

  return (
    <div
      className="card p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${taskColors[task.type]} flex items-center justify-center shadow-lg flex-shrink-0`}
        >
          <Icon size={28} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-lg font-bold text-dark-800">
              {task.title}
            </h3>
            <div className="flex items-center gap-1 text-primary-500">
              <Gift size={16} />
              <span className="font-bold">+{task.reward}元</span>
            </div>
          </div>

          <p className="text-sm text-dark-500 mb-3">{task.description}</p>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="progress-bar">
                <div
                  className={`progress-fill bg-gradient-to-r ${taskColors[task.type]}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-dark-500">
                <span>
                  {task.progress}/{task.target}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {task.completed && !task.claimed && (
              <button
                onClick={onClaim}
                className="btn-primary text-sm px-4 py-2 animate-pulse-glow"
              >
                领取
              </button>
            )}

            {task.claimed && (
              <div className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <Check size={18} />
                已领取
              </div>
            )}

            {!task.completed && onComplete && (
              <button
                onClick={onComplete}
                className="btn-secondary text-sm px-4 py-2"
              >
                去完成
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
