import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Sparkles, X } from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import { navigation } from '../lib/navigation.js';
import { useAuth } from '../context/AuthContext.jsx';
import { cn, initials } from '../lib/utils.js';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const current = navigation.find((item) => location.pathname.startsWith(item.to));

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/70 lg:block">
        <Sidebar />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          />
          <div className="relative h-full w-[86%] max-w-xs shadow-2xl">
            <button
              type="button"
              className="absolute right-3 top-4 z-10 rounded-xl p-2 text-slate-400 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200/60 bg-[#f7f8fd]/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white p-2 text-ink-soft shadow-sm lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{current?.label || 'LifePilot AI'}</p>
              <p className="hidden text-[11px] text-ink-muted sm:block">
                Your coding journey, guided by AI.
              </p>
            </div>

            <Link
              to="/mentor"
              className="hidden items-center gap-2 rounded-xl border border-brand-100 bg-white px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 sm:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ask AI
            </Link>

            <Link
              to="/settings"
              className={cn(
                'grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-100 to-blue-100 text-xs font-bold text-brand-700 ring-2 ring-white transition hover:ring-brand-200'
              )}
              aria-label="Open settings"
            >
              {initials(user?.name)}
            </Link>
          </div>
        </header>

        <main className="section-shell py-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
