import { useState } from 'react';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code2,
  HelpCircle,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import Markdown from '../components/Markdown.jsx';
import { api, errorMessage, isAiSetupError } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { cn } from '../lib/utils.js';

const languages = [
  'JavaScript',
  'Python',
  'Java',
  'C',
  'C++',
  'React.js',
  'HTML/CSS',
  'SQL',
  'Other',
];

const starterExample = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i <= items.length; i++) {
    total += items[i].price;
  }
  return total;
}

console.log(calculateTotal([{ price: 10 }, { price: 20 }]));`;

const sections = [
  {
    key: 'whatIsWrong',
    title: 'What is wrong',
    icon: AlertTriangle,
    tone: 'border-rose-100 bg-rose-50/60 text-rose-600',
    number: '01',
  },
  {
    key: 'whyItHappened',
    title: 'Why it happened',
    icon: HelpCircle,
    tone: 'border-amber-100 bg-amber-50/60 text-amber-600',
    number: '02',
  },
  {
    key: 'howToFix',
    title: 'How to fix it',
    icon: Wrench,
    tone: 'border-blue-100 bg-blue-50/60 text-blue-600',
    number: '03',
  },
];

export default function Debugger() {
  const { addToast } = useToast();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [errorMessage, setErrorMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiSetup, setAiSetup] = useState(false);

  const loadExample = () => {
    setLanguage('JavaScript');
    setCode(starterExample);
    setErrorMessage("TypeError: Cannot read properties of undefined (reading 'price')");
    setQuestion('');
    setAnalysis(null);
    setError('');
  };

  const analyze = async (event) => {
    event.preventDefault();
    setError('');
    setAnalysis(null);

    if (!code.trim()) {
      setError('Paste the code you want to debug.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/debugger/analyze', {
        code,
        language,
        errorMessage,
        question,
      });
      setAnalysis(data.analysis);
      addToast({
        type: 'success',
        title: 'Analysis ready',
        message: 'Read the explanation, then try the fix yourself.',
      });
    } catch (err) {
      setError(errorMessage(err));
      if (isAiSetupError(err)) setAiSetup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AI code debugger"
        title="Turn errors into understanding"
        subtitle="Paste your code and the error. Your mentor explains the bug, the reason, the fix and how to avoid it next time."
        actions={
          <button type="button" className="btn-secondary" onClick={loadExample}>
            <Play className="h-4 w-4" />
            Load example bug
          </button>
        }
      />

      {aiSetup ? <SetupNotice /> : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={analyze} className="card space-y-5 p-5 sm:p-6">
          <div>
            <label htmlFor="language" className="label">Programming language</label>
            <select
              id="language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="input cursor-pointer"
              disabled={loading}
            >
              {languages.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="code" className="label !mb-0">Your code</label>
              <span className="text-[10px] font-medium text-slate-400">{code.length.toLocaleString()} / 12,000</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1526] shadow-inner">
              <div className="flex items-center gap-1.5 border-b border-slate-800 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-[10px] font-medium text-slate-500">code.{language === 'Python' ? 'py' : 'js'}</span>
              </div>
              <textarea
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                rows={14}
                maxLength={12_000}
                spellCheck={false}
                placeholder="Paste your code here..."
                className="w-full resize-y bg-transparent p-4 font-mono text-[13px] leading-6 text-slate-100 placeholder:text-slate-600 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="errorMessage" className="label">Error message (optional)</label>
            <textarea
              id="errorMessage"
              rows={3}
              maxLength={4000}
              value={errorMessage}
              onChange={(event) => setErrorMessage(event.target.value)}
              placeholder="Paste the exact error output, if you have one..."
              className="input resize-none font-mono text-xs"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="question" className="label">Your question (optional)</label>
            <input
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={500}
              placeholder="e.g. Why does the loop stop one item early?"
              className="input"
              disabled={loading}
            />
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-relaxed text-rose-700" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing your code...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Explain this bug
              </>
            )}
          </button>

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-muted">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            Your code is analysed as text only. LifePilot never executes submitted code on the server.
          </div>
        </form>

        <div className="space-y-4">
          {loading ? (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <Bug className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-ink">Reading your code carefully...</p>
                  <p className="text-xs text-ink-muted">Finding the root cause, not just the symptom.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-20 w-full" />
                <div className="skeleton h-4 w-1/4" />
                <div className="skeleton h-24 w-full" />
                <div className="skeleton h-36 w-full" />
              </div>
            </div>
          ) : analysis ? (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Debug analysis ready
                </div>
                <span className="text-[10px] font-medium text-emerald-700/70">{analysis.language}</span>
              </div>

              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <section key={section.key} className="card p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <span className={cn('grid h-9 w-9 place-items-center rounded-xl border', section.tone)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                          Step {section.number}
                        </p>
                        <h2 className="font-display text-base font-bold text-ink">{section.title}</h2>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">
                      {analysis[section.key]}
                    </p>
                  </section>
                );
              })}

              <section className="card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                      <Code2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Step 04</p>
                      <h2 className="font-display text-base font-bold text-ink">Corrected code</h2>
                    </div>
                  </div>
                  <span className="badge-slate">{analysis.language}</span>
                </div>
                <div className="p-4 sm:p-5">
                  <Markdown>{`\`\`\`${analysis.language.toLowerCase()}\n${analysis.correctedCode}\n\`\`\``}</Markdown>
                </div>
              </section>

              <section className="card border-brand-100 bg-gradient-to-br from-brand-50/70 to-white p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-brand-600 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">Step 05</p>
                    <h2 className="font-display text-base font-bold text-ink">Prevent it next time</h2>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-soft">{analysis.prevention}</p>
              </section>
            </>
          ) : (
            <div className="card flex h-full min-h-[420px] flex-col items-center justify-center p-8 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-50 to-blue-50 text-brand-600">
                <Bug className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-lg font-bold text-ink">Your debug report will appear here</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                Paste code on the left and submit. You’ll get a clear explanation, a corrected
                example and a habit to prevent the same mistake.
              </p>
              <div className="mt-6 grid w-full max-w-sm gap-2 text-left">
                {[
                  'What is wrong, in plain language',
                  'Why the error happened',
                  'A fix you can understand',
                  'How to avoid it next time',
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[10px] font-bold text-brand-600 shadow-sm">
                      {index + 1}
                    </span>
                    <span className="text-xs text-ink-muted">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
