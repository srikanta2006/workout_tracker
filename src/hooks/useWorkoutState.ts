import { useState, useEffect } from 'react';
import type { WorkoutSession } from '../types';

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

  useEffect(() => {
    localStorage.setItem('workout_tracker_data', JSON.stringify(workouts));
  }, [workouts]);

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

  return { workouts, addWorkout, updateWorkout, deleteWorkout };
}
