import { format } from 'date-fns';
import { Dumbbell, Calendar, ChevronRight } from 'lucide-react';
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
      className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 mb-4 shadow-sm cursor-pointer hover:border-[var(--color-brand-500)] transition-colors active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)]">{workout.muscleGroup} Day</h3>
          <div className="flex items-center text-sm text-[var(--color-text-muted)] mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            {format(new Date(workout.date), 'MMM d, yyyy')}
          </div>
        </div>
        <div className="bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] p-2 rounded-lg">
          <Dumbbell className="w-5 h-5" />
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
