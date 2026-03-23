import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { RestTimer } from '../components/RestTimer';
import { COMMON_EXERCISES } from '../data/exercises';
import type { MuscleGroup, WorkoutSession, Exercise, Routine, WorkoutSet } from '../types';
import { Plus, Trash2, Dumbbell, Save, ClipboardList } from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

export function ActiveWorkout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');
  const { workouts, routines, addWorkout, updateWorkout, addRoutine } = useWorkoutState();
  
  const existingWorkout = id ? workouts.find(w => w.id === id) : null;
  const existingRoutine = routineId ? routines.find(r => r.id === routineId) : null;

  const [date, setDate] = useState(() => existingWorkout?.date || new Date().toISOString().split('T')[0]);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>(() => existingWorkout?.muscleGroup || existingRoutine?.muscleGroup || 'Chest');
  
  const initialExercises = () => {
    if (existingWorkout) return existingWorkout.exercises;
    if (existingRoutine) {
      return existingRoutine.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: [{ id: crypto.randomUUID(), setNumber: 1, reps: '', weight: '' }] as WorkoutSet[]
      }));
    }
    return [{ 
      id: crypto.randomUUID(), 
      name: '', 
      sets: [{ id: crypto.randomUUID(), setNumber: 1, reps: '', weight: '' }] as WorkoutSet[]
    }];
  };

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);

  const handleAddExercise = () => {
    setExercises([...exercises, { 
      id: crypto.randomUUID(), 
      name: '', 
      sets: [{ id: crypto.randomUUID(), setNumber: 1, reps: '', weight: '' }] as WorkoutSet[]
    }]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name } : ex));
  };

  const handleAddSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, { id: crypto.randomUUID(), setNumber: ex.sets.length + 1, reps: '', weight: '' } as WorkoutSet]
        };
      }
      return ex;
    }));
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const nextSets = ex.sets.filter(s => s.id !== setId).map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return { ...ex, sets: nextSets };
      }
      return ex;
    }));
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const parsedVal = value === '' ? '' : Number(value);
              return { ...s, [field]: parsedVal };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  };

  const handleSaveWorkout = () => {
    if (exercises.length === 0 || exercises.some(ex => !ex.name.trim())) {
      alert("Please ensure all exercises have a name and there's at least one exercise.");
      return;
    }
    
    const newWorkout: WorkoutSession = {
      id: existingWorkout ? existingWorkout.id : crypto.randomUUID(),
      date,
      muscleGroup,
      exercises
    };

    if (existingWorkout) {
      updateWorkout(existingWorkout.id, newWorkout);
    } else {
      addWorkout(newWorkout);
    }
    navigate('/');
  };

  const handleSaveAsRoutine = () => {
    if (exercises.length === 0 || exercises.some(ex => !ex.name.trim())) {
      alert("Please ensure all exercises have a name and there's at least one exercise.");
      return;
    }

    const name = window.prompt("Enter a name for this routine:", `${muscleGroup} Workout`);
    if (!name) return;

    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name,
      muscleGroup,
      exercises: exercises.map(ex => ({ id: ex.id, name: ex.name })) // Strips out actual sets, preserving only the exercises
    };

    addRoutine(newRoutine);
    alert('Routine saved!');
  };

  return (
    <div className="w-full h-full flex flex-col pb-8">
      {/* Exercise Datalist for Autocomplete */}
      <datalist id="exercise-library">
        {COMMON_EXERCISES.map(ex => <option key={ex} value={ex} />)}
      </datalist>

      <div className="mb-6 px-1 border-b border-[var(--color-border-subtle)] pb-4">
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)]" />
          {existingWorkout ? 'Edit Workout' : (existingRoutine ? `Routine: ${existingRoutine.name}` : 'Log Workout')}
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Target</label>
            <select
              value={muscleGroup}
              onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors"
            >
              {MUSCLE_GROUPS.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <RestTimer />

      <div className="flex-1 space-y-6">
        {exercises.map((exercise, idx) => (
          <div key={exercise.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm relative pt-10">
            <span className="absolute top-0 left-0 bg-[var(--color-brand-500)] text-white text-xs font-bold px-3 py-1 rounded-tl-xl rounded-br-lg">
              Exercise {idx + 1}
            </span>
            
            <button 
              onClick={() => handleRemoveExercise(exercise.id)}
              className="absolute top-2 right-2 p-1 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              aria-label="Remove exercise"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <input 
              type="text"
              list="exercise-library"
              placeholder="Search or type exercise..."
              value={exercise.name}
              onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
              className="w-full bg-transparent border-b border-[var(--color-border-subtle)] pb-2 mb-4 text-lg font-bold text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)] transition-colors placeholder:font-normal placeholder:opacity-50"
            />

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                <div className="col-span-2 text-center">Set</div>
                <div className="col-span-4 text-center">lbs/kg</div>
                <div className="col-span-4 text-center">Reps</div>
                <div className="col-span-2 text-center"></div>
              </div>

              {exercise.sets.map((set) => (
                <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-[var(--color-bg-base)] rounded-lg p-2">
                  <div className="col-span-2 text-center font-medium text-[var(--color-text-muted)]">
                    {set.setNumber}
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="number" 
                      inputMode="decimal"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                      className="w-full bg-transparent text-center font-bold outline-none text-[var(--color-text-main)]"
                    />
                  </div>
                  <div className="col-span-4">
                    <input 
                      type="number" 
                      inputMode="numeric"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                      className="w-full bg-transparent text-center font-bold outline-none text-[var(--color-text-main)]"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <button 
                      onClick={() => handleRemoveSet(exercise.id, set.id)}
                      disabled={exercise.sets.length === 1}
                      className="text-[var(--color-text-muted)] hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleAddSet(exercise.id)}
              className="w-full mt-4 py-2 border border-dashed border-[var(--color-border-subtle)] rounded-lg text-sm font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex justify-center items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Set
            </button>
          </div>
        ))}

        <button 
          onClick={handleAddExercise}
          className="w-full py-4 border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Exercise
        </button>
      </div>

      <div className="mt-8 pt-4 border-t border-[var(--color-border-subtle)] space-y-3">
        <button 
          onClick={handleSaveWorkout}
          className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <Save className="w-5 h-5" /> {existingWorkout ? 'Save Changes' : 'Save Workout'}
        </button>
        <button 
          onClick={handleSaveAsRoutine}
          className="w-full bg-[var(--color-bg-card)] border border-[var(--color-brand-500)] text-[var(--color-brand-600)] py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-[var(--color-brand-500)]/5 transition-all active:scale-[0.98]"
        >
          <ClipboardList className="w-5 h-5" /> Save as Template
        </button>
      </div>
    </div>
  );
}
