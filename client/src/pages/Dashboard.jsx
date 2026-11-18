import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  FolderKanban,
  Loader2,
  Map,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import Markdown from '../components/Markdown.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage, isAiSetupError } from '../lib/api.js';
import { cn, greeting, minutesLabel, timeAgo } from '../lib/utils.js';

const activityMeta = {
  topic_completed: { icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600' },
  challenge_completed: { icon: Trophy, tone: 'bg-amber-50 text-amber-600' },
  roadmap_generated: { icon: Map, tone: 'bg-brand-50 text-brand-600' },
  projects_generated: { icon: FolderKanban, tone: 'bg-blue-50 text-blue-600' },
  mentor_session: { icon: MessageSquare, tone: 'bg-violet-50 text-violet-600' },
  agent_action: { icon: Bot, tone: 'bg-cyan-50 text-cyan-600' },
  topic_reopened: { icon: RefreshCw, tone: 'bg-slate-100 text-slate-500' },
};

const quickPrompts = [
  'Plan my next study session',
  'I have 30 minutes. What should I do?',
  'What should I build next?',
];

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-9 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card p-5">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-8 w-16" />
            <div className="skeleton mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton mt-4 h-7 w-2/3" />
            <div className="skeleton mt-3 h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-4/5" />
            <div className="skeleton mt-6 h-10 w-40" />
          </div>
          <div className="card h-48 p-6">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton mt-4 h-28 w-full" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="card h-64 p-6">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton mx-auto mt-6 h-32 w-32 rounded-full" />
          </div>
          <div className="card h-56 p-6">
            <div className="skeleton h-4 w-32" />
            <div className="mt-4 space-y-3">
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking] = useState(false);

  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentRun, setAgentRun] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [actingOn, setActingOn] = useState(null);

  const loadSummary = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    if (quiet) setRefreshing(true);
    try {
      const { data } = await api.get('/progress/summary');
      setSummary(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const maxWeeklyMinutes = useMemo(
    () => Math.max(60, ...(summary?.weeklyActivity || []).map((day) => day.minutes)),
    [summary]
  );

  const markComplete = async () => {
    const topicId = summary?.roadmap?.nextTopic?.topicId;
    if (!topicId) return;

    setMarking(true);
    try {
      await api.patch(`/roadmap/topics/${topicId}`, { completed: true });
      addToast({
        type: 'success',
        title: 'Topic completed',
        message: 'Progress and streak updated.',
      });
      await loadSummary(true);
    } catch (err) {
      addToast({ type: 'error', title: 'Could not update topic', message: errorMessage(err) });
    } finally {
      setMarking(false);
    }
  };

  const runAgent = async (message) => {
    const text = (message ?? agentPrompt).trim();
    if (!text || agentLoading) return;

    setAgentLoading(true);
    setAgentError('');
    setAgentRun(null);
    try {
      const { data } = await api.post('/agent/run', { message: text });
      setAgentRun(data.run);
      setAgentPrompt('');
      await loadSummary(true);
    } catch (err) {
      setAgentError(errorMessage(err));
      if (isAiSetupError(err)) {
        setSummary((current) => (current ? { ...current, aiConfigured: false } : current));
      }
    } finally {
      setAgentLoading(false);
    }
  };

  const handleAgentAction = async (actionId, decision) => {
    if (!agentRun?.id) return;
    setActingOn(actionId);
    try {
      const { data } = await api.post(`/agent/runs/${agentRun.id}/${decision}`, { actionId });
      setAgentRun(data.run);
      if (data.result?.message) {
        addToast({ type: 'success', title: 'Agent action applied', message: data.result.message });
      } else {
        addToast({ type: 'info', title: 'Action dismissed', message: 'No changes were made.' });
      }
      await loadSummary(true);
    } catch (err) {
      addToast({ type: 'error', title: 'Agent action failed', message: errorMessage(err) });
    } finally {
      setActingOn(null);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error && !summary) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Could not load your dashboard</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{error}</p>
        <button type="button" onClick={() => loadSummary()} className="btn-primary mt-5">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  const roadmap = summary?.roadmap || {};
  const nextTopic = roadmap.nextTopic;
  const hasRoadmap = Boolean(summary?.hasRoadmap);
  const recentActivities = summary?.recentActivities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${greeting()}, ${user?.name?.split(' ')[0] || 'learner'}`}
        title="Your learning cockpit"
        subtitle={`${todayLabel} — one focused step is enough to keep the momentum going.`}
        actions={
          <>
            <button
              type="button"
              onClick={() => loadSummary(true)}
              disabled={refreshing}
              className="btn-secondary"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <Link to="/mentor" className="btn-primary">
              <Sparkles className="h-4 w-4" />
              Ask AI Mentor
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Map}
          label="Roadmap"
          value={hasRoadmap ? `${roadmap.completionPercent}%` : '—'}
          hint={hasRoadmap ? `${roadmap.completedTopics} of ${roadmap.totalTopics} topics complete` : 'Generate your first roadmap'}
          tone="brand"
        />
        <StatCard
          icon={CheckCircle2}
          label="Topics completed"
          value={hasRoadmap ? roadmap.completedTopics : 0}
          hint={hasRoadmap ? `${roadmap.pendingTopics} topics still ahead` : 'Start with a roadmap'}
          tone="ocean"
        />
        <StatCard
          icon={Trophy}
          label="Challenges"
          value={`${summary?.challenges?.completed ?? 0}/${summary?.challenges?.total ?? 0}`}
          hint={`${summary?.challenges?.score ?? 0} points earned`}
          tone="amber"
        />
        <StatCard
          icon={Flame}
          label="Learning streak"
          value={`${summary?.streak?.current ?? 0} ${summary?.streak?.current === 1 ? 'day' : 'days'}`}
          hint={`Longest streak: ${summary?.streak?.longest ?? 0} days`}
          tone="rose"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <section className="card relative overflow-hidden p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-brand-100/60 blur-2xl" aria-hidden="true" />
            {hasRoadmap && nextTopic ? (
              <>
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="badge-brand">
                      <Play className="h-3 w-3" />
                      Continue learning
                    </span>
                    <span className="badge-slate">{nextTopic.phaseTitle}</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {minutesLabel(nextTopic.estimatedMinutes)}
                  </span>
                </div>

                <h2 className="relative mt-4 font-display text-xl font-bold text-ink sm:text-2xl">
                  {nextTopic.title}
                </h2>
                <p className="relative mt-2 line-clamp-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  {nextTopic.explanation}
                </p>

                <div className="relative mt-5 flex flex-wrap items-center gap-2">
                  <Link to="/roadmap" className="btn-primary">
                    Open in roadmap
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button type="button" onClick={markComplete} disabled={marking} className="btn-secondary">
                    {marking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Mark complete
                  </button>
                  <span className="ml-auto hidden text-xs text-ink-muted sm:inline">
                    {roadmap.completedTopics}/{roadmap.totalTopics} topics done
                  </span>
                </div>

                <div className="relative mt-5">
                  <ProgressBar value={roadmap.completionPercent} />
                </div>
              </>
            ) : hasRoadmap && roadmap.completionPercent === 100 ? (
              <div className="relative py-2">
                <span className="badge-green">
                  <Trophy className="h-3 w-3" />
                  Roadmap complete
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-ink">
                  You finished every topic. That is huge.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  Now prove it with a project. Generate a fresh set of project ideas or ask your
                  mentor what to build next.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to="/projects" className="btn-primary">
                    <FolderKanban className="h-4 w-4" />
                    Find a project
                  </Link>
                  <Link to="/mentor" className="btn-secondary">
                    <MessageSquare className="h-4 w-4" />
                    Ask your mentor
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative py-2">
                <span className="eyebrow">
                  <Sparkles className="h-3 w-3" />
                  Start here
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-ink">
                  Your personal roadmap is one click away.
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  LifePilot will use your level, language, goal and daily time to design a
                  step-by-step path with exercises and mini-projects.
                </p>
                <Link to="/roadmap" className="btn-primary mt-5">
                  <Map className="h-4 w-4" />
                  Generate my roadmap
                </Link>
              </div>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-ink to-slate-700 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-ink">LifePilot Agent</h2>
                    <span className="badge-brand">Semi-autonomous</span>
                  </div>
                  <p className="mt-1 max-w-lg text-xs leading-relaxed text-ink-muted">
                    Reads your real progress, recommends one next step, and asks before changing
                    anything.
                  </p>
                </div>
              </div>
              {summary?.aiConfigured === false ? null : (
                <span className="badge-green">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  AI ready
                </span>
              )}
            </div>

            {summary?.aiConfigured === false ? (
              <div className="mt-4">
                <SetupNotice compact />
              </div>
            ) : (
              <>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => runAgent(prompt)}
                      disabled={agentLoading}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-muted transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form
                  className="mt-3 flex items-end gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    runAgent();
                  }}
                >
                  <textarea
                    value={agentPrompt}
                    onChange={(event) => setAgentPrompt(event.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Ask the agent what to do next..."
                    className="input min-h-[46px] resize-none py-2.5"
                    disabled={agentLoading}
                  />
                  <button
                    type="submit"
                    disabled={agentLoading || !agentPrompt.trim()}
                    className="btn-primary h-[46px] shrink-0 px-3.5"
                    aria-label="Run agent"
                  >
                    {agentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>

                {agentLoading ? (
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
                      Checking your progress and planning...
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="skeleton h-3 w-3/4" />
                      <div className="skeleton h-3 w-full" />
                      <div className="skeleton h-3 w-2/3" />
                    </div>
                  </div>
                ) : null}

                {agentError ? (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {agentError}
                  </div>
                ) : null}

                {agentRun ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        <Sparkles className="h-3 w-3 text-brand-500" />
                        Agent response
                        {agentRun.toolTrace?.length ? (
                          <span className="ml-auto normal-case tracking-normal text-slate-400">
                            used {agentRun.toolTrace.length} tool{agentRun.toolTrace.length === 1 ? '' : 's'}
                          </span>
                        ) : null}
                      </div>
                      <Markdown>{agentRun.output}</Markdown>
                    </div>

                    {agentRun.pendingActions?.filter((action) => action.status === 'pending').length ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                          Needs your approval
                        </p>
                        <div className="mt-2 space-y-2">
                          {agentRun.pendingActions
                            .filter((action) => action.status === 'pending')
                            .map((action) => (
                              <div
                                key={action.id}
                                className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <p className="text-xs font-semibold leading-relaxed text-ink-soft">
                                  {action.summary}
                                </p>
                                <div className="flex shrink-0 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAgentAction(action.id, 'confirm')}
                                    disabled={actingOn === action.id}
                                    className="btn-primary btn-sm"
                                  >
                                    {actingOn === action.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAgentAction(action.id, 'dismiss')}
                                    disabled={actingOn === action.id}
                                    className="btn-secondary btn-sm"
                                    aria-label="Dismiss action"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">This week’s activity</h2>
                <p className="mt-0.5 text-xs text-ink-muted">Minutes of focused learning, tracked from real completions.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Last 7 days
              </span>
            </div>

            <div className="mt-6 flex h-44 items-end gap-2 sm:gap-3">
              {(summary?.weeklyActivity || []).map((day) => {
                const height = Math.max(6, Math.round((day.minutes / maxWeeklyMinutes) * 100));
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                return (
                  <div key={day.date} className="group flex flex-1 flex-col items-center gap-2">
                    <div className="relative flex h-32 w-full items-end justify-center">
                      <div
                        className={cn(
                          'w-full max-w-[42px] rounded-t-lg transition-all duration-500',
                          day.minutes > 0
                            ? 'bg-gradient-to-t from-brand-600 to-ocean-400 group-hover:from-brand-700 group-hover:to-ocean-500'
                            : 'bg-slate-100'
                        )}
                        style={{ height: `${height}%` }}
                        title={`${day.minutes} minutes — ${day.topics} topics, ${day.challenges} challenges`}
                      />
                    </div>
                    <span className={cn('text-[10px] font-semibold', isToday ? 'text-brand-700' : 'text-slate-400')}>
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-center text-[10px] text-slate-400">
              Hover a bar to see the details. Aim for a little every day.
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Daily goal</h2>
                <p className="mt-0.5 text-xs text-ink-muted">Your target: {minutesLabel(summary?.dailyGoal?.targetMinutes || 0)}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Target className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <ProgressRing value={summary?.dailyGoal?.percent || 0} size={148}>
                <div>
                  <p className="font-display text-3xl font-bold text-ink">{summary?.dailyGoal?.percent || 0}%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">of daily goal</p>
                </div>
              </ProgressRing>
              <p className="mt-3 text-sm font-semibold text-ink">
                {minutesLabel(summary?.dailyGoal?.completedMinutes || 0)} completed
              </p>
              <p className="mt-1 text-center text-xs leading-relaxed text-ink-muted">
                {(summary?.dailyGoal?.percent || 0) >= 100
                  ? 'Daily goal hit. Everything extra is momentum.'
                  : `${minutesLabel(
                      Math.max(0, (summary?.dailyGoal?.targetMinutes || 0) - (summary?.dailyGoal?.completedMinutes || 0))
                    )} left to hit today’s goal.`}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
                <span>Today’s focus</span>
                <span>{minutesLabel(summary?.dailyGoal?.targetMinutes || 0)}</span>
              </div>
              <ProgressBar className="mt-2 h-2" value={summary?.dailyGoal?.percent || 0} />
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-ink">Recent activity</h2>
              <span className="badge-slate">{recentActivities.length}</span>
            </div>

            {recentActivities.length ? (
              <div className="mt-4 space-y-3">
                {recentActivities.map((activity, index) => {
                  const meta = activityMeta[activity.type] || activityMeta.topic_completed;
                  const Icon = meta.icon;
                  return (
                    <div key={`${activity.date}-${index}`} className="flex items-start gap-3">
                      <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', meta.tone)}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink-soft">{activity.title}</p>
                        <p className="truncate text-[10px] text-slate-400">{activity.description || timeAgo(activity.date)}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(activity.date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-5 text-center">
                <Sparkles className="mx-auto h-5 w-5 text-slate-300" />
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  Complete a topic or challenge to start your activity trail.
                </p>
              </div>
            )}
          </section>

          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink to-slate-800 p-5 text-white shadow-soft">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl" aria-hidden="true" />
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
              <MessageSquare className="h-3.5 w-3.5" />
              Your mentor is online
            </div>
            <h2 className="mt-3 font-display text-lg font-bold">A question is cheaper than a blocker.</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-white/60">
              Stuck on a concept or error? Ask in English or Hinglish, at your level.
            </p>
            <Link to="/mentor" className="btn mt-4 w-full bg-white text-ink hover:bg-brand-50">
              Open AI Mentor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
