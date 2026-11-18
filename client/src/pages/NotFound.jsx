import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="grid min-h-screen place-items-center bg-[#f7f8fd] px-5">
      <div className="w-full max-w-md text-center">
        <Logo className="justify-center" />
        <div className="mx-auto mt-10 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-100 to-blue-100 text-brand-600">
          <Compass className="h-10 w-10" />
        </div>
        <p className="mt-6 font-display text-5xl font-extrabold text-gradient">404</p>
        <h1 className="mt-3 font-display text-xl font-bold text-ink">This path doesn’t exist</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Even the best roadmaps take a wrong turn sometimes. Let’s get you back to a familiar place.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to={user ? '/dashboard' : '/'} className="btn-primary">
            <ArrowLeft className="h-4 w-4" />
            {user ? 'Back to dashboard' : 'Back home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
