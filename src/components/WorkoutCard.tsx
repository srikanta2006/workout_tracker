import { format, parseISO } from 'date-fns';
import { Dumbbell, ChevronRight } from 'lucide-react';
import type { WorkoutSession } from '../types';

interface WorkoutCardProps {
  workout: WorkoutSession;
  onClick: () => void;
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const totalVolume = workout.exercises.reduce((acc, ex) => {
    const exVolume = ex.sets.reduce((setAcc, set) => setAcc + ((Number(set.reps) || 0) * (Number(set.weight) || 0)), 0);
    return acc + exVolume;
  }, 0);

  return (
    <div 
      onClick={onClick}
      className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-3xl p-5 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer hover:border-[var(--color-brand-500)] hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all active:scale-95 relative overflow-hidden"
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-brand-500)]/5 rounded-full blur-2xl pointer-events-none"></div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">{workout.muscleGroups?.join(', ')} Day</h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{format(parseISO(workout.date), 'EEEE, MMMM do')}</p>
        </div>
        <div className="bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] p-3 rounded-2xl shadow-inner z-10">
          <Dumbbell className="w-5 h-5 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
        <div className="flex gap-4 text-[var(--color-text-muted)]">
          <div>
            <span className="font-semibold text-[var(--color-text-main)]">{workout.exercises.length}</span> Exercises
          </div>
          <div>
            <span className="font-semibold text-[var(--color-text-main)]">{totalVolume}</span> kg Vol
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
      </div>
    </div>
  );
}
