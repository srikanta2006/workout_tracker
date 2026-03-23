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

export interface Routine {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  exercises: Omit<Exercise, 'sets'>[]; // Routines just save the exercises, maybe default sets
}

export interface BodyweightRecord {
  id: string;
  date: string; // yyyy-MM-dd format
  weight: number;
}
