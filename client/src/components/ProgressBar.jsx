import { cn } from '../lib/utils.js';

export default function ProgressBar({ value = 0, className, barClassName, label }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-slate-100', className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || 'Progress'}
    >
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-brand-500 to-ocean-500 transition-all duration-700 ease-out',
          barClassName
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
