import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Settings as SettingsIcon, Dumbbell, Calendar, Play, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { AchievementUnlockPopup } from './AchievementUnlockPopup';

export function Layout() {
  const location = useLocation();

  // Consolidating to 4 core tabs for an ultra-clean, native application feel.
  const NAV_ITEMS = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Planner', path: '/routines', icon: Calendar },
    { name: 'Session', path: '/session', icon: Play },
    { name: 'Measure', path: '/stats', icon: BarChart2 },
    { name: 'Trophies', path: '/achievements', icon: Trophy },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-bg-base)] text-[var(--color-text-main)] w-full overflow-hidden font-sans">
      
      {/* --- DESKTOP / TABLET SLIM NAVIGATION --- */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 h-full bg-[var(--color-bg-card)] border-r border-[var(--color-border-subtle)] flex-shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-[var(--color-border-subtle)]">
          <Dumbbell className="w-8 h-8 text-[var(--color-brand-500)] flex-shrink-0" />
          <h1 className="text-xl font-bold tracking-tight hidden lg:block">MaxOut</h1>
        </div>
        
        <nav className="flex-1 py-6 px-3 lg:px-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const searchParams = new URLSearchParams(location.search);
            const isTemplateMode = searchParams.get('mode') === 'template';

            const isActive = location.pathname === item.path || 
              (item.path === '/routines' && location.pathname.startsWith('/workout') && isTemplateMode) ||
              (item.path === '/session' && location.pathname.startsWith('/workout') && !isTemplateMode);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center justify-center lg:justify-start gap-4 p-3 lg:px-4 lg:py-3 rounded-xl font-semibold transition-all active:scale-95 group",
                  isActive 
                    ? "bg-[var(--color-brand-500)] text-white shadow-md" 
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-main)]"
                )}
                title={item.name}
              >
                <Icon className={clsx("w-6 h-6", isActive ? "text-white" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)]")} />
                <span className="hidden lg:block">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto w-full custom-scrollbar relative">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden sticky top-0 z-40 bg-[var(--color-bg-card)]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] px-4 py-3 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)]" />
          <h1 className="text-xl font-bold tracking-tight">MaxOut</h1>
        </header>

        <div className="w-full max-w-7xl mx-auto px-4 py-6 pb-24 md:pb-12 md:p-8">
          <div key={location.pathname} className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>
      </main>

      {/* --- MOBILE SOLID BOTTOM TAB BAR --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg-card)]/95 backdrop-blur-xl border-t border-[var(--color-border-subtle)] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around h-[4.5rem] px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const searchParams = new URLSearchParams(location.search);
            const isTemplateMode = searchParams.get('mode') === 'template';

            const isActive = location.pathname === item.path || 
              (item.path === '/routines' && location.pathname.startsWith('/workout') && isTemplateMode) ||
              (item.path === '/session' && location.pathname.startsWith('/workout') && !isTemplateMode);

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full pt-1 pb-2 space-y-1 active:scale-95 transition-transform"
              >
                <div className={clsx(
                  "p-1.5 rounded-full transition-colors",
                  isActive ? "bg-[var(--color-brand-500)]/20 text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={clsx(
                  "text-[10px] font-bold tracking-wide",
                  isActive ? "text-[var(--color-brand-500)]" : "text-[var(--color-text-muted)]"
                )}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <AchievementUnlockPopup />
    </div>
  );
}
