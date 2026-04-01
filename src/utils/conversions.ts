/**
 * Biomechanical Equivalency Ratios
 * These act as a lookup matrix to intelligently convert weights when 
 * swapping one exercise for another. 
 * E.g., Barbell Bench -> Dumbbell Bench (per hand)
 */

export const BiomechanicalRatios: Record<string, Record<string, number>> = {
  'Barbell Bench Press': {
    'Dumbbell Bench Press': 0.36, // Generally, grab DBs that are ~36% of your barbell weight per hand
    'Incline Barbell Bench Press': 0.8, 
    'Machine Chest Press': 1.15
  },
  'Barbell Squat': {
    'Leg Press': 2.5,
    'Goblet Squat': 0.4,
    'Front Squat': 0.8,
    'Bulgarian Split Squat': 0.35 // Per leg, usually dumbbells
  },
  'Deadlift': {
    'Romanian Deadlift': 0.75,
    'Sumo Deadlift': 1.0,
    'Dumbbell Romanian Deadlift': 0.3 // Per hand
  },
  'Overhead Press': {
    'Dumbbell Shoulder Press': 0.4, // Per hand
    'Machine Shoulder Press': 1.2
  },
  'Pull Up': {
    'Lat Pulldown': 1.0 // Assumed 1:1 with bodyweight pullups
  },
  'Barbell Row': {
    'Dumbbell Row': 0.45,
    'Seated Cable Row': 0.9
  }
};

/**
 * Calculates the equivalent weight when substituting an exercise
 */
export function calculateEquivalentWeight(oldExerciseName: string, newExerciseName: string, currentWeight: number): number {
  if (!currentWeight || currentWeight <= 0) return 0;

  // Direct mapping
  if (BiomechanicalRatios[oldExerciseName] && BiomechanicalRatios[oldExerciseName][newExerciseName]) {
    const rawMath = currentWeight * BiomechanicalRatios[oldExerciseName][newExerciseName];
    return Math.round(rawMath / 2.5) * 2.5; // Round to nearest 2.5
  }

  // Inverse mapping (e.g. going from Dumbbell Bench back to Barbell)
  if (BiomechanicalRatios[newExerciseName] && BiomechanicalRatios[newExerciseName][oldExerciseName]) {
    const rawMath = currentWeight / BiomechanicalRatios[newExerciseName][oldExerciseName];
    return Math.round(rawMath / 2.5) * 2.5;
  }

  // Unknown ratio, preserve existing weight as best-effort fallback
  return currentWeight;
}
