export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | '';
  weight: number | '';
}

export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string format
  muscleGroup: MuscleGroup;
  exercises: Exercise[];
}
