import { useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { WorkoutCard } from '../components/WorkoutCard';
import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { workouts, deleteWorkout } = useWorkoutState();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  if (workouts.length === 0) {
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
