import type { UserProfile, FitnessGoalType, ActivityLevel } from '../types';

/**
 * BMR Calculation (Mifflin-St Jeor formula)
 * Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
 * Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
 */
export const calculateBMR = (profile: Partial<UserProfile>): number | null => {
    const { weight, height, age, gender } = profile;
    if (!weight || !height || !age || !gender) return null;

    const base = (10 * weight) + (6.25 * height) - (5 * age);
    return gender === 'Male' ? base + 5 : base - 161;
};

/**
 * TDEE Multipliers
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    'Sedentary': 1.2,
    'Lightly Active': 1.375,
    'Moderately Active': 1.55,
    'Very Active': 1.725
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel = 'Sedentary'): number => {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
};

/**
 * BMI Calculation
 * weight (kg) / [height (m)]^2
 */
export const calculateBMI = (weight: number, height: number): number => {
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * BMI Category
 */
export const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
};

/**
 * Goal Recommender
 */
export interface GoalRecommendation {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    split: { p: number, c: number, f: number }; // Protein/Carb/Fat percentages in kcal
}

export const getGoalRecommendation = (tdee: number, fitnessGoal: FitnessGoalType, weight: number): GoalRecommendation => {
    let targetCals = tdee;
    let proteinMultiplier = 1.8; // grams per kg
    let fatPercentage = 0.25; // 25% of cals

    switch (fitnessGoal) {
        case 'lose_weight':
            targetCals = tdee - 500;
            proteinMultiplier = 2.2; // High protein for satiety/preservation
            break;
        case 'cut':
            targetCals = tdee - 750;
            proteinMultiplier = 2.4;
            break;
        case 'gain_weight':
            targetCals = tdee + 300;
            proteinMultiplier = 2.0;
            break;
        case 'bulk':
            targetCals = tdee + 600;
            proteinMultiplier = 1.8;
            break;
        case 'maintain':
        default:
            targetCals = tdee;
            proteinMultiplier = 2.0;
            break;
    }

    const proteinGrams = Math.round(weight * proteinMultiplier);
    const proteinKcal = proteinGrams * 4;
    const fatKcal = Math.round(targetCals * fatPercentage);
    const fatGrams = Math.round(fatKcal / 9);
    const carbKcal = targetCals - proteinKcal - fatKcal;
    const carbGrams = Math.round(carbKcal / 4);

    return {
        calories: Math.round(targetCals),
        protein: proteinGrams,
        carbs: carbGrams,
        fat: fatGrams,
        split: {
            p: Math.round((proteinKcal / targetCals) * 100),
            c: Math.round((carbKcal / targetCals) * 100),
            f: Math.round((fatKcal / targetCals) * 100)
        }
    };
};
