import type { MuscleGroup } from '../types';

export const EXERCISE_DATABASE: Record<MuscleGroup, string[]> = {
  'Chest': [
    'Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Barbell Bench Press', 'Incline Dumbbell Press',
    'Decline Bench Press', 'Push-ups', 'Weighted Push-ups', 'Dumbbell Flyes', 'Incline Dumbbell Flyes',
    'Cable Crossovers (High to Low)', 'Cable Crossovers (Low to High)', 'Pec Deck Machine',
    'Chest Dip', 'Machine Chest Press', 'Smith Machine Bench Press', 'Svend Press',
    'Landmine Press', 'Floor Press', 'Around the Worlds', 'Guillotine Press', 'Low Cable Flyes'
  ].sort(),
  
  'Back': [
    'Pull-ups', 'Weighted Pull-ups', 'Chin-ups', 'Lat Pulldowns (Wide Grip)', 'Lat Pulldowns (Close Grip)',
    'Barbell Row', 'Pendlay Row', 'Dumbbell Row', 'T-Bar Row', 'Seated Cable Row',
    'Deadlift', 'Rack Pulls', 'Face Pulls', 'Straight Arm Pulldown', 'Meadows Row',
    'Machine Row', 'Good Mornings', 'Hyperextensions', 'Single Arm Cable Row',
    'Renegade Row', 'Seal Row', 'Kroc Row', 'Reverse Grip Lat Pulldown', 'Wide Grip Seated Row'
  ].sort(),
  
  'Legs': [
    'Barbell Squat', 'Front Squat', 'Goblet Squat', 'Zercher Squat', 'Bulgarian Split Squat',
    'Leg Press', 'Hack Squat', 'Lunges (Dumbbell)', 'Walking Lunges', 'Reverse Lunges',
    'Leg Extension', 'Seated Leg Curl', 'Lying Leg Curl', 'Romanian Deadlift (RDL)',
    'Stiff-Legged Deadlift', 'Standing Calf Raises', 'Seated Calf Raises', 'Glute Bridge',
    'Barbell Hip Thrust', 'Cable Pull-Throughs', 'Sissy Squat',
    'Box Squat', 'Cossack Squat', 'Step-ups', 'Nordic Curls', 'Reverse Hyper', 'Donkey Calf Raises'
  ].sort(),
  
  'Shoulders': [
    'Overhead Press (Strict)', 'Push Press', 'Seated Dumbbell Press', 'Arnold Press',
    'Lateral Raises (Dumbbell)', 'Lateral Raises (Cable)', 'Front Raises (Dumbbell)',
    'Front Raises (Plate)', 'Front Raises (Cable)', 'Reverse Pec Deck',
    'Rear Delt Flyes (Dumbbell)', 'Upright Row (Barbell)', 'Upright Row (Cable)',
    'Smith Machine Overhead Press', 'Machine Shoulder Press', 'Shrugs (Barbell)', 'Shrugs (Dumbbell)',
    'Z-Press', 'Lu Raises', 'Y-Raises', 'Upright Row (Dumbbell)', 'Bus Drivers', 'Cuban Press'
  ].sort(),
  
  'Arms': [
    // Biceps
    'Barbell Curl', 'EZ Bar Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl',
    'Incline Dumbbell Curl', 'Concentration Curl', 'Cable Bicep Curl', 'Spider Curl',
    'Zottman Curl', 'Waiter Curl',
    // Triceps
    'Tricep Pushdown (Rope)', 'Tricep Pushdown (Straight Bar)', 'Skull Crushers',
    'Overhead Tricep Extension (Dumbbell)', 'Overhead Tricep Extension (Cable)',
    'Close-Grip Bench Press', 'Tricep Dips', 'Kickbacks', 'Tate Press', 'JM Press',
    'California Press', 'Katana Extensions'
  ].sort(),
  
  'Core': [
    'Crunches', 'Decline Crunches', 'Bicycle Crunches', 'Plank', 'Weighted Plank',
    'Hanging Leg Raises', 'Hanging Knee Raises', 'Lying Leg Raises', 'Russian Twists',
    'Ab Wheel Rollouts', 'Cable Woodchoppers', 'Cable Crunches', 'Dead Bugs',
    'Dragon Flags', 'V-Ups', 'Windshield Wipers', 'Hollow Body Hold', 'Bird Dog',
    'Mountain Climbers', 'Stomach Vacuum', 'Pallof Press'
  ].sort(),
  
  'Full Body': [
    'Clean and Jerk', 'Snatch', 'Power Clean', 'Burpees', 'Turkish Get-Ups',
    'Kettlebell Swings', 'Thrusters', 'Farmer Walks', 'Sled Push', 'Battle Ropes',
    'Bear Crawls', 'Man Makers', 'Devil Press', 'Goblet Squat to Press'
  ].sort()
};

// Flattened master list for routines where muscle group is mixed or missing
export const ALL_EXERCISES = Array.from(new Set(Object.values(EXERCISE_DATABASE).flat())).sort();
