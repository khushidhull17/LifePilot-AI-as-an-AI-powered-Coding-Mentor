import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FolderKanban,
  Lightbulb,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Wand2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage, isAiSetupError } from '../lib/api.js';
import { cn, formatDate } from '../lib/utils.js';
import { levelLabels } from '../lib/navigation.js';

export default function Projects() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [recommendation, setRecommendation] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects/latest');
      setRecommendation(data.recommendation);
      setAiConfigured(data.aiConfigured);
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

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/projects/recommend', { count: 3 });
      setRecommendation(data.recommendation);
      addToast({
        type: 'success',
        title: 'Project ideas ready',
        message: 'Pick one and start with the first small step.',
      });
    } catch (err) {
      setError(errorMessage(err));
      if (isAiSetupError(err)) setAiConfigured(false);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-9 w-72" />
        <div className="card h-24 p-5">
          <div className="skeleton h-4 w-44" />
          <div className="skeleton mt-3 h-3 w-3/4" />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="card h-80 p-6">
              <div className="skeleton h-4 w-28" />
              <div className="skeleton mt-4 h-6 w-2/3" />
              <div className="skeleton mt-3 h-3 w-full" />
              <div className="skeleton mt-2 h-3 w-4/5" />
              <div className="skeleton mt-5 h-28 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Project recommendations"
        title="Build something you can show"
        subtitle="AI project ideas matched to your language, level and completed roadmap topics — with features and a build plan."
        actions={
          <button type="button" className="btn-primary" onClick={generate} disabled={generating || !aiConfigured}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding projects...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                {recommendation ? 'Refresh ideas' : 'Recommend projects'}
              </>
            )}
          </button>
        }
      />

      {!aiConfigured ? <SetupNotice /> : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {generating ? (
        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <div>
              <p className="font-display text-base font-bold text-ink">Designing projects around your skills...</p>
              <p className="text-xs text-ink-muted">Real AI, tailored to your progress. This can take 20–40 seconds.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-2">
            {[0, 1].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 p-5">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton mt-3 h-6 w-2/3" />
                <div className="skeleton mt-3 h-3 w-full" />
                <div className="skeleton mt-2 h-3 w-4/5" />
                <div className="skeleton mt-4 h-24 w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : recommendation?.projects?.length ? (
        <>
          <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-md shadow-brand-600/20">
                <Target className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-bold text-ink">Matched to your current level</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {levelLabels[recommendation.context?.skillLevel] || levelLabels[user?.skillLevel]} •{' '}
                  {recommendation.context?.language || user?.preferredLanguage} •{' '}
                  {recommendation.context?.completedTopics?.length || 0} roadmap topics completed
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">
              Generated {formatDate(recommendation.createdAt, { year: 'numeric' })}
            </span>
          </section>

          <div className="grid gap-5 xl:grid-cols-2">
            {recommendation.projects.map((project, index) => (
              <article key={`${project.title}-${index}`} className="card card-hover flex flex-col overflow-hidden">
                <div className="relative border-b border-slate-100 bg-gradient-to-br from-slate-50 to-brand-50/40 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white font-display text-sm font-bold text-brand-600 shadow-sm">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <span className="badge-brand capitalize">{project.difficulty}</span>
                      {project.estimatedTime ? (
                        <span className="badge-slate">
                          <Clock className="h-3 w-3" />
                          {project.estimatedTime}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold text-ink">{project.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{project.description}</p>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Skills you’ll use</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.skills.map((skill) => (
                        <span key={skill} className="badge-slate">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Features to build</p>
                    <ul className="mt-2 space-y-1.5">
                      {project.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Step-by-step plan</p>
                    <ol className="mt-2 space-y-2">
                      {project.steps.map((step, stepIndex) => (
                        <li key={step} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-muted">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700">
                            {stepIndex + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-5 sm:flex-row">
            <div className="flex items-center gap-2.5 text-left">
              <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-xs leading-relaxed text-ink-muted">
                Pick one project and cut the first step in half. Small starts are easier to finish.
              </p>
            </div>
            <Link to="/mentor" className="btn-secondary shrink-0">
              Ask your mentor to plan it
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          icon={FolderKanban}
          title="No project ideas yet"
          description="Generate beginner-friendly projects based on your language, skill level and roadmap progress. You’ll get features, skills and a build plan."
          action={
            <button type="button" className="btn-primary" onClick={generate} disabled={!aiConfigured}>
              <Wand2 className="h-4 w-4" />
              Recommend my first projects
            </button>
          }
        />
      )}
    </div>
  );
}
