import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Code2,
  Loader2,
  Rocket,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage } from '../lib/api.js';
import { cn, minutesLabel } from '../lib/utils.js';

const levels = [
  {
    value: 'absolute-beginner',
    title: 'Yes, I’m a complete beginner',
    description: 'I have never written code, or only tried once or twice.',
  },
  {
    value: 'beginner',
    title: 'I know a few basics',
    description: 'I understand variables, loops or simple HTML/CSS.',
  },
  {
    value: 'intermediate',
    title: 'I know the fundamentals',
    description: 'I can build small things but want structure and real projects.',
  },
];

const languages = [
  { value: 'HTML, CSS & JavaScript', short: 'Web basics', note: 'Best first step' },
  { value: 'Python', short: 'Python', note: 'Beginner friendly' },
  { value: 'React.js', short: 'React', note: 'Modern UI' },
  { value: 'Full Stack Web Development', short: 'Full stack', note: 'Build complete apps' },
  { value: 'Java', short: 'Java', note: 'OOP & Android' },
  { value: 'C', short: 'C', note: 'Core programming' },
  { value: 'C++', short: 'C++', note: 'DSA & systems' },
];

const goals = [
  'Build my first real project',
  'Get an internship or developer job',
  'Prepare for college exams and placements',
  'Learn coding for fun and curiosity',
];

