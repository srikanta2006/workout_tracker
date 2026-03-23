import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, History, Dumbbell, BarChart2, ClipboardList, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] w-full max-w-md mx-auto relative shadow-2xl overflow-hidden border-x border-[var(--color-border-subtle)]">
      {/* Header */}
      <header className="px-4 py-4 bg-[var(--color-bg-card)] border-b border-[var(--color-border-subtle)] sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)]" />
          <h1 className="text-xl font-bold tracking-tight">ParkWise Workout</h1>
        </div>
        <Link to="/settings" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors p-1">
          <SettingsIcon className="w-5 h-5" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full flex flex-col pt-4 pb-24 items-center px-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-[var(--color-bg-card)] border-t border-[var(--color-border-subtle)] z-20 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <Link
            to="/"
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location.pathname === '/' ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-muted)] hover:text-gray-300"
            )}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-medium">History</span>
          </Link>
          <div className="w-px h-8 bg-[var(--color-border-subtle)] opacity-50"></div>
          <Link
            to="/stats"
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location.pathname === '/stats' ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-muted)] hover:text-gray-300"
            )}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[10px] font-medium">Stats</span>
          </Link>
          <div className="w-px h-8 bg-[var(--color-border-subtle)] opacity-50"></div>
          <Link
            to="/routines"
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location.pathname === '/routines' ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-muted)] hover:text-gray-300"
            )}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="text-[10px] font-medium">Routines</span>
          </Link>
          <div className="w-px h-8 bg-[var(--color-border-subtle)] opacity-50"></div>
          <Link
            to="/workout"
            className={clsx(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              location.pathname.startsWith('/workout') ? "text-[var(--color-brand-600)]" : "text-[var(--color-text-muted)] hover:text-gray-300"
            )}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-medium">Log</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
