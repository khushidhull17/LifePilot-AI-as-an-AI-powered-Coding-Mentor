import { KeyRound, ArrowUpRight } from 'lucide-react';

export default function SetupNotice({ compact = false, title = 'AI needs a Gemini API key' }) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-amber-900">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="leading-relaxed">
          {title}. Add <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold">GEMINI_API_KEY</code> to{' '}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs font-semibold">server/.env</code> and restart the
          server.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-ink">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            LifePilot uses Google Gemini for real AI responses. Add your key to{' '}
            <code className="rounded-md bg-white px-1.5 py-0.5 text-xs font-semibold text-ink-soft">
              server/.env
            </code>{' '}
            and restart the API server.
          </p>
          <div className="code-block mt-4 max-w-md">
            <pre className="!p-3 !text-xs">GEMINI_API_KEY=your_gemini_api_key</pre>
          </div>
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Get a free Gemini API key
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
