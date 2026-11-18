import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Code2,
  FolderKanban,
  Loader2,
  Map,
  MessageSquare,
  Play,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Wand2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Modal from '../components/Modal.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage, isAiSetupError } from '../lib/api.js';
import { cn, formatDate, minutesLabel } from '../lib/utils.js';
import { levelLabels } from '../lib/navigation.js';

const focusIdeas = ['Get job-ready', 'Build a portfolio', 'Focus on React', 'Strong fundamentals'];

function RoadmapSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-9 w-64" />
      <div className="card p-6">
        <div className="skeleton h-6 w-2/3" />
        <div className="skeleton mt-3 h-3 w-full" />
        <div className="skeleton mt-2 h-3 w-4/5" />
        <div className="skeleton mt-6 h-24 w-full" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card p-5">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton mt-3 h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Roadmap() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [focus, setFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const [expandedPhases, setExpandedPhases] = useState([]);
  const [expandedTopics, setExpandedTopics] = useState([]);
  const [togglingTopic, setTogglingTopic] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/roadmap');
      setData(response);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!data?.roadmap?.phases?.length) return;
    if (expandedPhases.length) return;

    const nextPhaseIndex = data.roadmap.phases.findIndex((phase) =>
      phase.topics.some((topic) => !topic.completed)
    );
    setExpandedPhases([nextPhaseIndex >= 0 ? nextPhaseIndex : 0]);
  }, [data, expandedPhases.length]);

  const totalHours = useMemo(() => {
    if (!data?.roadmap?.phases) return 0;
    return data.roadmap.phases.reduce((sum, phase) => sum + (phase.estimatedHours || 0), 0);
  }, [data]);

  const daysAtPace = useMemo(() => {
    const remaining = data?.stats?.remainingMinutes || 0;
    return Math.max(1, Math.ceil(remaining / (user?.dailyStudyTime || 60)));
  }, [data, user]);

  const togglePhase = (index) => {
    setExpandedPhases((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    );
  };

  const toggleTopicDetails = (topicId) => {
    setExpandedTopics((current) =>
      current.includes(topicId) ? current.filter((item) => item !== topicId) : [...current, topicId]
    );
  };

  const generate = async (event) => {
    event.preventDefault();
    setGenerating(true);
    setGenerateError('');
    try {
      await api.post('/roadmap/generate', { focus: focus.trim() || undefined });
      setGenerateOpen(false);
      setFocus('');
      addToast({
        type: 'success',
        title: 'Roadmap ready',
        message: 'Your new personalized path is saved.',
      });
      await load();
    } catch (err) {
      setGenerateError(errorMessage(err));
      if (isAiSetupError(err)) {
        setData((current) => (current ? { ...current, aiConfigured: false } : current));
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggleTopic = async (topic) => {
    if (togglingTopic) return;
    setTogglingTopic(topic._id);
    try {
      const { data: response } = await api.patch(`/roadmap/topics/${topic._id}`, {
        completed: !topic.completed,
      });
      setData((current) => ({ ...current, roadmap: response.roadmap, stats: response.stats }));

      if (!topic.completed && response.stats.completionPercent === 100) {
        addToast({
          type: 'success',
          title: 'Roadmap complete!',
          message: 'Every topic is done. Time to build something real.',
          duration: 7000,
        });
      } else {
        addToast({
          type: 'success',
          title: topic.completed ? 'Topic reopened' : 'Topic completed',
          message: topic.completed ? 'You can work on it again anytime.' : 'Progress and streak updated.',
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Could not update topic', message: errorMessage(err) });
    } finally {
      setTogglingTopic(null);
    }
  };

  if (loading) return <RoadmapSkeleton />;

  if (error) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
        <h1 className="mt-3 font-display text-xl font-bold text-ink">Could not load your roadmap</h1>
        <p className="mt-2 text-sm text-ink-muted">{error}</p>
        <button type="button" className="btn-primary mt-5" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const roadmap = data?.roadmap;
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Your learning path"
        title={roadmap ? roadmap.title : 'My Roadmap'}
        subtitle={
          roadmap
            ? roadmap.description
            : 'A personalized, phase-by-phase path from where you are to your first real project.'
        }
        actions={
          roadmap ? (
            <>
              <Link to="/mentor" className="btn-secondary">
                <MessageSquare className="h-4 w-4" />
                Ask about my path
              </Link>
              <button type="button" className="btn-primary" onClick={() => setGenerateOpen(true)}>
                <Wand2 className="h-4 w-4" />
                New AI roadmap
              </button>
            </>
          ) : null
        }
      />

      {data?.aiConfigured === false ? <SetupNotice /> : null}

      {!roadmap ? (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50/50 to-blue-50 p-6 shadow-soft sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" aria-hidden="true" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="eyebrow">
                  <Sparkles className="h-3.5 w-3.5" />
                  Built around you
                </span>
                <h2 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl">
                  Your roadmap starts with your real life.
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
                  LifePilot uses your level ({levelLabels[user?.skillLevel]}), track ({user?.preferredLanguage}),
                  goal and {minutesLabel(user?.dailyStudyTime)} per day to design a realistic path.
                  Every topic comes with an explanation, exercises and a mini-project.
                </p>
                <button
                  type="button"
                  onClick={() => setGenerateOpen(true)}
                  className="btn-primary mt-6"
                >
                  <Wand2 className="h-4 w-4" />
                  Generate my roadmap
                </button>
              </div>

              <div className="grid gap-3">
                {[
                  { icon: Map, title: 'Progressive phases', text: 'Foundations first, then projects.' },
                  { icon: BookOpen, title: 'Beginner explanations', text: 'Why each topic matters.' },
                  { icon: Code2, title: 'Practice built in', text: 'Exercises and mini-projects.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-3.5 shadow-sm backdrop-blur">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-ink">{item.title}</p>
                      <p className="text-[11px] text-ink-muted">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {stats.completionPercent === 100 ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg shadow-emerald-500/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
                    <Trophy className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold">Roadmap complete. Well done.</p>
                    <p className="text-xs text-white/80">Turn this knowledge into a project you can show.</p>
                  </div>
                </div>
                <Link to="/projects" className="btn bg-white text-emerald-700 hover:bg-emerald-50">
                  Find a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : null}

          <section className="card overflow-hidden">
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-brand">
                    <Map className="h-3 w-3" />
                    {roadmap.phases.length} phases
                  </span>
                  <span className="badge-ocean">{roadmap.language || user?.preferredLanguage}</span>
                  <span className="badge-slate">{levelLabels[roadmap.skillLevel] || levelLabels[user?.skillLevel]}</span>
                  <span className="badge-slate">
                    <Clock className="h-3 w-3" />
                    ~{totalHours} hours
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 text-xs font-medium text-ink-muted">
                  <span>
                    {stats.completedTopics} of {stats.totalTopics} topics complete
                  </span>
                  <span>{stats.completionPercent}%</span>
                </div>
                <ProgressBar value={stats.completionPercent} className="mt-2" />

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Completed</p>
                    <p className="mt-1 text-sm font-bold text-ink">{stats.completedTopics} topics</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Remaining</p>
                    <p className="mt-1 text-sm font-bold text-ink">{stats.pendingTopics} topics</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">At your pace</p>
                    <p className="mt-1 text-sm font-bold text-ink">~{daysAtPace} days</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:pl-6">
                <ProgressRing value={stats.completionPercent} size={152} />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[11px] text-ink-muted sm:px-6">
              <span>Generated {formatDate(roadmap.createdAt)} • Goal: {roadmap.learningGoal || user?.learningGoal || 'Build real projects'}</span>
              {stats.nextTopic ? (
                <span className="inline-flex items-center gap-1.5 font-semibold text-brand-700">
                  <Play className="h-3 w-3" />
                  Next: {stats.nextTopic.title}
                </span>
              ) : null}
            </div>
          </section>

          <div className="space-y-3">
            {roadmap.phases.map((phase, phaseIndex) => {
              const completedInPhase = phase.topics.filter((topic) => topic.completed).length;
              const phasePercent = Math.round((completedInPhase / phase.topics.length) * 100);
              const isOpen = expandedPhases.includes(phaseIndex);
              const isNextPhase = stats.nextTopic?.phaseIndex === phaseIndex;

              return (
                <section key={phase._id} className={cn('card overflow-hidden transition', isNextPhase && 'border-brand-200')}>
                  <button
                    type="button"
                    onClick={() => togglePhase(phaseIndex)}
                    className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-50/60 sm:p-6"
                    aria-expanded={isOpen}
                  >
                    <span
                      className={cn(
                        'grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-display text-sm font-bold',
                        phasePercent === 100
                          ? 'bg-emerald-100 text-emerald-600'
                          : isNextPhase
                            ? 'bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-md shadow-brand-600/25'
                            : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {phasePercent === 100 ? <Check className="h-5 w-5" /> : String(phaseIndex + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold text-ink sm:text-lg">{phase.title}</h2>
                        {isNextPhase ? <span className="badge-brand">You are here</span> : null}
                        {phasePercent === 100 ? <span className="badge-green">Complete</span> : null}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted sm:text-sm">
                        {phase.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400">
                        <span>{phase.topics.length} topics</span>
                        <span>~{phase.estimatedHours} hours</span>
                        <span>{completedInPhase}/{phase.topics.length} done</span>
                      </div>
                      <ProgressBar value={phasePercent} className="mt-2.5 h-1.5 max-w-md" />
                    </div>

                    <ChevronDown
                      className={cn('mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform', isOpen && 'rotate-180')}
                    />
                  </button>

                  {isOpen ? (
                    <div className="border-t border-slate-100 bg-slate-50/30 px-3 py-3 sm:px-5 sm:py-4">
                      <div className="space-y-2">
                        {phase.topics.map((topic, topicIndex) => {
                          const isTopicOpen = expandedTopics.includes(topic._id);
                          return (
                            <div
                              key={topic._id}
                              className={cn(
                                'rounded-xl border bg-white transition',
                                topic.completed ? 'border-emerald-100' : 'border-slate-200/80'
                              )}
                            >
                              <div className="flex items-start gap-3 p-3.5 sm:p-4">
                                <button
                                  type="button"
                                  onClick={() => toggleTopic(topic)}
                                  disabled={togglingTopic === topic._id}
                                  className={cn(
                                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition',
                                    topic.completed
                                      ? 'border-emerald-500 bg-emerald-500 text-white'
                                      : 'border-slate-300 bg-white text-transparent hover:border-brand-400 hover:text-brand-200'
                                  )}
                                  aria-label={topic.completed ? 'Mark as not complete' : 'Mark as complete'}
                                  aria-pressed={topic.completed}
                                >
                                  {togglingTopic === topic._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleTopicDetails(topic._id)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p
                                      className={cn(
                                        'text-sm font-semibold',
                                        topic.completed ? 'text-ink-muted line-through decoration-slate-300' : 'text-ink'
                                      )}
                                    >
                                      {topicIndex + 1}. {topic.title}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                      <Clock className="h-3 w-3" />
                                      {minutesLabel(topic.estimatedMinutes)}
                                    </span>
                                  </div>
                                  {!isTopicOpen ? (
                                    <p className="mt-1 line-clamp-1 text-xs text-ink-muted">{topic.explanation}</p>
                                  ) : null}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleTopicDetails(topic._id)}
                                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                  aria-label={isTopicOpen ? 'Hide details' : 'Show details'}
                                >
                                  <ChevronDown className={cn('h-4 w-4 transition-transform', isTopicOpen && 'rotate-180')} />
                                </button>
                              </div>

                              {isTopicOpen ? (
                                <div className="border-t border-slate-100 px-3.5 py-4 sm:px-4">
                                  <p className="text-sm leading-relaxed text-ink-soft">{topic.explanation}</p>

                                  {topic.exercises?.length ? (
                                    <div className="mt-4">
                                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                        Practice exercises
                                      </p>
                                      <ul className="mt-2 space-y-1.5">
                                        {topic.exercises.map((exercise, index) => (
                                          <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />
                                            {exercise}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}

                                  {topic.miniProject ? (
                                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                                      <FolderKanban className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                                          Mini-project
                                        </p>
                                        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{topic.miniProject}</p>
                                      </div>
                                    </div>
                                  ) : null}

                                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[11px] text-slate-400">
                                      {topic.completed && topic.completedAt
                                        ? `Completed ${formatDate(topic.completedAt)}`
                                        : 'Tick the circle when you feel confident.'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => toggleTopic(topic)}
                                      disabled={togglingTopic === topic._id}
                                      className={cn('btn-sm', topic.completed ? 'btn-secondary' : 'btn-primary')}
                                    >
                                      {togglingTopic === topic._id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : topic.completed ? (
                                        <RefreshCw className="h-3.5 w-3.5" />
                                      ) : (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      )}
                                      {topic.completed ? 'Reopen topic' : 'Mark complete'}
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-sm font-semibold text-ink">Want a different direction?</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                Generate a fresh AI roadmap. Your current one is archived, not deleted.
              </p>
            </div>
            <button type="button" onClick={() => setGenerateOpen(true)} className="btn-secondary shrink-0">
              <Wand2 className="h-4 w-4" />
              Regenerate roadmap
            </button>
          </div>
        </>
      )}

      <Modal
        open={generateOpen}
        onClose={() => {
          if (!generating) {
            setGenerateOpen(false);
            setGenerateError('');
          }
        }}
        title={roadmap ? 'Generate a new roadmap?' : 'Generate your roadmap'}
        description={
          roadmap
            ? 'Your current roadmap will be archived and the new one becomes active. Completed topic history stays in your activity feed.'
            : 'Gemini will design a personal path using your profile and daily study time.'
        }
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setGenerateOpen(false)}
              disabled={generating}
            >
              Cancel
            </button>
            <button type="submit" form="generate-roadmap-form" className="btn-primary" disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Designing your path...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {roadmap ? 'Regenerate' : 'Generate roadmap'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="generate-roadmap-form" onSubmit={generate} className="space-y-5">
          {generateError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
              {generateError}
            </div>
          ) : null}

          {generating ? (
            <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Gemini is designing your phases, topics and projects...
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                This usually takes 20–40 seconds. Keep this tab open.
              </p>
              <div className="mt-4 space-y-2">
                <div className="skeleton h-3 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="focus" className="label">Anything specific you want to focus on? (optional)</label>
                <textarea
                  id="focus"
                  rows={3}
                  maxLength={300}
                  value={focus}
                  onChange={(event) => setFocus(event.target.value)}
                  className="input resize-none"
                  placeholder="e.g. I want to build a portfolio site and get comfortable with JavaScript..."
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {focusIdeas.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => setFocus(idea)}
                      className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-ink-muted transition hover:border-brand-200 hover:text-brand-700"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-ink-muted">
                <p className="font-semibold text-ink-soft">Based on your profile</p>
                <p className="mt-1">
                  {levelLabels[user?.skillLevel]} • {user?.preferredLanguage} • {minutesLabel(user?.dailyStudyTime)} per day
                </p>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
