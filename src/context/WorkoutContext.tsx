import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { WorkoutSession, Routine, BodyweightRecord, Program, ActiveProgramState, FitnessGoal } from '../types';

interface WorkoutContextType {
  workouts: WorkoutSession[];
  addWorkout: (workout: WorkoutSession) => Promise<void>;
  updateWorkout: (id: string, updated: WorkoutSession) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  routines: Routine[];
  addRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  bodyweights: BodyweightRecord[];
  addBodyweight: (record: BodyweightRecord) => Promise<void>;
  deleteBodyweight: (id: string) => Promise<void>;
  favoriteExercises: string[];
  toggleFavoriteExercise: (exerciseName: string) => Promise<void>;
  programs: Program[];
  addProgram: (program: Program) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  activeProgram: ActiveProgramState | null;
  setActiveProgram: (state: ActiveProgramState | null) => Promise<void>;
  goals: FitnessGoal[];
  addGoal: (goal: FitnessGoal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  isLoading: boolean;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;

  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [bodyweights, setBodyweights] = useState<BodyweightRecord[]>([]);
  const [favoriteExercises, setFavoriteExercises] = useState<string[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgramState] = useState<ActiveProgramState | null>(null);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setWorkouts([]);
      setRoutines([]);
      setBodyweights([]);
      setFavoriteExercises([]);
      setPrograms([]);
      setActiveProgramState(null);
      setGoals([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    Promise.all([
      supabase.from('workouts').select('*').eq('user_id', uid).order('date', { ascending: false }),
      supabase.from('routines').select('*').eq('user_id', uid),
      supabase.from('bodyweights').select('*').eq('user_id', uid).order('date', { ascending: true }),
      supabase.from('goals').select('*').eq('user_id', uid),
      supabase.from('programs').select('*').eq('user_id', uid),
      supabase.from('active_program').select('*').eq('user_id', uid).maybeSingle(),
      supabase.from('favorites').select('*').eq('user_id', uid).maybeSingle(),
    ]).then(([w, r, bw, g, p, ap, fav]) => {
      if (w.data) {
        setWorkouts(w.data.map(row => ({
          id: row.id,
          date: row.date,
          muscleGroups: row.muscle_groups,
          exercises: row.exercises,
        })));
      }
      if (r.data) {
        setRoutines(r.data.map(row => ({
          id: row.id,
          name: row.name,
          muscleGroups: row.muscle_groups,
          exercises: row.exercises,
        })));
      }
      if (bw.data) {
        setBodyweights(bw.data.map(row => ({
          id: row.id,
          date: row.date,
          weight: row.weight,
        })));
      }
      if (g.data) {
        setGoals(g.data.map(row => ({
          id: row.id,
          exerciseName: row.exercise_name,
          targetWeight: row.target_weight,
          deadlineDate: row.deadline_date,
        })));
      }
      if (p.data) {
        setPrograms(p.data.map(row => ({
          id: row.id,
          name: row.name,
          lengthInDays: row.length_in_days,
          schedule: row.schedule,
        })));
      }
      if (ap.data) {
        setActiveProgramState({ programId: ap.data.program_id, startDate: ap.data.start_date });
      }
      if (fav.data) {
        setFavoriteExercises(fav.data.exercises ?? []);
      }
      setIsLoading(false);
    });
  }, [uid]);

  const addWorkout = async (workout: WorkoutSession) => {
    if (!uid) return;
    await supabase.from('workouts').insert({
      id: workout.id, user_id: uid, date: workout.date,
      muscle_groups: workout.muscleGroups, exercises: workout.exercises,
    });
    setWorkouts(prev => [workout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateWorkout = async (id: string, updated: WorkoutSession) => {
    if (!uid) return;
    await supabase.from('workouts').update({
      date: updated.date, muscle_groups: updated.muscleGroups, exercises: updated.exercises,
    }).eq('id', id).eq('user_id', uid);
    setWorkouts(prev => prev.map(w => w.id === id ? updated : w).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteWorkout = async (id: string) => {
    if (!uid) return;
    await supabase.from('workouts').delete().eq('id', id).eq('user_id', uid);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addRoutine = async (routine: Routine) => {
    if (!uid) return;
    await supabase.from('routines').insert({
      id: routine.id, user_id: uid, name: routine.name,
      muscle_groups: routine.muscleGroups, exercises: routine.exercises,
    });
    setRoutines(prev => [routine, ...prev]);
  };

  const deleteRoutine = async (id: string) => {
    if (!uid) return;
    await supabase.from('routines').delete().eq('id', id).eq('user_id', uid);
    setRoutines(prev => prev.filter(r => r.id !== id));
  };

  const addBodyweight = async (record: BodyweightRecord) => {
    if (!uid) return;
    await supabase.from('bodyweights').insert({ id: record.id, user_id: uid, date: record.date, weight: record.weight });
    setBodyweights(prev => [...prev, record].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteBodyweight = async (id: string) => {
    if (!uid) return;
    await supabase.from('bodyweights').delete().eq('id', id).eq('user_id', uid);
    setBodyweights(prev => prev.filter(r => r.id !== id));
  };

  const toggleFavoriteExercise = async (exerciseName: string) => {
    if (!uid) return;
    const name = exerciseName.trim();
    if (!name) return;
    const next = favoriteExercises.includes(name)
      ? favoriteExercises.filter(e => e !== name)
      : [name, ...favoriteExercises];
    setFavoriteExercises(next);
    await supabase.from('favorites').upsert({ user_id: uid, exercises: next }, { onConflict: 'user_id' });
  };

  const addProgram = async (program: Program) => {
    if (!uid) return;
    await supabase.from('programs').insert({
      id: program.id, user_id: uid, name: program.name,
      length_in_days: program.lengthInDays, schedule: program.schedule,
    });
    setPrograms(prev => [...prev, program]);
  };

  const deleteProgram = async (id: string) => {
    if (!uid) return;
    await supabase.from('programs').delete().eq('id', id).eq('user_id', uid);
    setPrograms(prev => prev.filter(p => p.id !== id));
    if (activeProgram?.programId === id) {
      await supabase.from('active_program').delete().eq('user_id', uid);
      setActiveProgramState(null);
    }
  };

  const setActiveProgram = async (state: ActiveProgramState | null) => {
    if (!uid) return;
    if (state) {
      await supabase.from('active_program').upsert(
        { user_id: uid, program_id: state.programId, start_date: state.startDate },
        { onConflict: 'user_id' }
      );
    } else {
      await supabase.from('active_program').delete().eq('user_id', uid);
    }
    setActiveProgramState(state);
  };

  const addGoal = async (goal: FitnessGoal) => {
    if (!uid) return;
    await supabase.from('goals').insert({
      id: goal.id, user_id: uid, exercise_name: goal.exerciseName,
      target_weight: goal.targetWeight, deadline_date: goal.deadlineDate,
    });
    setGoals(prev => [...prev, goal]);
  };

  const deleteGoal = async (id: string) => {
    if (!uid) return;
    await supabase.from('goals').delete().eq('id', id).eq('user_id', uid);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <WorkoutContext.Provider value={{
      workouts, addWorkout, updateWorkout, deleteWorkout,
      routines, addRoutine, deleteRoutine,
      bodyweights, addBodyweight, deleteBodyweight,
      favoriteExercises, toggleFavoriteExercise,
      programs, addProgram, deleteProgram,
      activeProgram, setActiveProgram,
      goals, addGoal, deleteGoal,
      isLoading
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
