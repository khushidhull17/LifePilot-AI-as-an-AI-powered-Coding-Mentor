import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Bot, Map, Trophy } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const highlights = [
  { icon: Map, text: 'A personalised roadmap instead of random tutorials' },
  { icon: Bot, text: 'A patient AI mentor that adapts to your level' },
  { icon: Trophy, text: 'Real progress, streaks and challenges saved to your account' },
];

export default function AuthShell({ children, title, subtitle, footer }) {
  const { user } = useAuth();

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.02fr_1fr]">
      <aside className="auth-panel relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" aria-hidden="true" />
        <div className="relative">
          <Logo light to="/" />
          <div className="mt-20 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              <Sparkles className="h-3.5 w-3.5" />
              For beginners, by design
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold leading-tight xl:text-4xl">
              You don’t need to know where to start. That’s our job.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              LifePilot turns “I want to learn coding” into a clear, realistic path you can follow
              for 30 minutes a day.
            </p>
            <ul className="mt-9 space-y-4">
              {highlights.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-white/75">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10 text-brand-200">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="pt-1.5">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
              <Check className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-white/85">Small steps, visible progress</p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                Every completed topic, challenge and streak is stored in your own account.
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 lg:hidden">
          <Logo />
          <Link to="/" className="btn-ghost btn-sm">
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md animate-fade-up">
            <Link
              to="/"
              className="mb-8 hidden items-center gap-1.5 text-xs font-semibold text-ink-muted transition hover:text-brand-700 lg:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to home
            </Link>
            {title ? (
              <div className="mb-7">
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
                {subtitle ? <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p> : null}
              </div>
            ) : null}
            {children}
            {footer ? <div className="mt-6 text-center text-sm text-ink-muted">{footer}</div> : null}
            {user ? (
              <p className="mt-6 text-center text-xs text-ink-muted">
                Already signed in. <Link to="/dashboard" className="font-semibold text-brand-700">Go to dashboard</Link>
              </p>
            ) : null}
          </div>
        </div>

        <div className="px-5 pb-6 text-center text-[11px] text-slate-400 sm:px-8">
          By continuing you agree to learn kindly, test your code and take breaks.
        </div>
      </main>
    </div>
  );
}
