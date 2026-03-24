import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { WorkoutTimer } from '../components/WorkoutTimer';
import { EXERCISE_DATABASE, ALL_EXERCISES } from '../data/exercises';
import type { MuscleGroup, WorkoutSession, Exercise, Routine, WorkoutSet } from '../types';
import { Plus, Trash2, Dumbbell, Save, ClipboardList, Trophy, History as HistoryIcon, Star } from 'lucide-react';

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];

export function ActiveWorkout() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');
  const isTemplateMode = searchParams.get('mode') === 'template';
  const { workouts, routines, addWorkout, updateWorkout, addRoutine, favoriteExercises, toggleFavoriteExercise, activeProgram, programs } = useWorkoutState();
  
  const existingWorkout = id ? workouts.find(w => w.id === id) : null;
  // If ?routineId= is passed, use it. OTHERWISE, check if there's an active program and find today's routine!
  let autoRoutineId = routineId;
  if (!existingWorkout && !autoRoutineId && activeProgram) {
    const activeProg = programs.find(p => p.id === activeProgram.programId);
    if (activeProg) {
      const today = new Date();
      today.setHours(0,0,0,0);
      const start = new Date(activeProgram.startDate);
      start.setHours(0,0,0,0);
      const daysPassed = Math.max(0, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const currentCycleDay = (daysPassed % activeProg.lengthInDays) + 1;
      const todaySchedule = activeProg.schedule.find(s => s.dayNumber === currentCycleDay);
      if (todaySchedule?.routineId) {
        autoRoutineId = todaySchedule.routineId;
      }
    }
  }

  const existingRoutine = autoRoutineId ? routines.find(r => r.id === autoRoutineId) : null;

  const [date, setDate] = useState(() => existingWorkout?.date || new Date().toISOString().split('T')[0]);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(() => existingWorkout?.muscleGroups || existingRoutine?.muscleGroups || ['Chest']);
  
  const initialExercises = () => {
    if (existingWorkout) return existingWorkout.exercises;
    if (existingRoutine) {
      return existingRoutine.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map(s => ({
          ...s,
          id: crypto.randomUUID(),
          completed: false
        }))
      }));
    }
    return isTemplateMode ? [] : [{ 
      id: crypto.randomUUID(), 
      name: '', 
      sets: [{ id: crypto.randomUUID(), setNumber: 1, reps: '', weight: '' }] as WorkoutSet[]
    }];
  };

  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [templateName, setTemplateName] = useState(() => existingRoutine?.name || '');

  // Dynamic Datalist Options - Combine all selected muscle groups into a single array
  const availableExercises = muscleGroups.includes('Full Body') 
    ? ALL_EXERCISES 
    : Array.from(new Set(muscleGroups.flatMap(mg => EXERCISE_DATABASE[mg] || [])));

  const getExerciseHistory = (exerciseName: string) => {
    if (!exerciseName.trim()) return null;
    const name = exerciseName.toLowerCase().trim();
    
    let maxWeight = 0;
    let lastWorkoutDate = new Date(0);
    let lastLiftStr = '';

    workouts.forEach(w => {
      if (existingWorkout && w.id === existingWorkout.id) return;

      w.exercises.forEach(ex => {
        if (ex.name.toLowerCase().trim() === name) {
          ex.sets.forEach(s => {
            const wgt = Number(s.weight) || 0;
            if (wgt > maxWeight) maxWeight = wgt;
          });

          const wDate = new Date(w.date);
          if (wDate > lastWorkoutDate) {
            lastWorkoutDate = wDate;
            const bestSet = ex.sets.reduce((best, current) => (Number(current.weight) || 0) > (Number(best.weight) || 0) ? current : best, ex.sets[0]);
            if (bestSet) {
               lastLiftStr = `${bestSet.weight} x ${bestSet.reps}`;
            }
          }
        }
      });
    });

    return { maxWeight, lastLiftStr, lastWorkoutDate: lastWorkoutDate.getTime() > 0 ? lastWorkoutDate : null };
  };

  const handleAddExercise = (defaultName: string = '') => {
    setExercises([...exercises, { 
      id: crypto.randomUUID(), 
      name: defaultName, 
      sets: [{ id: crypto.randomUUID(), setNumber: 1, reps: '', weight: '' }] as WorkoutSet[]
    }]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleUpdateExerciseName = (id: string, name: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, name } : ex));
  };

  const handleUpdateExerciseNotes = (id: string, notes: string) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, notes } : ex));
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

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'completed', value: string | boolean) => {
    setExercises(prev => {
      const updated = prev.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map(s => {
              if (s.id === setId) {
                if (field === 'completed') return { ...s, completed: value as boolean };
                const parsedVal = value === '' ? '' : Number(value);
                return { ...s, [field]: parsedVal };
              }
              return s;
            })
          };
        }
        return ex;
      });

      // Auto-save logic ONLY if ticking a set to true in a real workout
      if (field === 'completed' && value === true && !isTemplateMode) {
        if (existingWorkout) {
          updateWorkout(existingWorkout.id, { id: existingWorkout.id, date, muscleGroups, exercises: updated });
        } else if (updated.some(ex => ex.name.trim())) {
           // If it's a new workout, auto-create it so it saves to history immediately
           const newId = crypto.randomUUID();
           addWorkout({ id: newId, date, muscleGroups, exercises: updated });
           // We use replace to put the ID in the URL without pushing history, 
           // so that subsequent ticks will update the existing session
           navigate(`/workout/${newId}`, { replace: true });
        }
      }

      return updated;
    });
  };

  const handleSaveWorkout = () => {
    if (exercises.length === 0 || exercises.some(ex => !ex.name.trim())) {
      alert("Please ensure all exercises have a name and there's at least one exercise.");
      return;
    }
    
    const newWorkout: WorkoutSession = {
      id: existingWorkout ? existingWorkout.id : crypto.randomUUID(),
      date,
      muscleGroups,
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

    let finalName = templateName.trim();
    if (isTemplateMode) {
      if (!finalName) {
        alert("Please enter a Template Name at the top.");
        return;
      }
    } else {
      const promptName = window.prompt("Enter a name for this routine:", `${muscleGroups.join(', ')} Workout`);
      if (!promptName) return;
      finalName = promptName;
    }

    const newRoutine: Routine = {
      id: crypto.randomUUID(),
      name: finalName,
      muscleGroups,
      exercises: exercises.map(ex => ({ ...ex })) // Deep copy exercises including sets!
    };

    addRoutine(newRoutine);
    if (isTemplateMode) {
      navigate('/routines');
    } else {
      alert('Routine saved!');
    }
  };

  // Only show favorites that match the current muscle groups OR if they are working out "Full Body", show all favorites
  const relevantFavorites = favoriteExercises.filter(fav => muscleGroups.includes('Full Body') || availableExercises.includes(fav));

  return (
    <div className="w-full h-full flex flex-col pb-8">
      {/* Exercise Datalist for Autocomplete */}
      <datalist id="exercise-library">
        {availableExercises.map(ex => <option key={ex} value={ex} />)}
      </datalist>

      <div className="mb-6 px-1 border-b border-[var(--color-border-subtle)] pb-4">
        <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
          <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)]" />
          {isTemplateMode ? 'Create Day Template' : (existingWorkout ? 'Edit Workout' : (existingRoutine ? `Routine: ${existingRoutine.name}` : 'Log Workout'))}
        </h2>
        
        <div className={`grid ${isTemplateMode ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {isTemplateMode && (
          <div className="flex flex-col mb-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Template Name</label>
            <input 
              type="text" 
              placeholder="e.g. Heavy Leg Day"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm text-[var(--color-text-main)] font-bold w-full outline-none focus:border-[var(--color-brand-500)] transition-colors placeholder:font-normal placeholder:opacity-50"
            />
          </div>
          )}
          {!isTemplateMode && (
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] w-full outline-none focus:border-[var(--color-brand-500)] transition-colors"
            />
          </div>
          )}
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Target Focus (Multi-Select)</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(group => {
                const isSelected = muscleGroups.includes(group);
                return (
                  <button
                    key={group}
                    onClick={() => {
                      if (isSelected && muscleGroups.length > 1) {
                        setMuscleGroups(muscleGroups.filter(g => g !== group));
                      } else if (!isSelected) {
                        setMuscleGroups([...muscleGroups, group]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98] ${isSelected ? 'bg-[var(--color-brand-500)] text-white shadow-md' : 'bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:border-[var(--color-brand-500)]/50'}`}
                  >
                    {group}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {!isTemplateMode && <WorkoutTimer />}

      <div className="flex-1 space-y-6 mt-4">

        {relevantFavorites.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" /> Favorites
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
              {relevantFavorites.map(fav => (
                <button
                  key={fav}
                  onClick={() => handleAddExercise(fav)}
                  className="whitespace-nowrap px-3 py-1.5 bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)] border border-[var(--color-brand-500)]/20 rounded-full text-xs font-bold transition-colors active:scale-[0.98] hover:bg-[var(--color-brand-500)]/20"
                >
                  + {fav}
                </button>
              ))}
            </div>
          </div>
        )}

        {exercises.map((exercise, idx) => {
          const history = getExerciseHistory(exercise.name);
          const isFavorite = favoriteExercises.includes(exercise.name);

          return (
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

              <div className="flex gap-2 items-center mb-1 border-b border-[var(--color-border-subtle)] pb-2 relative">
                <input 
                  type="text"
                  list="exercise-library"
                  placeholder="Search or type exercise..."
                  value={exercise.name}
                  onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
                  className="w-full bg-transparent text-lg font-bold text-[var(--color-text-main)] outline-none focus:border-b-2 focus:border-[var(--color-brand-500)] transition-colors placeholder:font-normal placeholder:opacity-50"
                  style={{ marginBottom: '-2px' }}
                />
                
                {exercise.name.trim() && (
                   <button 
                      onClick={() => toggleFavoriteExercise(exercise.name.trim())}
                      className="p-1.5 rounded-full hover:bg-[var(--color-bg-base)] transition-colors"
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-[var(--color-text-muted)]'}`} />
                    </button>
                )}
              </div>

              {!isTemplateMode && (
              <input
                type="text"
                placeholder="Notes (e.g. seat position 4, felt heavy...)"
                value={exercise.notes || ''}
                onChange={(e) => handleUpdateExerciseNotes(exercise.id, e.target.value)}
                className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded text-xs p-2 text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand-500)] focus:text-[var(--color-text-main)] transition-colors mt-2"
              />
              )}

              {/* History / PR Indicators */}
              {(history?.maxWeight || history?.lastLiftStr) && (
                <div className="flex gap-4 text-xs mb-4 px-1 font-medium mt-2">
                  {history?.lastLiftStr && (
                    <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
                      <HistoryIcon className="w-3 h-3"/> Last: {history.lastLiftStr}
                    </span>
                  )}
                  {history?.maxWeight ? (
                    <span className="flex items-center gap-1 text-[var(--color-brand-600)]">
                      <Trophy className="w-3 h-3"/> PR: {history.maxWeight}
                    </span>
                  ) : null}
                </div>
              )}

              <div className="space-y-2 mt-4">
                <div className="grid grid-cols-12 gap-2 px-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  <div className="col-span-2 text-center">Set</div>
                  <div className="col-span-4 text-center">kg</div>
                  <div className="col-span-4 text-center">Reps</div>
                  <div className="col-span-2 text-center"></div>
                </div>

                {exercise.sets.map((set) => {
                  const setWeight = Number(set.weight) || 0;
                  const isNewPR = history?.maxWeight ? setWeight > history.maxWeight : false;

                  return (
                    <div key={set.id} className={`grid grid-cols-12 gap-2 items-center bg-[var(--color-bg-base)] rounded-lg p-2 relative transition-all ${set.completed ? 'opacity-50 grayscale' : ''}`}>
                      {isNewPR && (
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 rounded shadow-sm rotate-[-15deg]">
                          NEW PR!
                        </div>
                      )}
                      
                      <div className="col-span-2 text-center font-medium text-[var(--color-text-muted)] flex items-center justify-center">
                        {set.setNumber}
                      </div>

                      <div className="col-span-4 relative">
                        <input 
                          type="number" 
                          inputMode="decimal"
                          placeholder="0"
                          value={set.weight}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                          className={`w-full bg-transparent text-center font-bold outline-none ${isNewPR ? 'text-yellow-600 dark:text-yellow-400' : 'text-[var(--color-text-main)]'} ${set.completed ? 'line-through' : ''}`}
                        />
                      </div>
                      <div className="col-span-4">
                        <input 
                          type="number" 
                          inputMode="numeric"
                          placeholder="0"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                          className={`w-full bg-transparent text-center font-bold outline-none text-[var(--color-text-main)] ${set.completed ? 'line-through' : ''}`}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center gap-2">
                        {!isTemplateMode && (
                        <button
                          onClick={() => handleUpdateSet(exercise.id, set.id, 'completed', !set.completed)}
                          className={`p-1 rounded transition-colors ${set.completed ? 'bg-green-500 text-white' : 'bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-green-500'}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        )}
                        <button 
                          onClick={() => handleRemoveSet(exercise.id, set.id)}
                          disabled={exercise.sets.length === 1}
                          className="text-[var(--color-text-muted)] hover:text-red-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => handleAddSet(exercise.id)}
                className="w-full mt-4 py-2 border border-dashed border-[var(--color-border-subtle)] rounded-lg text-sm font-semibold text-[var(--color-brand-600)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex justify-center items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Set
              </button>
            </div>
          );
        })}

        <button 
          onClick={() => handleAddExercise('')}
          className="w-full py-4 border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl font-bold text-[var(--color-text-muted)] hover:text-[var(--color-brand-600)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)]/5 transition-colors flex justify-center items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Exercise
        </button>
      </div>

      <div className={`mt-8 pt-4 border-t border-[var(--color-border-subtle)] space-y-3`}>
        {!isTemplateMode && (
        <button 
          onClick={handleSaveWorkout}
          className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-bold text-lg flex justify-center items-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          <Save className="w-5 h-5" /> {existingWorkout ? 'End Session' : 'End Session'}
        </button>
        )}
        {isTemplateMode && (
        <button 
          onClick={handleSaveAsRoutine}
          className={`w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98]`}
        >
          <ClipboardList className="w-5 h-5" /> Save Template
        </button>
        )}
      </div>
    </div>
  );
}
