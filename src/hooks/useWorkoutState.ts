import { useWorkout } from '../context/WorkoutContext';

export function useWorkoutState() {
  return useWorkout();
}
