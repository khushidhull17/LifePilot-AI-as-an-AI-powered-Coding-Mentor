import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SetupNotice from '../components/SetupNotice.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api, errorMessage } from '../lib/api.js';
import { formatDate, minutesLabel } from '../lib/utils.js';
import { levelLabels } from '../lib/navigation.js';

const languages = [
  'HTML, CSS & JavaScript',
  'Python',
  'Java',
  'C',
  'C++',
  'React.js',
  'Full Stack Web Development',
];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    skillLevel: user?.skillLevel || 'absolute-beginner',
    preferredLanguage: user?.preferredLanguage || 'HTML, CSS & JavaScript',
    dailyStudyTime: user?.dailyStudyTime || 60,
    learningGoal: user?.learningGoal || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [health, setHealth] = useState(null);

  useEffect(() => {
    api
      .get('/health')
      .then(({ data }) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  const setProfileField = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      const { data } = await api.patch('/users/me', {
        ...profile,
        learningGoal: profile.learningGoal.trim(),
      });
      updateUser(data.user);
      addToast({
        type: 'success',
        title: 'Profile updated',
        message: 'New roadmaps and AI advice will use these preferences.',
      });
    } catch (err) {
      setProfileError(errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError('');

    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
      addToast({ type: 'success', title: 'Password changed', message: 'Use it next time you log in.' });
    } catch (err) {
      setPasswordError(errorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile & settings"
        title="Make LifePilot fit you"
        subtitle="Your level, language, goal and daily time shape every roadmap and every AI explanation."
        actions={
          <Link to="/onboarding" className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Retake setup
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <form onSubmit={saveProfile} className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Learning profile</h2>
              <p className="text-xs text-ink-muted">Used for roadmaps, mentor answers and project ideas.</p>
            </div>
          </div>

          {profileError ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {profileError}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Your name</label>
              <input
                id="name"
                value={profile.name}
                onChange={(event) => setProfileField('name', event.target.value)}
                className="input"
                required
                minLength={2}
                maxLength={60}
              />
            </div>

            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input id="email" value={user?.email || ''} className="input bg-slate-50 pl-10 text-ink-muted" disabled />
              </div>
              <p className="field-hint">Email cannot be changed in this demo.</p>
            </div>

            <div>
              <label htmlFor="skillLevel" className="label">Current coding level</label>
              <select
                id="skillLevel"
                value={profile.skillLevel}
                onChange={(event) => setProfileField('skillLevel', event.target.value)}
                className="input cursor-pointer"
              >
                {Object.entries(levelLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="preferredLanguage" className="label">Preferred track</label>
              <select
                id="preferredLanguage"
                value={profile.preferredLanguage}
                onChange={(event) => setProfileField('preferredLanguage', event.target.value)}
                className="input cursor-pointer"
              >
                {languages.map((language) => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between">
                <label htmlFor="dailyStudyTime" className="label !mb-0">Daily study time</label>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-ink">
                  {minutesLabel(profile.dailyStudyTime)}
                </span>
              </div>
              <input
                id="dailyStudyTime"
                type="range"
                min="15"
                max="180"
                step="15"
                value={profile.dailyStudyTime}
                onChange={(event) => setProfileField('dailyStudyTime', Number(event.target.value))}
                className="mt-3 w-full accent-brand-600"
              />
              <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
                <span>15 min</span>
                <span>1 hour</span>
                <span>2 hours</span>
                <span>3 hours</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="learningGoal" className="label">Main learning goal</label>
              <textarea
                id="learningGoal"
                rows={3}
                maxLength={300}
                value={profile.learningGoal}
                onChange={(event) => setProfileField('learningGoal', event.target.value)}
                className="input resize-none"
                placeholder="e.g. Build a portfolio and get my first internship"
              />
              <p className="field-hint">
                Changing this does not rewrite your current roadmap. Generate a new one from{' '}
                <Link to="/roadmap" className="font-semibold text-brand-700">My Roadmap</Link> when you are ready.
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save profile
                </>
              )}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <form onSubmit={changePassword} className="card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Password</h2>
                <p className="text-xs text-ink-muted">Keep your account safe.</p>
              </div>
            </div>

            {passwordError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {passwordError}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="currentPassword" className="label">Current password</label>
                <input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="label">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="input"
                  value={passwords.confirm}
                  onChange={(event) => setPasswords((current) => ({ ...current, confirm: event.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-secondary mt-4 w-full" disabled={savingPassword}>
              {savingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Update password
                </>
              )}
            </button>
          </form>

          <section className="card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Account</h2>
                <p className="text-xs text-ink-muted">Member since {formatDate(user?.createdAt, { year: 'numeric' })}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-ink-muted">Plan</span>
                <span className="font-semibold text-ink">Free student account</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-ink-muted">AI status</span>
                <span className={health?.aiConfigured ? 'font-semibold text-emerald-600' : 'font-semibold text-amber-600'}>
                  {health ? (health.aiConfigured ? 'Gemini connected' : 'API key needed') : 'Checking...'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <span className="text-ink-muted">Database</span>
                <span className="font-semibold text-ink capitalize">{health?.database || 'Checking...'}</span>
              </div>
            </div>

            {health && !health.aiConfigured ? (
              <div className="mt-4">
                <SetupNotice compact />
              </div>
            ) : null}

            <button type="button" onClick={signOut} className="btn-danger mt-5 w-full">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </section>

          <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-ocean-600 p-5 text-white shadow-soft">
            <Sparkles className="h-5 w-5 text-white/80" />
            <h2 className="mt-2 font-display text-base font-bold">Preferences are context, not a cage</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              You can change your track at any time. Regenerate your roadmap when your goal changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
