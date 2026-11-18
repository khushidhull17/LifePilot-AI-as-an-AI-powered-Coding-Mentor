import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils.js';

export default function Spinner({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2" role="status" aria-label={label || 'Loading'}>
      <Loader2 className={cn('h-5 w-5 animate-spin text-brand-600', className)} />
      {label ? <span className="text-sm text-ink-muted">{label}</span> : null}
    </span>
  );
}

export function FullPageLoader({ label = 'Loading LifePilot...' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f8fd]">
      <div className="flex flex-col items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ocean-600 shadow-lg shadow-brand-600/30">
          <Loader2 className="h-7 w-7 animate-spin text-white" />
        </div>
        <p className="text-sm font-medium text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
