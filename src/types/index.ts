export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';

export type DifficultyLevel = 'Easy' | 'Normal' | 'Tough' | 'With Spotter';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | '';
  weight: number | '';
  difficulty?: DifficultyLevel;
  completed?: boolean;
  isWarmup?: boolean;
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
  duration?: number; // In seconds
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

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type ServingUnit = 'g' | 'ml' | 'cup' | 'piece' | 'tbsp' | 'oz';

export interface ServingSize {
  name: string;
  weight_in_grams: number;
}

export interface FoodItem {
  id: string;
  user_id?: string; // null means global/system food, uuid means custom
  name: string;
  brand?: string;
  category?: string;
  region?: string;
  base_calories: number; // For the exact default serving size
  base_protein: number;
  base_carbs: number;
  base_fat: number;
  default_serving: number;
  default_unit: ServingUnit;
  serving_sizes?: ServingSize[];
  is_verified?: boolean;
  admin_status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface MealItem {
  id: string;
  food_item: FoodItem; 
  quantity: number;
  unit: string;
  calories: number; 
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  meal_type: MealType;
  name?: string;
  items: MealItem[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  timestamp?: string;
  created_at?: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  date: string; // yyyy-MM-dd
  amount_ml: number;
}

export type FitnessGoalType = 'lose_weight' | 'gain_weight' | 'bulk' | 'cut' | 'maintain';

export interface DietGoals {
  id: string;
  user_id: string;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  fitness_goal?: FitnessGoalType;
}

export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Non-Vegetarian' | 'Keto' | 'Paleo' | 'Gluten-Free';
export type Allergy = 'Nuts' | 'Dairy' | 'Gluten' | 'Shellfish' | 'Soy';

export interface UserProfile {
  id: string;
  email?: string;
  name?: string;
  age?: number;
  gender?: Gender;
  height?: number; // in cm
  weight?: number; // in kg
  fitness_goal?: FitnessGoalType;
  activity_level?: ActivityLevel;
  dietary_preferences?: DietaryPreference[];
  allergies?: Allergy[];
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}
