import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Bot,
  Bug,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Flame,
  FolderKanban,
  Map,
  MessageSquare,
  Play,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Wand2,
  Zap,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  {
    icon: Map,
    title: 'AI roadmap, built for you',
    description:
      'Tell us your level, language and goal. Get a step-by-step path from absolute beginner to your first real project.',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    icon: MessageSquare,
    title: 'A mentor who speaks your language',
    description:
      'Ask anything in simple English or Hinglish. Get beginner-friendly explanations, hints and line-by-line code walkthroughs.',
    tone: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Bug,
    title: 'Debug without the panic',
    description:
      'Paste your code and error. LifePilot explains what went wrong, why, how to fix it, and how to avoid it next time.',
    tone: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Trophy,
    title: 'Practice that sticks',
    description:
      'Work through curated challenges with hints first, explanations after, and points that make progress feel real.',
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FolderKanban,
    title: 'Projects you can actually build',
    description:
      'Get project ideas matched to your current skills, with features to implement and a step-by-step build plan.',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Zap,
    title: 'An agent that plans ahead',
    description:
      'Your AI study agent reads your progress, recommends the next task and asks before changing your roadmap.',
    tone: 'bg-violet-50 text-violet-600',
  },
];

const steps = [
  {
    number: '01',
    title: 'Set your starting point',
    description: 'Choose your level, language, goal and daily study time. No confusing setup.',
    icon: Compass,
  },
  {
    number: '02',
    title: 'Get your personal roadmap',
    description: 'Gemini designs progressive phases with topics, exercises and mini-projects.',
    icon: Wand2,
  },
  {
    number: '03',
    title: 'Learn, practise, build',
    description: 'Complete topics, ask your mentor, debug code and finish real challenges.',
    icon: Code2,
  },
  {
    number: '04',
    title: 'Watch your progress compound',
    description: 'Streaks, scores and real MongoDB data keep your momentum visible.',
    icon: Target,
  },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -left-6 top-16 hidden w-44 animate-float rounded-2xl border border-white bg-white/90 p-4 shadow-lift backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Streak</p>
            <p className="text-sm font-bold text-ink">6 days</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1">
          {[1, 1, 1, 1, 1, 1, 0].map((day, index) => (
            <span
              key={index}
              className={`h-6 flex-1 rounded ${day ? 'bg-gradient-to-t from-brand-500 to-ocean-400' : 'bg-slate-100'}`}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white p-5 shadow-2xl shadow-brand-900/10 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">Sample preview</p>
            <h3 className="mt-1 font-display text-lg font-bold text-ink">Web Development Path</h3>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-lg shadow-brand-600/30">
            <Rocket className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#f7f5ff] to-[#eff6ff] p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
            <span>Overall progress</span>
            <span>42%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-brand-500 to-ocean-500" />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Play className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">Continue learning</p>
                <p className="text-xs font-semibold text-ink">DOM events & listeners</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {[
            { title: 'HTML & semantics', done: true, tag: 'Phase 1' },
            { title: 'CSS layout & Flexbox', done: true, tag: 'Phase 2' },
            { title: 'JavaScript fundamentals', done: false, tag: 'Phase 3' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full ${
                  item.done ? 'bg-emerald-100 text-emerald-600' : 'border-2 border-slate-200 bg-white text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{item.title}</p>
                <p className="text-[10px] text-slate-400">{item.tag}</p>
              </div>
              {!item.done ? <span className="badge-brand">Next</span> : null}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-ink p-3.5 text-white">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/10">
            <Bot className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/50">AI mentor</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/85">
              Think of the DOM as a family tree for your page. Want a quick example?
            </p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-4 hidden w-48 rounded-2xl border border-white bg-white/90 p-4 shadow-lift backdrop-blur sm:block">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Trophy className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Today</p>
            <p className="text-sm font-bold text-ink">2 tasks done</p>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
          Small steps every day beat one long weekend.
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const primaryLink = user ? '/dashboard' : '/register';

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-muted md:flex">
            <a href="#features" className="transition hover:text-brand-700">Features</a>
            <a href="#how-it-works" className="transition hover:text-brand-700">How it works</a>
            <a href="#agent" className="transition hover:text-brand-700">AI agent</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Open dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost hidden sm:inline-flex">Log in</Link>
                <Link to="/register" className="btn-primary">
                  Start learning free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-fade" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-32 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-300/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="section-shell relative grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Your coding journey, guided by AI
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Go from <span className="text-gradient">zero to builder</span>, one guided step at a time.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg lg:mx-0">
              LifePilot AI is a personal coding mentor for beginners. Get a real AI roadmap, learn
              with a patient tutor, debug your code and build projects that prove you can.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link to={primaryLink} className="btn-primary w-full px-6 py-3 text-base sm:w-auto">
                {user ? 'Continue learning' : 'Build my roadmap'}
                <ArrowRight className="h-[18px] w-[18px]" />
              </Link>
              <a href="#how-it-works" className="btn-secondary w-full px-6 py-3 sm:w-auto">
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-ink-muted lg:justify-start">
              {['No credit card', 'Beginner-first', 'Real progress tracking'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:120ms]">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section id="features" className="border-y border-slate-100 bg-[#fafbff] py-20">
        <div className="section-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Everything a beginner needs</p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              One calm place to learn, practise and build
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Stop juggling ten tutorials. LifePilot turns scattered advice into one clear journey
              that adapts to you.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="card card-hover p-6">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${feature.tone}`}>
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20">
        <div className="section-shell">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                A clear path from “where do I start?” to “I built this.”
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                LifePilot is designed around one belief: beginners don’t need more content, they need
                the right next step. Every part of the app answers that question.
              </p>
              <div className="mt-7 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">Built to teach, not just answer</p>
                    <p className="text-xs leading-relaxed text-ink-muted">
                      Hints come first. Full solutions come when you’re ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[27px] top-6 h-[calc(100%-3rem)] w-px bg-gradient-to-b from-brand-300 via-blue-200 to-transparent" aria-hidden="true" />
              <div className="space-y-5">
                {steps.map((step) => (
                  <div key={step.number} className="relative flex gap-5">
                    <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white bg-white text-brand-600 shadow-soft">
                      <step.icon className="h-6 w-6" />
                    </span>
                    <div className="card flex-1 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-500">
                        Step {step.number}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-ink">{step.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agent" className="bg-[#0b1224] py-20 text-white">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              <Bot className="h-3.5 w-3.5" />
              Semi-autonomous study agent
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              An AI agent that checks your progress before it plans your day
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-white/65">
              Ask “What should I do next?”. LifePilot reads your real roadmap and activity, then
              recommends one focused task. If it wants to change your roadmap, it asks for approval
              first.
            </p>

            <ul className="mt-7 space-y-3.5 text-sm text-white/75">
              {[
                'Reads your live progress from MongoDB',
                'Uses controlled AI tool calling with validated arguments',
                'Asks before significant roadmap changes',
                'Limits agent steps and AI requests',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link to={primaryLink} className="btn-primary mt-8 bg-white text-brand-700 shadow-none hover:bg-brand-50 hover:text-brand-800">
              Try the agent
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/20 to-blue-500/10 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <div className="rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">LifePilot Agent</p>
                    <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Read your progress
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-xs leading-relaxed text-white">
                    I have 45 minutes. What should I do next?
                  </div>
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-slate-50 px-4 py-3 text-xs leading-relaxed text-ink-soft">
                    You finished Flexbox yesterday. Next is <strong>DOM events</strong> (40 min) in
                    Phase 3. I’d do the topic, then the click-counter mini-project.
                    <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[10px] font-semibold text-ink-soft">Read: roadmap + streak</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500">
                      Approve plan
                    </span>
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-400">
                      Not now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-ocean-600 px-6 py-12 text-center text-white shadow-glow sm:px-12 sm:py-16">
            <div className="pointer-events-none absolute -left-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-60 w-60 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Your first project is closer than you think.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              Start with a roadmap built around your life, not someone else’s. It takes two minutes
              to set up.
            </p>
            <Link
              to={primaryLink}
              className="btn mt-7 bg-white px-6 py-3 text-base text-brand-700 shadow-lg hover:-translate-y-0.5 hover:bg-brand-50"
            >
              {user ? 'Back to my dashboard' : 'Start learning free'}
              <ArrowRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="section-shell flex flex-col items-center justify-between gap-5 sm:flex-row">
          <Logo />
          <p className="text-center text-xs text-slate-400">
            Built for curious beginners. AI responses can make mistakes — always test your code.
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>MERN</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Gemini</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Made with care</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
