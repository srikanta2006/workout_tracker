import type { WorkoutSession, WorkoutSet, Exercise } from '../types';

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Adaptive ML Engine: Analyzes recent performance and subjective difficulty to intelligently
 * prescribe the next optimal load (weight/reps).
 */
export function generateNextSets(
  exerciseName: string, 
  workoutHistory: WorkoutSession[], 
  templateSets?: WorkoutSet[],
  readinessScore: number = 7
): WorkoutSet[] {
  // Find the most recent workout where this exercise was performed
  const pastWorkouts = [...workoutHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let lastExerciseRecord: Exercise | null = null;
  let consecutiveStruggles = 0;
  
  for (let i = 0; i < pastWorkouts.length; i++) {
    const session = pastWorkouts[i];
    const found = session.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    
    if (found && found.sets.length > 0) {
      if (!lastExerciseRecord) {
        lastExerciseRecord = found;
      }
      
      // Check for plateaus: Look at the top set of this historical session
      const validSets = found.sets.filter(s => s.completed && !s.isWarmup);
      if (validSets.length > 0) {
        const topSet = validSets.reduce((prev, current) => (Number(prev.weight) > Number(current.weight)) ? prev : current);
        if (topSet.difficulty === 'Tough' || topSet.difficulty === 'With Spotter') {
            consecutiveStruggles++;
        } else {
            break; // Streak broken
        }
      }
      
      // We only need to scan back 3 sessions to detect a plateau
      if (i >= 3) break;
    }
  }

  const isDeloadPhase = consecutiveStruggles >= 3;

  // Periodization Scanner: Track if the user has been stuck in the exact same rep zone
  let consecutiveSameReps = 0;
  let lastRepTarget = -1;

  for (let i = 0; i < pastWorkouts.length; i++) {
    const session = pastWorkouts[i];
    const found = session.exercises.find(e => e.name.toLowerCase() === exerciseName.toLowerCase());
    if (found && found.sets.length > 0) {
      const validSets = found.sets.filter(s => s.completed && !s.isWarmup);
      if (validSets.length > 0) {
         const reps = Number(validSets[0].reps);
         if (lastRepTarget === -1) {
            lastRepTarget = reps;
            consecutiveSameReps = 1;
         } else if (Math.abs(reps - lastRepTarget) <= 2) {
            consecutiveSameReps++;
         } else {
            break; // Rep structure changed naturally, streak broken
         }
      }
      if (consecutiveSameReps >= 4) break; 
    }
  }

  const needsPeriodizationShock = consecutiveSameReps >= 4;

  // If no history, return template sets if provided, otherwise a default 3x10 template
  if (!lastExerciseRecord) {
    if (templateSets && templateSets.length > 0) {
        return templateSets.map(s => ({ ...s, id: crypto.randomUUID(), completed: false, difficulty: undefined }));
    }
    return [
      { id: crypto.randomUUID(), setNumber: 1, reps: 10, weight: '', completed: false, difficulty: undefined },
      { id: crypto.randomUUID(), setNumber: 2, reps: 10, weight: '', completed: false, difficulty: undefined },
      { id: crypto.randomUUID(), setNumber: 3, reps: 10, weight: '', completed: false, difficulty: undefined },
    ];
  }

  // Determine the baseline sets to iterate over (either the template sets, or copy the last session's sets)
  const baseSets = templateSets && templateSets.length > 0 ? templateSets : lastExerciseRecord.sets;

  const newSets: WorkoutSet[] = baseSets.map((baseSet, index) => {
    // We try to find the corresponding set from the LAST workout to learn from
    // If the template has more sets than last time, we just use the last available set's performance
    const oldSetIndex = Math.min(index, lastExerciseRecord!.sets.length - 1);
    const oldSet = lastExerciseRecord!.sets[oldSetIndex];

    if (baseSet.isWarmup) {
      return {
         ...baseSet,
         id: crypto.randomUUID(),
         completed: false,
         difficulty: undefined
      };
    }

    let nextWeight = Number(oldSet.weight);
    let nextReps = Number(oldSet.reps);

    if (isNaN(nextWeight) || isNaN(nextReps) || oldSet.weight === '' || oldSet.reps === '') {
      return {
         ...baseSet,
         id: crypto.randomUUID(),
         completed: false,
         difficulty: undefined
      };
    }

    const difficulty = oldSet.difficulty || 'Normal';

    // The Adaptive Learning Pipeline
    if (difficulty === 'Easy') {
      nextWeight = Number((nextWeight * 1.05).toFixed(1)); 
      if (nextWeight === Number(oldSet.weight)) {
          nextReps += 2; // Jump volume if weight jump was too small
      }
    } 
    else if (difficulty === 'Normal') {
      nextWeight += 2.5; 
      if (nextReps > 8) nextReps -= 1; // Slight rep drop to accommodate load increase
    }
    else if (difficulty === 'Tough') {
      // Hold weight and hold reps representing a consolidation phase
    }
    else if (difficulty === 'With Spotter') {
      // CNS failure detected. Micro-deload weight but maintain reps.
      nextWeight = Math.max(0, nextWeight - 2.5);
      nextReps = Math.max(1, nextReps);
    }

    // Global Readiness Scaling
    if (readinessScore <= 4) {
      nextWeight = nextWeight * 0.9; // 10% auto-deload for exhaustion
    } else if (readinessScore >= 8) {
      nextWeight = nextWeight * 1.025; // 2.5% aggressive bump for peak readiness
    }

    // Auto-Deload Guard (Overtraining Protection)
    if (isDeloadPhase) {
      nextWeight = nextWeight * 0.8; // 20% slash to clear CNS fatigue
      nextReps = Math.max(1, Math.round(nextReps * 0.8)); // 20% reduction in target reps
    } else if (needsPeriodizationShock) {
      // Auto-Periodization (Undulating Reps)
      if (lastRepTarget > 7) {
         // Shift to Strength Phase
         nextReps = 5;
         nextWeight = nextWeight * 1.15; // Heavily bump weight to match 5 reps
      } else {
         // Shift to Hypertrophy/Endurance phase
         nextReps = 12;
         nextWeight = nextWeight * 0.85; // Drop weight to easily hit 12 reps
      }
    }

    // Standardize weight to common gym plate increments (2.5)
    nextWeight = Math.round(nextWeight / 2.5) * 2.5;

    // If a template provided a specific target rep count, respect the template's reps but use ML suggested weight
    const finalReps = (templateSets && baseSet.reps !== '') ? Number(baseSet.reps) : nextReps;

    return {
      id: crypto.randomUUID(),
      setNumber: baseSet.setNumber,
      reps: finalReps,
      weight: nextWeight,
      completed: false,
      isWarmup: false,
      difficulty: undefined // Reset difficulty for the new session
    };
  });

  return newSets;
}