const steps = [
  { title: 'Your level', icon: Target },
  { title: 'Your language', icon: Code2 },
  { title: 'Your goal', icon: Rocket },
];

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    skillLevel: user?.skillLevel || 'absolute-beginner',
    preferredLanguage: user?.preferredLanguage || 'HTML, CSS & JavaScript',
    dailyStudyTime: user?.dailyStudyTime || 60,
    learningGoal: user?.learningGoal || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const next = () => {
    setError('');
    if (step === 0 && !form.skillLevel) {
      setError('Choose the option that feels closest.');
      return;
    }
    if (step === 1 && !form.preferredLanguage) {
      setError('Choose a track to continue.');
      return;
    }
    setStep((current) => Math.min(2, current + 1));
  };

  const back = () => {
    setError('');
    setStep((current) => Math.max(0, current - 1));
  };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch('/users/me', {
        ...form,
        learningGoal: form.learningGoal.trim() || 'Build my first real project',
        onboardingCompleted: true,
      });
      updateUser(data.user);
      addToast({
        type: 'success',
        title: 'Setup complete',
        message: 'Now generate your first AI roadmap.',
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8fd]">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="section-shell flex h-20 items-center justify-between">
          <Logo to="/" />
          <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Personal setup
          </div>
        </div>
      </header>

      <main className="section-shell py-8 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="card sticky top-8 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Your setup</p>
              <div className="mt-5 space-y-1">
                {steps.map((item, index) => (
                  <div
                    key={item.title}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-3 transition',
                      index === step && 'bg-brand-50',
                      index < step && 'opacity-80'
                    )}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 place-items-center rounded-lg',
                        index < step
                          ? 'bg-emerald-100 text-emerald-600'
                          : index === step
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25'
                            : 'bg-slate-100 text-slate-400'
                      )}
                    >
                      {index < step ? <Check className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                    </span>
                    <div>
                      <p className={cn('text-sm font-semibold', index === step ? 'text-brand-700' : 'text-ink-soft')}>
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-400">Step {index + 1} of 3</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 p-4">
                <Wand2 className="h-5 w-5 text-brand-600" />
                <p className="mt-2 text-xs font-semibold leading-relaxed text-ink-soft">
                  Answers can be changed later in Settings.
                </p>
              </div>
            </div>
          </aside>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-600">
                    Step {step + 1} of 3
                  </p>
                  <h1 className="mt-1 font-display text-xl font-bold text-ink sm:text-2xl">
                    {step === 0 && 'Where are you starting from?'}
                    {step === 1 && 'What do you want to learn?'}
                    {step === 2 && 'What is your main goal?'}
                  </h1>
                </div>
                <div className="hidden gap-1.5 sm:flex">
                  {steps.map((item, index) => (
                    <span
                      key={item.title}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        index === step ? 'w-8 bg-brand-600' : index < step ? 'w-4 bg-emerald-400' : 'w-4 bg-slate-200'
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {step === 0 && 'There is no wrong answer. We use this to set the right pace and depth.'}
                {step === 1 && 'Choose the track that excites you most. You can add more later.'}
                {step === 2 && 'Your roadmap will be shaped around this goal and your daily time.'}
              </p>
            </div>

            <div className="min-h-[360px] px-5 py-6 sm:px-7">
              {error ? (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                  {error}
                </div>
              ) : null}

              {step === 0 ? (
                <div className="space-y-3">
                  {levels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => set('skillLevel', level.value)}
                      className={cn(
                        'flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5',
                        form.skillLevel === level.value
                          ? 'border-brand-400 bg-brand-50/70 ring-4 ring-brand-500/10'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50/60'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition',
                          form.skillLevel === level.value
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-ink sm:text-base">{level.title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-ink-muted sm:text-sm">
                          {level.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {languages.map((language) => (
                    <button
                      key={language.value}
                      type="button"
                      onClick={() => set('preferredLanguage', language.value)}
                      className={cn(
                        'group rounded-2xl border p-4 text-left transition',
                        form.preferredLanguage === language.value
                          ? 'border-brand-400 bg-brand-50/70 ring-4 ring-brand-500/10'
                          : 'border-slate-200 bg-white hover:border-brand-200 hover:bg-slate-50/60'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            'grid h-10 w-10 place-items-center rounded-xl font-display text-sm font-bold',
                            form.preferredLanguage === language.value
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700'
                          )}
                        >
                          {language.short.slice(0, 2)}
                        </span>
                        {form.preferredLanguage === language.value ? (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-ink">{language.short}</p>
                      <p className="mt-0.5 text-[11px] text-ink-muted">{language.note}</p>
                    </button>
                  ))}
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-6">
                  <div>
                    <label className="label">What do you want to achieve?</label>
                    <div className="flex flex-wrap gap-2">
                      {goals.map((goal) => (
                        <button
                          key={goal}
                          type="button"
                          onClick={() => set('learningGoal', goal)}
                          className={cn(
                            'rounded-full border px-3.5 py-2 text-xs font-semibold transition',
                            form.learningGoal === goal
                              ? 'border-brand-400 bg-brand-50 text-brand-700'
                              : 'border-slate-200 bg-white text-ink-muted hover:border-brand-200 hover:text-brand-700'
                          )}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                    <input
                      className="input mt-3"
                      value={form.learningGoal}
                      onChange={(event) => set('learningGoal', event.target.value)}
                      placeholder="Or write your own goal..."
                      maxLength={300}
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <Clock className="h-[18px] w-[18px]" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-ink">Daily study time</p>
                          <p className="text-[11px] text-ink-muted">Be realistic. Consistency wins.</p>
                        </div>
                      </div>
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-bold text-ink">
                        {minutesLabel(form.dailyStudyTime)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="15"
                      value={form.dailyStudyTime}
                      onChange={(event) => set('dailyStudyTime', Number(event.target.value))}
                      className="mt-5 w-full accent-brand-600"
                      aria-label="Daily study minutes"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
                      <span>15 min</span>
                      <span>1 hour</span>
                      <span>2 hours</span>
                      <span>3 hours</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-ink-muted">
                    <span className="font-semibold text-ink-soft">Your setup: </span>
                    {levels.find((level) => level.value === form.skillLevel)?.title.split(',')[0]} •{' '}
                    {form.preferredLanguage} • {minutesLabel(form.dailyStudyTime)} per day
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
              <button type="button" onClick={back} disabled={step === 0 || saving} className="btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {step < 2 ? (
                <button type="button" onClick={next} className="btn-primary">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={finish} disabled={saving} className="btn-primary">
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Finish setup
                      <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
