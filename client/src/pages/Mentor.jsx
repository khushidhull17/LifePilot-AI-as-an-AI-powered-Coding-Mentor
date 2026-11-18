import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Clock,
  History,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Markdown from '../components/Markdown.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage, isAiSetupError } from '../lib/api.js';
import { cn, timeAgo } from '../lib/utils.js';

const suggestions = [
  {
    icon: Lightbulb,
    title: 'Explain a concept',
    prompt: 'Explain JavaScript closures like I am a complete beginner, with one tiny example.',
  },
  {
    icon: MessageSquare,
    title: 'Give me a hint',
    prompt: 'I am learning DOM events. Give me a hint for a click-counter mini-project without showing the full solution.',
  },
  {
    icon: Sparkles,
    title: 'Hinglish please',
    prompt: 'Hinglish mein samjhao: what is an API and why do developers use it?',
  },
  {
    icon: Bot,
    title: 'Debug mindset',
    prompt: 'How should I debug my code when I get an error? Teach me a repeatable process.',
  },
];

function TypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white">
        <Bot className="h-4 w-4" />
      </span>
      <div className="rounded-2xl rounded-tl-md border border-slate-100 bg-white px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-400" />
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-400 [animation-delay:180ms]" />
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-brand-400 [animation-delay:360ms]" />
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">Thinking about the best way to explain this...</p>
      </div>
    </div>
  );
}

