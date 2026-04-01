import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while determining auth or fetching profile
  if (loading || (user && !profile)) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-[var(--color-bg-base)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-[var(--color-brand-500)] border-t-transparent" />
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Trapped in Onboarding
  if (!profile?.onboarding_completed && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent re-entering onboarding if already done
  if (profile?.onboarding_completed && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
