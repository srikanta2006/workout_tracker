import type { FoodItem } from '../types';

export const INDIAN_FOOD_DATABASE: FoodItem[] = [
  // Breakfast
  { id: '1', name: 'Idli (2 pcs)', base_calories: 120, base_protein: 4, base_carbs: 24, base_fat: 0.5, category: 'Breakfast', region: 'South Indian', default_serving: 2, default_unit: 'piece' },
  { id: '2', name: 'Plain Dosa', base_calories: 135, base_protein: 3, base_carbs: 25, base_fat: 3.5, category: 'Breakfast', region: 'South Indian', default_serving: 1, default_unit: 'piece' },
  { id: '3', name: 'Masala Dosa', base_calories: 350, base_protein: 6, base_carbs: 45, base_fat: 16, category: 'Breakfast', region: 'South Indian', default_serving: 1, default_unit: 'piece' },
  { id: '4', name: 'Upma (1 bowl)', base_calories: 250, base_protein: 6, base_carbs: 40, base_fat: 8, category: 'Breakfast', region: 'South Indian', default_serving: 1, default_unit: 'cup' },
  { id: '5', name: 'Poha (1 bowl)', base_calories: 230, base_protein: 4, base_carbs: 45, base_fat: 4, category: 'Breakfast', region: 'North Indian', default_serving: 1, default_unit: 'cup' },
  { id: '6', name: 'Aloo Paratha (1 px)', base_calories: 260, base_protein: 5, base_carbs: 35, base_fat: 11, category: 'Breakfast', region: 'North Indian', default_serving: 1, default_unit: 'piece' },
  
  // Power/Protein Items
  { id: 'p1', name: 'Bread Peanut Butter (2 slices)', base_calories: 280, base_protein: 10, base_carbs: 30, base_fat: 14, category: 'Protein', default_serving: 2, default_unit: 'piece' },
  { id: 'p2', name: 'Chicken Roast (150g)', base_calories: 240, base_protein: 35, base_carbs: 2, base_fat: 10, category: 'Protein', default_serving: 150, default_unit: 'g' },
  { id: 'p3', name: 'Boiled Egg (Large)', base_calories: 78, base_protein: 6, base_carbs: 0.6, base_fat: 5, category: 'Protein', default_serving: 1, default_unit: 'piece' },
  { id: 'p4', name: 'Whey Protein (1 scoop)', base_calories: 120, base_protein: 24, base_carbs: 3, base_fat: 1.5, category: 'Protein', default_serving: 1, default_unit: 'piece' },
  { id: 'p5', name: 'Paneer Tikka (100g)', base_calories: 260, base_protein: 18, base_carbs: 6, base_fat: 18, category: 'Protein', default_serving: 100, default_unit: 'g' },
  { id: 'p6', name: 'Soya Chunks Curry (1 bowl)', base_calories: 180, base_protein: 25, base_carbs: 12, base_fat: 3, category: 'Protein', default_serving: 1, default_unit: 'cup' },
  
  // Mains
  { id: 'm1', name: 'White Rice (1 bowl)', base_calories: 205, base_protein: 4, base_carbs: 45, base_fat: 0.4, category: 'Main', default_serving: 1, default_unit: 'cup' },
  { id: 'm2', name: 'Chapati (1 pc)', base_calories: 85, base_protein: 3, base_carbs: 17, base_fat: 0.5, category: 'Main', default_serving: 1, default_unit: 'piece' },
  { id: 'm3', name: 'Dal Tadka (1 bowl)', base_calories: 160, base_protein: 9, base_carbs: 20, base_fat: 6, category: 'Main', default_serving: 1, default_unit: 'cup' },
  { id: 'm4', name: 'Sambar (1 bowl)', base_calories: 120, base_protein: 5, base_carbs: 18, base_fat: 4, category: 'Main', region: 'South Indian', default_serving: 1, default_unit: 'cup' },
  { id: 'm5', name: 'Chicken Biryani (1 plate)', base_calories: 450, base_protein: 22, base_carbs: 55, base_fat: 18, category: 'Main', default_serving: 1, default_unit: 'piece' },
  { id: 'm6', name: 'Curd Rice (1 bowl)', base_calories: 220, base_protein: 6, base_carbs: 35, base_fat: 6, category: 'Main', region: 'South Indian', default_serving: 1, default_unit: 'cup' },
  
  // Snacks / Sides
  { id: 's1', name: 'Banana (Medium)', base_calories: 105, base_protein: 1.3, base_carbs: 27, base_fat: 0.4, category: 'Snack', default_serving: 1, default_unit: 'piece' },
  { id: 's2', name: 'Aloo Seeds Salad', base_calories: 180, base_protein: 4, base_carbs: 22, base_fat: 9, category: 'Snack', default_serving: 1, default_unit: 'cup' },
  { id: 's3', name: 'Mixed Sprouts (1 bowl)', base_calories: 120, base_protein: 9, base_carbs: 18, base_fat: 1, category: 'Snack', default_serving: 1, default_unit: 'cup' },
  { id: 's4', name: 'Handful Almonds', base_calories: 160, base_protein: 6, base_carbs: 6, base_fat: 14, category: 'Snack', default_serving: 1, default_unit: 'piece' },
  { id: 's5', name: 'Greek Yogurt (150g)', base_calories: 90, base_protein: 15, base_carbs: 5, base_fat: 0.5, category: 'Snack', default_serving: 150, default_unit: 'g' },
];

