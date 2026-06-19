interface ProgressBarProps {
  progress: number;
  total: number;
  label?: string;
  showNumbers?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const ProgressBar = ({
  progress,
  total,
  label,
  showNumbers = true,
  color = 'primary',
  size = 'md',
  animated = true,
}: ProgressBarProps) => {
  const percentage = Math.min((progress / total) * 100, 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const colorClasses: Record<string, string> = {
    primary: 'from-primary-400 to-primary-600',
    pink: 'from-manga-pink to-rose-500',
    blue: 'from-manga-blue to-cyan-600',
    purple: 'from-manga-purple to-purple-600',
    green: 'from-manga-green to-green-600',
    yellow: 'from-manga-yellow to-orange-500',
  };

  return (
    <div className="w-full">
      {(label || showNumbers) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-dark-600">{label}</span>
          )}
          {showNumbers && (
            <span className="text-sm font-bold text-dark-700">
              {progress}/{total}
              <span className="text-dark-400 font-normal ml-1">
                ({Math.round(percentage)}%)
              </span>
            </span>
          )}
        </div>
      )}
      <div className={`progress-bar ${sizeClasses[size]}`}>
        <div
          className={`progress-fill bg-gradient-to-r ${colorClasses[color]} ${
            animated ? 'animate-progress' : ''
          }`}
          style={
            {
              width: `${percentage}%`,
              '--progress-width': `${percentage}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
};

export default ProgressBar;
