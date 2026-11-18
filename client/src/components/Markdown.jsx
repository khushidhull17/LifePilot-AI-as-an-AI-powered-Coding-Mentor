import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

const extractText = (node) => {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props?.children) return extractText(node.props.children);
  return '';
};

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const text = extractText(children);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked by the browser; silently ignore.
    }
  };

  return (
    <div className="code-block group relative">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2.5 top-2.5 z-10 inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-medium text-slate-300 opacity-0 backdrop-blur transition group-hover:opacity-100 focus:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      {children}
    </div>
  );
}

export default function Markdown({ children, className }) {
  return (
    <div className={`prose-lifepilot ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: CodeBlock,
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer" />
          ),
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  );
}