export default function Mentor() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [aiConfigured, setAiConfigured] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chat, setChat] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const endRef = useRef(null);
  const inputRef = useRef(null);

  const loadChats = async () => {
    try {
      const { data } = await api.get('/mentor/chats');
      setChats(data.chats);
      setAiConfigured(data.aiConfigured);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChatsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat?.messages?.length, sending]);

  const openChat = async (chatId) => {
    if (chatId === activeChatId) {
      setHistoryOpen(false);
      return;
    }
    setChatLoading(true);
    setError('');
    setHistoryOpen(false);
    try {
      const { data } = await api.get(`/mentor/chats/${chatId}`);
      setChat(data.chat);
      setActiveChatId(chatId);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setChatLoading(false);
    }
  };

  const newChat = () => {
    setChat(null);
    setActiveChatId(null);
    setError('');
    setHistoryOpen(false);
    inputRef.current?.focus();
  };

  const send = async (override) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;

    const previousChat = chat;
    const optimistic = {
      ...(chat || { _id: 'new', title: 'New conversation', messages: [] }),
      messages: [
        ...(chat?.messages || []),
        { role: 'user', content: text, createdAt: new Date().toISOString() },
      ],
    };

    setChat(optimistic);
    setInput('');
    setSending(true);
    setError('');

    try {
      const { data } = await api.post('/mentor/chat', {
        ...(activeChatId ? { chatId: activeChatId } : {}),
        message: text,
      });
      setChat(data.chat);
      setActiveChatId(data.chat._id);
      await loadChats();
    } catch (err) {
      setChat(previousChat);
      setInput(text);
      setError(errorMessage(err));
      if (isAiSetupError(err)) setAiConfigured(false);
    } finally {
      setSending(false);
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const deleteChat = async () => {
    if (!activeChatId) return;
    setDeleting(true);
    try {
      await api.delete(`/mentor/chats/${activeChatId}`);
      addToast({ type: 'success', title: 'Conversation deleted' });
      setDeleteOpen(false);
      newChat();
      await loadChats();
    } catch (err) {
      addToast({ type: 'error', title: 'Could not delete chat', message: errorMessage(err) });
    } finally {
      setDeleting(false);
    }
  };

  const chatTitle = chat?.title || 'New conversation';
  const messages = chat?.messages || [];

  const historyList = (
    <div className="space-y-1">
      {chats.length ? (
        chats.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openChat(item.id)}
            className={cn(
              'w-full rounded-xl px-3 py-2.5 text-left transition',
              activeChatId === item.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-100'
            )}
          >
            <p className="truncate text-xs font-semibold text-ink-soft">{item.title}</p>
            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {item.messageCount} messages • {timeAgo(item.lastMessageAt)}
            </p>
          </button>
        ))
      ) : (
        <p className="px-3 py-6 text-center text-xs text-slate-400">No conversations yet.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="AI coding mentor"
        title="Learn with a patient AI tutor"
        subtitle="Ask in simple English or Hinglish. Get explanations, hints and line-by-line help — adapted to your level."
        actions={
          <button type="button" className="btn-primary" onClick={newChat}>
            <Plus className="h-4 w-4" />
            New chat
          </button>
        }
      />

      {!aiConfigured ? <SetupNotice /> : null}

      <div className="card flex h-[calc(100dvh-12rem)] min-h-[560px] overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-slate-50/40 lg:flex xl:w-72">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">History</p>
            <button type="button" onClick={newChat} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-700" aria-label="New chat">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {chatsLoading ? (
              <div className="space-y-2 p-2">
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-12 w-full" />
              </div>
            ) : (
              historyList
            )}
          </div>
          <div className="border-t border-slate-100 p-3">
            <div className="rounded-xl bg-white p-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold text-ink-soft">
                <Clock className="h-3.5 w-3.5 text-brand-500" />
                Chats are saved
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Come back anytime. Your mentor remembers the conversation.
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-sm">
                <Bot className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{chatTitle}</p>
                <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  LifePilot Mentor • {user?.skillLevel?.replace('-', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
                aria-label="Conversation history"
              >
                <History className="h-[18px] w-[18px]" />
              </button>
              {activeChatId ? (
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto bg-[#fbfcff] px-3 py-5 sm:px-6">
            {chatLoading ? (
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="skeleton h-16 w-3/4" />
                <div className="ml-auto skeleton h-12 w-1/2" />
                <div className="skeleton h-24 w-4/5" />
              </div>
            ) : messages.length ? (
              <div className="mx-auto max-w-3xl space-y-5">
                {messages.map((message, index) => (
                  <div
                    key={`${message.createdAt}-${index}`}
                    className={cn('flex items-start gap-3', message.role === 'user' && 'flex-row-reverse')}
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white shadow-sm',
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-ocean-500 to-brand-500'
                          : 'bg-gradient-to-br from-brand-600 to-ocean-600'
                      )}
                    >
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </span>
                    <div
                      className={cn(
                        'max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[80%]',
                        message.role === 'user'
                          ? 'rounded-tr-md bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-md shadow-brand-600/15'
                          : 'rounded-tl-md border border-slate-100 bg-white shadow-sm'
                      )}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      ) : (
                        <Markdown>{message.content}</Markdown>
                      )}
                    </div>
                  </div>
                ))}
                {sending ? <TypingBubble /> : null}
                <div ref={endRef} />
              </div>
            ) : (
              <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center py-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 -z-10 rounded-full bg-brand-300/30 blur-2xl" aria-hidden="true" />
                  <span className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-brand-600 to-ocean-600 text-white shadow-xl shadow-brand-600/25">
                    <Bot className="h-8 w-8" />
                  </span>
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-ink sm:text-2xl">
                  Hi {user?.name?.split(' ')[0] || 'there'}, what are we learning today?
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                  Ask a question, paste a confusing error, or request a hint. I’ll adapt to your
                  level and never dump a full solution before you’ve had a chance to try.
                </p>

                <div className="mt-6 grid w-full gap-2.5 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => send(suggestion.prompt)}
                      disabled={!aiConfigured}
                      className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md disabled:opacity-50"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                        <suggestion.icon className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-xs font-semibold text-ink">{suggestion.title}</span>
                        <span className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-muted">
                          {suggestion.prompt}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-3 sm:p-4">
            {error ? (
              <div className="mb-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs leading-relaxed text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                maxLength={4000}
                placeholder={aiConfigured ? 'Ask your mentor anything... (Shift+Enter for a new line)' : 'Add GEMINI_API_KEY to enable the mentor'}
                className="input max-h-32 min-h-[46px] resize-none py-3"
                disabled={sending || !aiConfigured}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={sending || !input.trim() || !aiConfigured}
                className="btn-primary h-[46px] w-[46px] shrink-0 p-0"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              AI can make mistakes. Test code before using it. Your chats are private to your account.
            </p>
          </div>
        </div>
      </div>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Conversation history" size="sm">
        {historyList}
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteChat}
        loading={deleting}
        title="Delete this conversation?"
        description="This permanently removes this chat and its messages from your account."
        confirmLabel="Delete chat"
        tone="danger"
      />
    </div>
  );
}
