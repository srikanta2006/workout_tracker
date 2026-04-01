import type { FoodItem } from '../types';
import indianFoodsFull from './indianFoodDatabase.json';

const FEATURED_FOODS: FoodItem[] = [
  // Generics
  { id: 'sys1', name: 'Chicken Breast (Raw)', category: 'Meat', base_calories: 165, base_protein: 31, base_carbs: 0, base_fat: 3.6, default_serving: 100, default_unit: 'g', is_verified: true, region: 'Global' },
  { id: 'sys2', name: 'White Rice (Cooked)', category: 'Grains', base_calories: 130, base_protein: 2.7, base_carbs: 28, base_fat: 0.3, default_serving: 100, default_unit: 'g', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Cup', weight_in_grams: 158}] },
  { id: 'sys3', name: 'Whole Eggs', category: 'Dairy/Eggs', base_calories: 78, base_protein: 6.3, base_carbs: 0.6, base_fat: 5.3, default_serving: 1, default_unit: 'piece', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Large Egg', weight_in_grams: 50}] },
  { id: 'sys4', name: 'Oats (Dry)', category: 'Grains', base_calories: 389, base_protein: 16.9, base_carbs: 66.3, base_fat: 6.9, default_serving: 100, default_unit: 'g', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Cup', weight_in_grams: 81}] },
  { id: 'sys5', name: 'Banana', category: 'Fruits', base_calories: 105, base_protein: 1.3, base_carbs: 27, base_fat: 0.3, default_serving: 1, default_unit: 'piece', is_verified: true, region: 'Global', serving_sizes: [{name: 'Medium (7")', weight_in_grams: 118}] },
  { id: 'sys6', name: 'Whey Protein Isolate', category: 'Supplements', brand: 'Optimum Nutrition', base_calories: 120, base_protein: 24, base_carbs: 3, base_fat: 1, default_serving: 1, default_unit: 'piece', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Scoop', weight_in_grams: 32}] },
  { id: 'sys7', name: 'Milk (Whole)', category: 'Dairy', base_calories: 61, base_protein: 3.2, base_carbs: 4.8, base_fat: 3.3, default_serving: 100, default_unit: 'ml', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Cup', weight_in_grams: 244}] },
  { id: 'sys8', name: 'Olive Oil', category: 'Fats', base_calories: 119, base_protein: 0, base_carbs: 0, base_fat: 13.5, default_serving: 1, default_unit: 'tbsp', is_verified: true, region: 'Global', serving_sizes: [{name: '1 Tbsp', weight_in_grams: 15}] },
  
  // Chinese additions
  { id: 'ch1', name: 'Steamed Dumplings (Pork)', category: 'Mains', base_calories: 41, base_protein: 3, base_carbs: 4, base_fat: 1.5, default_serving: 1, default_unit: 'piece', is_verified: true, region: 'Chinese', serving_sizes: [{name: '1 Dumpling', weight_in_grams: 25}] },
  { id: 'ch2', name: 'Chicken Fried Rice', category: 'Mains', base_calories: 120, base_protein: 4, base_carbs: 13, base_fat: 5, default_serving: 100, default_unit: 'g', is_verified: true, region: 'Chinese', serving_sizes: [{name: '1 Bowl', weight_in_grams: 250}] },
  
  // Italian additions
  { id: 'it1', name: 'Margherita Pizza', category: 'Mains', base_calories: 146, base_protein: 7, base_carbs: 10, base_fat: 9, default_serving: 100, default_unit: 'g', is_verified: true, region: 'Italian', serving_sizes: [{name: '1 Slice', weight_in_grams: 110}] }
];

export const GLOBAL_FOODS: FoodItem[] = [
  ...FEATURED_FOODS,
  ...(indianFoodsFull as FoodItem[])
];
