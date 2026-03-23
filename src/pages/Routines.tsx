import { useWorkoutState } from '../hooks/useWorkoutState';
import { Dumbbell, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Routines() {
  const { routines, deleteRoutine } = useWorkoutState();
  const navigate = useNavigate();

  if (routines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full mt-20 text-center px-4 w-full">
        <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--color-border-subtle)] mb-6">
          <Dumbbell className="w-12 h-12 text-[var(--color-brand-500)] mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold mb-2">No Routines Yet</h2>
          <p className="text-[var(--color-text-muted)] mb-6">Create routine templates to quickly start your favorite workouts.</p>
          <Link
            to="/workout"
            className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-6 py-3 rounded-lg font-semibold inline-block transition-colors"
          >
            Create from New Workout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Routines</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Tap a routine to quick-start a workout.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full space-y-4">
        {routines.map(routine => (
          <div key={routine.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm hover:border-[var(--color-brand-500)] transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-main)]">{routine.name}</h3>
                <div className="text-sm text-[var(--color-text-muted)] mt-1">{routine.muscleGroup} Day</div>
              </div>
              <button 
                onClick={() => deleteRoutine(routine.id)}
                className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-1 rounded border border-red-200 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
            
            <div className="text-sm text-[var(--color-text-muted)] mb-4">
              <span className="font-semibold">{routine.exercises.length}</span> exercises included
            </div>

            <button 
              onClick={() => navigate(`/workout?routineId=${routine.id}`)}
              className="w-full bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)] hover:text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> Start Routine
            </button>
          </div>
        ))}

        <button 
          onClick={() => navigate('/workout')}
          className="w-full py-4 border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Routine from Scratch
        </button>
      </div>
    </div>
  );
}
