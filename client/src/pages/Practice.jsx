import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import Modal from '../components/Modal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Markdown from '../components/Markdown.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage } from '../lib/api.js';
import { cn, minutesLabel } from '../lib/utils.js';

const difficulties = [
  { value: 'all', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const difficultyBadge = {
  beginner: 'badge-green',
  intermediate: 'badge-amber',
  advanced: 'badge-rose',
};

function PracticeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-9 w-64" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card h-28 p-5">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton mt-3 h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="card h-56 p-5">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mt-4 h-5 w-3/4" />
            <div className="skeleton mt-3 h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Practice() {
  const { addToast } = useToast();

  const [challenges, setChallenges] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('');
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [completing, setCompleting] = useState(false);
  const [detailError, setDetailError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (difficulty !== 'all') params.difficulty = difficulty;
      if (topic) params.topic = topic;
      if (language) params.language = language;
      const { data } = await api.get('/practice', { params });
      setChallenges(data.challenges);
      setMeta(data.meta);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, topic, language]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return challenges;
    return challenges.filter(
      (challenge) =>
        challenge.title.toLowerCase().includes(query) ||
        challenge.topic.toLowerCase().includes(query) ||
        challenge.prompt.toLowerCase().includes(query)
    );
  }, [challenges, search]);

  const openChallenge = async (challenge) => {
    setSelected(challenge);
    setHintsShown(0);
    setDetailError('');
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/practice/${challenge.id}`);
      setSelected(data.challenge);
    } catch (err) {
      setDetailError(errorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeChallenge = () => {
    if (completing) return;
    setSelected(null);
    setHintsShown(0);
    setDetailError('');
  };

  const markSolved = async () => {
    if (!selected) return;
    setCompleting(true);
    setDetailError('');
    try {
      const { data } = await api.post(`/practice/${selected.id}/complete`);
      setSelected((current) => ({
        ...current,
        completed: true,
        solution: data.solution,
        explanation: data.explanation,
      }));
      setChallenges((current) =>
        current.map((challenge) =>
          challenge.id === selected.id ? { ...challenge, completed: true } : challenge
        )
      );
      addToast({
        type: 'success',
        title: data.alreadyDone ? 'Already solved' : 'Challenge solved',
        message: data.alreadyDone ? 'This one was already in your completed list.' : `+${data.awarded} points added to your score.`,
      });
      await load();
    } catch (err) {
      setDetailError(errorMessage(err));
    } finally {
      setCompleting(false);
    }
  };

  if (loading && !meta) return <PracticeSkeleton />;

  if (error && !meta) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink">Could not load practice challenges</h1>
        <p className="mt-2 text-sm text-ink-muted">{error}</p>
        <button type="button" className="btn-primary mt-5" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const completionPercent = meta?.total ? Math.round((meta.completed / meta.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Practice zone"
        title="Practise until it clicks"
        subtitle="Curated challenges with hints first and explanations after. Attempt the code in your own editor, then mark it solved."
        actions={
          <span className="badge-brand">
            <Trophy className="h-3.5 w-3.5" />
            {meta?.score || 0} points
          </span>
        }
      />

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink">
                {meta?.completed || 0} of {meta?.total || 0} challenges solved
              </p>
              <p className="text-xs text-ink-muted">Your score is saved to your account.</p>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
              <span>Completion</span>
              <span>{completionPercent}%</span>
            </div>
            <ProgressBar value={completionPercent} className="mt-1.5 h-2" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <div key={level} className="rounded-xl bg-slate-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{level}</p>
              <p className="mt-1 font-display text-lg font-bold text-ink">{meta?.byDifficulty?.[level] || 0}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {difficulties.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setDifficulty(item.value)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-semibold transition',
                difficulty === item.value
                  ? 'bg-gradient-to-r from-brand-600 to-ocean-600 text-white shadow-sm'
                  : 'text-ink-muted hover:bg-slate-50 hover:text-ink'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search challenges..."
              className="input py-2.5 pl-9 text-xs sm:w-52"
            />
          </div>
          <select value={topic} onChange={(event) => setTopic(event.target.value)} className="input cursor-pointer py-2.5 text-xs sm:w-44">
            <option value="">All topics</option>
            {(meta?.topics || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select value={language} onChange={(event) => setLanguage(event.target.value)} className="input cursor-pointer py-2.5 text-xs sm:w-44">
            <option value="">All languages</option>
            {(meta?.languages || []).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((challenge) => (
            <button
              key={challenge.id}
              type="button"
              onClick={() => openChallenge(challenge)}
              className={cn(
                'card card-hover group flex h-full flex-col p-5 text-left',
                challenge.completed && 'border-emerald-200'
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={difficultyBadge[challenge.difficulty] || 'badge-slate'}>
                  {challenge.difficulty}
                </span>
                <span className="badge-slate">{challenge.topic}</span>
                {challenge.completed ? (
                  <span className="badge-green ml-auto">
                    <Check className="h-3 w-3" />
                    Solved
                  </span>
                ) : (
                  <span className="ml-auto text-[11px] font-bold text-brand-600">+{challenge.points}</span>
                )}
              </div>

              <h2 className="mt-3 font-display text-base font-bold leading-snug text-ink group-hover:text-brand-700">
                {challenge.title}
              </h2>
              <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-ink-muted">
                {challenge.prompt}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {minutesLabel(challenge.estimatedMinutes)}
                </span>
                <span>{challenge.language}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
          <Search className="mx-auto h-7 w-7 text-slate-300" />
          <h3 className="mt-3 font-display text-base font-bold text-ink">No challenges match those filters</h3>
          <p className="mt-1 text-sm text-ink-muted">Try clearing the search or switching difficulty.</p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => {
              setSearch('');
              setTopic('');
              setLanguage('');
              setDifficulty('all');
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={closeChallenge}
        title={selected?.title}
        description={selected ? `${selected.topic} • ${selected.language} • ${selected.points} points` : ''}
        size="lg"
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-ink-muted">
                Self-paced practice. Your code stays in this browser.
              </span>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={closeChallenge} disabled={completing}>
                  Close
                </button>
                {!selected.completed ? (
                  <button type="button" className="btn-primary" onClick={markSolved} disabled={completing}>
                    {completing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Mark as solved
                      </>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null
        }
      >
        {detailLoading ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-32 w-full" />
          </div>
        ) : selected ? (
          <div className="space-y-5">
            {detailError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detailError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              <span className={difficultyBadge[selected.difficulty] || 'badge-slate'}>{selected.difficulty}</span>
              <span className="badge-slate">{selected.topic}</span>
              <span className="badge-ocean">{selected.language}</span>
              <span className="badge-brand">
                <Clock className="h-3 w-3" />
                {minutesLabel(selected.estimatedMinutes)}
              </span>
              {selected.completed ? (
                <span className="badge-green">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </span>
              ) : null}
            </div>

            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Challenge</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{selected.prompt}</p>
            </div>

            {selected.requirements?.length ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Requirements</p>
                <ul className="mt-2 space-y-1.5">
                  {selected.requirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Hints</p>
                <span className="text-[10px] text-slate-400">
                  {hintsShown} of {selected.hints?.length || 0} revealed
                </span>
              </div>
              <div className="mt-2 space-y-2">
                {(selected.hints || []).slice(0, hintsShown).map((hint, index) => (
                  <div key={index} className="flex items-start gap-2.5 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-ink-soft">{hint}</p>
                  </div>
                ))}
                {hintsShown < (selected.hints?.length || 0) ? (
                  <button
                    type="button"
                    onClick={() => setHintsShown((current) => current + 1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    <Lightbulb className="h-3.5 w-3.5" />
                    Reveal hint {hintsShown + 1} of {selected.hints.length}
                  </button>
                ) : null}
              </div>
            </div>

            {selected.starterCode ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Starter code</p>
                <div className="mt-2">
                  <div className="code-block">
                    <pre className="!p-4">{selected.starterCode}</pre>
                  </div>
                </div>
              </div>
            ) : null}

            <div>
              <label htmlFor="attempt" className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Your attempt (optional)
              </label>
              <textarea
                id="attempt"
                rows={8}
                value={attempts[selected.id] || ''}
                onChange={(event) =>
                  setAttempts((current) => ({ ...current, [selected.id]: event.target.value }))
                }
                placeholder="Write your solution here for yourself. It is not submitted or executed."
                className="input mt-2 resize-y font-mono text-xs leading-5"
                spellCheck={false}
              />
            </div>

            {selected.completed && selected.solution ? (
              <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-display text-sm font-bold text-ink">Solution and explanation</h3>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Example solution</p>
                  <div className="mt-2">
                    <Markdown>{`\`\`\`${selected.language.toLowerCase()}\n${selected.solution}\n\`\`\``}</Markdown>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Why it works</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{selected.explanation}</p>
                </div>
              </div>
            ) : null}

            <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-ink-muted">
              <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              This is self-reported practice, not an automated test. Mark it solved only after you
              have attempted it and understand the explanation.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
