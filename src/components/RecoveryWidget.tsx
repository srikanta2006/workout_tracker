import { useMemo } from 'react';
import { differenceInDays, startOfDay } from 'date-fns';
import { useWorkoutState } from '../hooks/useWorkoutState';
import type { MuscleGroup } from '../types';
import { Activity } from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/exercises';
import clsx from 'clsx';

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

export function RecoveryWidget() {
  const { workouts } = useWorkoutState();

  const recoveryStatus = useMemo(() => {
    const today = startOfDay(new Date());
    
    return MUSCLE_GROUPS.map(group => {
      // Find the most recent workout where at least one exercise of this muscle group was COMPLETED
      const recentWorkout = workouts.find(w => {
        return w.exercises.some(ex => {
          const hasCompleted = ex.sets.some(s => s.completed);
          if (!hasCompleted) return false;
          
          // Check if this exercise belongs to the group we're looking at
          const officialGroupExercises = EXERCISE_DATABASE[group] || [];
          return officialGroupExercises.includes(ex.name);
        });
      });
      
      let status: 'Fresh' | 'Recovering' | 'Fatigued' = 'Fresh';
      let daysAgo = -1;

      if (recentWorkout) {
        const workoutDateStr = recentWorkout.date;
        const [year, month, day] = workoutDateStr.split('-').map(Number);
        const workoutDate = new Date(year, month - 1, day);
        
        daysAgo = differenceInDays(today, workoutDate);
        
        if (daysAgo <= 1) {
          status = 'Fatigued';
        } else if (daysAgo === 2) {
          status = 'Recovering';
        }
      }

      return { group, status, daysAgo };
    });
  }, [workouts]);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm mb-6 w-full">
      <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[var(--color-text-main)] uppercase tracking-wider">
        <Activity className="w-4 h-4 text-[var(--color-brand-500)]" />
        Recovery Heatmap
      </h3>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {recoveryStatus.filter(s => s.group !== 'Full Body').map(({ group, status }) => (
          <div key={group} className="flex flex-col p-2 rounded-lg bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/50">
            <span className="text-xs font-semibold text-[var(--color-text-main)] mb-1">{group}</span>
            <div className="flex items-center gap-1.5">
              <div className={clsx("w-2 h-2 rounded-full", {
                'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]': status === 'Fresh',
                'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]': status === 'Recovering',
                'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]': status === 'Fatigued',
              })} />
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
