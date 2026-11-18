import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import Logo from './Logo.jsx';
import { navigation, levelLabels } from '../lib/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { cn, initials } from '../lib/utils.js';

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onNavigate?.();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-20 items-center border-b border-slate-100 px-5">
        <Logo to="/dashboard" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-7 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-violet-600 to-ocean-600 p-4 text-white shadow-lg shadow-brand-600/20">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            AI mentor
          </div>
          <p className="mt-2 text-sm font-semibold leading-snug">
            Stuck on a concept? Ask anything, anytime.
          </p>
          <NavLink
            to="/mentor"
            onClick={onNavigate}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            Start a conversation
          </NavLink>
        </div>
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-blue-100 text-sm font-bold text-brand-700">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
            <p className="truncate text-[11px] text-ink-muted">
              {levelLabels[user?.skillLevel] || 'Learner'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
