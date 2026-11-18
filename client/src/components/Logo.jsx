import { Link } from 'react-router-dom';
import { cn } from '../lib/utils.js';

export default function Logo({ to = '/', className, compact = false, light = false }) {
  const content = (
    <>
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-ocean-600 shadow-lg shadow-brand-600/30">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden="true">
          <path
            d="M16 4.5c4.3 2.8 6.5 6.7 6.5 11.2 0 4.6-2.7 8-6.5 10.3-3.8-2.3-6.5-5.7-6.5-10.3C9.5 11.2 11.7 7.3 16 4.5Z"
            fill="white"
            fillOpacity="0.95"
          />
          <circle cx="16" cy="15.5" r="3" fill="#7c3aed" />
          <path
            d="M10.6 25.2 8.8 28.5l5-1.5M21.4 25.2l1.8 3.3-5-1.5"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-lg font-bold tracking-tight',
              light ? 'text-white' : 'text-ink'
            )}
          >
            LifePilot <span className="text-brand-500">AI</span>
          </span>
          <span
            className={cn(
              'mt-1 text-[10px] font-semibold uppercase tracking-[0.16em]',
              light ? 'text-white/55' : 'text-slate-400'
            )}
          >
            Coding mentor
          </span>
        </span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cn('flex items-center gap-3', className)} aria-label="LifePilot AI home">
        {content}
      </Link>
    );
  }

  return <div className={cn('flex items-center gap-3', className)}>{content}</div>;
}
