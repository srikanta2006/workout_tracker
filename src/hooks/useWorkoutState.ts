import { useState, useEffect } from 'react';
import type { WorkoutSession, Routine } from '../types';

export function useWorkoutState() {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('workout_tracker_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse workouts from local storage', e);
        return [];
      }
    }
    return [];
  });

  const [routines, setRoutines] = useState<Routine[]>(() => {
    const saved = localStorage.getItem('workout_tracker_routines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('workout_tracker_data', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('workout_tracker_routines', JSON.stringify(routines));
  }, [routines]);

  const addWorkout = (workout: WorkoutSession) => {
    setWorkouts((prev) => [workout, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const updateWorkout = (id: string, updatedWorkout: WorkoutSession) => {
    setWorkouts((prev) => 
      prev.map((w) => (w.id === id ? updatedWorkout : w))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  };

  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  const addRoutine = (routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  return { workouts, addWorkout, updateWorkout, deleteWorkout, routines, addRoutine, deleteRoutine };
}
