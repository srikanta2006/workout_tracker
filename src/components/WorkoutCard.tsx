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
      className="group relative glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 cursor-pointer active:scale-[0.98] overflow-hidden"
    >
      {/* Subtle background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand-500)]/5 via-transparent to-blue-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-1 group-hover:text-[var(--color-brand-500)] transition-colors duration-300">
              {workout.muscleGroups?.join(', ')} Day
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">{format(parseISO(workout.date), 'EEEE, MMMM do')}</p>
          </div>
          <div className="bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-3 rounded-2xl shadow-lg group-hover:shadow-[var(--color-brand-500)]/20 group-hover:scale-105 transition-all duration-300">
            <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)]" />
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-subtle)]/30">
          <div className="flex gap-6 text-sm">
            <div className="text-center">
              <div className="text-2xl font-black text-[var(--color-text-main)] group-hover:text-[var(--color-brand-500)] transition-colors duration-300">
                {workout.exercises.length}
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Exercises</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-[var(--color-text-main)] group-hover:text-[var(--color-brand-500)] transition-colors duration-300">
                {totalVolume.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">kg Volume</div>
            </div>
          </div>
          <div className="bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 p-2 rounded-xl group-hover:bg-[var(--color-brand-500)]/10 group-hover:border-[var(--color-brand-500)]/30 transition-all duration-300">
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-brand-500)] group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
