import type { WorkoutSet } from '../types';

export interface WarmupSetTemplate {
  percentage: number;
  reps: number;
}

const STORAGE_KEY = 'maxout_warmup_model_weights';

const INITIAL_WEIGHTS: WarmupSetTemplate[] = [
  { percentage: 0.40, reps: 10 },
  { percentage: 0.60, reps: 8 },
  { percentage: 0.80, reps: 4 },
  { percentage: 0.90, reps: 1 },
];

/**
 * The "Brain" of the Warm-up Generator.
 * Uses a simple gradient descent approach to learn from user modifications.
 */
class WarmupModel {
  private weights: WarmupSetTemplate[];
  private learningRate = 0.05;

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    this.weights = saved ? JSON.parse(saved) : [...INITIAL_WEIGHTS];
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.weights));
  }

  /** Generates sets based on current "learned" weights */
  public infer(targetWeight: number): Partial<WorkoutSet>[] {
    if (!targetWeight || targetWeight <= 0) return [];

    return this.weights.map((w, idx) => {
      let weight = targetWeight * w.percentage;
      
      // Rounding logic for gym equipment
      if (weight > 20) {
        weight = Math.round(weight / 2.5) * 2.5;
      } else {
        weight = Math.round(weight);
      }

      return {
        id: `warmup-${idx}-${crypto.randomUUID()}`,
        weight: weight,
        reps: Math.round(w.reps),
        isWarmup: true,
        completed: false
      };
    });
  }

  /** 
   * "Trains" the model by comparing generated sets to what the user actually did.
   * Adjusts the internal percentages and reps slightly in that direction.
   */
  public train(targetWeight: number, actualSets: WorkoutSet[]) {
    if (!targetWeight || targetWeight <= 0) return;

    // Filter for warm-up sets that were modified or kept
    const warmups = actualSets.filter(s => s.isWarmup);
    
    warmups.forEach((actual, idx) => {
      if (idx >= this.weights.length) return;

      const currentWeight = this.weights[idx];
      const actualPercentage = (Number(actual.weight) || 0) / targetWeight;
      const actualReps = Number(actual.reps) || 0;

      // Gradient descent step: new_weight = current + learning_rate * (actual - current)
      this.weights[idx].percentage += this.learningRate * (actualPercentage - currentWeight.percentage);
      this.weights[idx].reps += this.learningRate * (actualReps - currentWeight.reps);
      
      // Bounds checking to keep things sane
      this.weights[idx].percentage = Math.max(0.1, Math.min(0.95, this.weights[idx].percentage));
      this.weights[idx].reps = Math.max(1, Math.min(20, this.weights[idx].reps));
    });

    this.save();
    console.log('🧠 Warm-up model updated:', this.weights);
  }

  /** Reset to default formula */
  public reset() {
    this.weights = [...INITIAL_WEIGHTS];
    this.save();
  }
}

export const warmupModel = new WarmupModel();

// Legacy compatibility export
export function calculateWarmupSets(targetWeight: number): Partial<WorkoutSet>[] {
  return warmupModel.infer(targetWeight);
}
