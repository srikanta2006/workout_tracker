import { useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { WorkoutCard } from '../components/WorkoutCard';
import { RecoveryWidget } from '../components/RecoveryWidget';
import { Dumbbell, Calendar, Play, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { differenceInDays, startOfDay } from 'date-fns';

export function Dashboard() {
  const { workouts, deleteWorkout, activeProgram, programs, routines } = useWorkoutState();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Active Program Logic
  const activeProg = activeProgram ? programs.find(p => p.id === activeProgram.programId) : null;
  let currentDaySchedule: { dayNumber: number; routineId: string | null } | undefined;
  let daysPassed = 0;
  let currentCycleDay = 0;
  let routineToPerform: { id: string; name: string } | undefined;

  if (activeProg && activeProgram) {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(activeProgram.startDate));
    daysPassed = Math.max(0, differenceInDays(today, start));
    currentCycleDay = (daysPassed % activeProg.lengthInDays) + 1;
    
    currentDaySchedule = activeProg.schedule.find(s => s.dayNumber === currentCycleDay);
    if (currentDaySchedule && currentDaySchedule.routineId) {
      routineToPerform = routines.find(r => r.id === currentDaySchedule!.routineId);
    }
  }

  if (workouts.length === 0 && !activeProg) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full mt-20 text-center px-4 w-full">
        <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-border-subtle)] mb-6">
          <Dumbbell className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">No Workouts Yet</h2>
          <p className="text-[var(--color-text-muted)] mb-6">Time to hit the gym. Start your first workout session now!</p>
          <Link
            to="/workout"
            className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-6 py-3 rounded-lg font-semibold inline-block transition-colors"
          >
            Log a Workout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">History</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            You've completed {workouts.length} {workouts.length === 1 ? 'session' : 'sessions'}.
          </p>
        </div>
      </div>

      {activeProg && (
        <div className="bg-gradient-to-br from-[var(--color-brand-500)] to-blue-600 rounded-xl p-5 shadow-lg mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Calendar className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active Cycle</span>
              <span className="text-sm font-semibold opacity-90">{activeProg.name}</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-4 drop-shadow-sm">
              Day {currentCycleDay} <span className="text-white/70 text-lg">/ {activeProg.lengthInDays}</span>
            </h3>

            {routineToPerform ? (
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
                <p className="text-sm font-bold opacity-90 mb-1 uppercase tracking-wider text-blue-100">Workout Today</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{routineToPerform.name}</span>
                  <button 
                    onClick={() => navigate(`/workout?routineId=${routineToPerform.id}`)}
                    className="bg-white text-[var(--color-brand-600)] hover:bg-white/90 px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-transform active:scale-95 flex items-center gap-1"
                  >
                    <Play className="w-4 h-4 fill-current" /> Start
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20 flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg flex items-center gap-2"><Moon className="w-5 h-5" /> Rest Day</p>
                  <p className="text-sm opacity-80 mt-0.5">Recover and rebuild.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RecoveryWidget />

      <div className="flex-1 w-full space-y-4">
        {workouts.map(workout => (
          <div key={workout.id}>
            <WorkoutCard
              workout={workout}
              onClick={() => setSelectedWorkoutId(selectedWorkoutId === workout.id ? null : workout.id)}
            />
            {selectedWorkoutId === workout.id && (
              <div className="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border-subtle)] mb-4 -mt-2 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold">Workout Details</h4>
                  <div className="flex gap-2">
                    <Link
                      to={`/workout/${workout.id}`}
                      className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] text-sm font-medium px-3 py-1 rounded border border-[var(--color-brand-500)]/20 hover:bg-[var(--color-brand-500)]/5"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => deleteWorkout(workout.id)}
                      className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {workout.exercises.map((ex, idx) => (
                  <div key={ex.id} className="mb-4 last:mb-0">
                    <p className="font-medium text-sm text-[var(--color-brand-600)] mb-2">{idx + 1}. {ex.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-[var(--color-text-muted)] mb-1 px-2 border-b border-[var(--color-border-subtle)] pb-1">
                      <span>Set</span>
                      <span className="text-center">lbs/kg</span>
                      <span className="text-right">Reps</span>
                    </div>
                    {ex.sets.map(set => (
                      <div key={set.id} className="grid grid-cols-3 gap-2 text-sm px-2 py-1 bg-[--color-bg-base] rounded mb-1">
                        <span className="text-[var(--color-text-muted)]">{set.setNumber}</span>
                        <span className="font-medium text-center">{set.weight || '-'}</span>
                        <span className="font-medium text-right">{set.reps || '-'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
