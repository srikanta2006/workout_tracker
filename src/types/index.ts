export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | '';
  weight: number | '';
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // ISO string format
  muscleGroups: MuscleGroup[];
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  exercises: Exercise[]; // Routines save the exact exercises, sets, and reps configured!
}

export interface BodyweightRecord {
  id: string;
  date: string; // yyyy-MM-dd format
  weight: number;
}

export interface Program {
  id: string;
  name: string;
  lengthInDays: number; // e.g. 7 or 28
  schedule: {
    dayNumber: number; // 1 to lengthInDays
    routineId: string | null; // null means rest day
  }[];
}

export interface ActiveProgramState {
  programId: string;
  startDate: string; // ISO yyyy-MM-dd
}

export interface FitnessGoal {
  id: string;
  exerciseName: string;
  targetWeight: number;
  deadlineDate: string; // ISO yyyy-MM-dd
}
