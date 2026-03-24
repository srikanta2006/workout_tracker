import { useWorkoutState } from '../hooks/useWorkoutState';
import { Play, Shuffle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, startOfDay } from 'date-fns';

export function Session() {
  const { activeProgram, programs, routines } = useWorkoutState();
  const navigate = useNavigate();

  // Determine Active Routine for Today
  const activeProg = activeProgram ? programs.find(p => p.id === activeProgram.programId) : null;
  let routineToPerform: { id: string; name: string } | undefined;
  let currentCycleDay = 0;

  if (activeProg && activeProgram) {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(activeProgram.startDate));
    const daysPassed = Math.max(0, differenceInDays(today, start));
    currentCycleDay = (daysPassed % activeProg.lengthInDays) + 1;

    const currentDaySchedule = activeProg.schedule.find(s => s.dayNumber === currentCycleDay);
    if (currentDaySchedule && currentDaySchedule.routineId) {
      routineToPerform = routines.find(r => r.id === currentDaySchedule.routineId);
    }
  }

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-8 px-1">
        <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)]">Start Session</h2>
        <p className="text-[var(--color-text-muted)] mt-1 font-medium">
          Ready to train? Choose your path.
        </p>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-6">

        {/* Pathway 1: Active Routine */}
        <div className="animate-scale-spring bg-gradient-to-br from-[var(--color-bg-card)] to-[#1a1a1c] border border-[var(--color-border-subtle)] rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -right-10 p-4 opacity-5 transform rotate-12 pointer-events-none">
            <Calendar className="w-48 h-48 text-white" />
          </div>

          <div className="relative z-10 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-500)] mb-1">
              Active Routine
            </h3>
            {activeProg ? (
              <h4 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">
                {activeProg.name} <span className="text-[var(--color-text-muted)] text-lg">· Day {currentCycleDay}/{activeProg.lengthInDays}</span>
              </h4>
            ) : (
              <h4 className="text-xl font-bold text-[var(--color-text-muted)] tracking-tight">
                No active routine configured.
              </h4>
            )}
          </div>

          <div className="relative z-10">
            {activeProg ? (
              routineToPerform ? (
                <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl p-4 flex flex-col gap-4 shadow-inner">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Today's Template</p>
                    <p className="text-lg font-bold line-clamp-1">{routineToPerform.name}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/workout?routineId=${routineToPerform?.id}`)}
                    className="w-full bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5 fill-current" /> Follow Routine
                  </button>
                </div>
              ) : (
                <div className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2">
                  <p className="text-lg font-bold text-[var(--color-text-muted)]">Rest Day Scheduled</p>
                  <p className="text-sm text-[var(--color-text-muted)]">Take the day off, or bypass below.</p>
                </div>
              )
            ) : (
              <button
                onClick={() => navigate('/routines')}
                className="w-full border-2 border-dashed border-[var(--color-brand-500)]/50 text-[var(--color-brand-500)] bg-[var(--color-brand-500)]/5 hover:bg-[var(--color-brand-500)]/10 py-4 rounded-xl font-bold text-lg transition-all active:scale-[0.98]"
              >
                Go to Planner
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-2 opacity-30">
          <div className="flex-1 h-px bg-[var(--color-border-subtle)]"></div>
          <span className="text-xs font-bold uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-[var(--color-border-subtle)]"></div>
        </div>

        {/* Pathway 2: Freestyle */}
        <button
          onClick={() => navigate('/workout')}
          className="animate-fade-in-up stagger-1 bg-[var(--color-bg-card)] border-2 border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)]/50 rounded-3xl p-6 flex items-center gap-4 group transition-all active:scale-[0.98]"
        >
          <div className="bg-[var(--color-bg-base)] p-4 rounded-full group-hover:bg-[var(--color-brand-500)]/10 transition-colors">
            <Shuffle className="w-6 h-6 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] transition-colors" />
          </div>
          <div className="text-left">
            <h4 className="text-xl font-bold text-[var(--color-text-main)] mb-1">Bypass Routine</h4>
            <p className="text-sm font-medium text-[var(--color-text-muted)]">Start a blank workout and select new exercises on the fly.</p>
          </div>
        </button>

      </div>
    </div>
  );
}
