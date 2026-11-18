import { cn } from '../lib/utils.js';

export default function StatCard({ icon: Icon, label, value, hint, tone = 'brand', className }) {
  const tones = {
    brand: 'from-brand-500/10 to-brand-500/0 text-brand-600',
    ocean: 'from-blue-500/10 to-blue-500/0 text-blue-600',
    emerald: 'from-emerald-500/10 to-emerald-500/0 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-500/0 text-amber-600',
    rose: 'from-rose-500/10 to-rose-500/0 text-rose-600',
  };

  return (
    <div className={cn('card relative overflow-hidden p-5', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', tones[tone])} aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-ink">{value}</p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p> : null}
        </div>
        <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 shadow-sm', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
