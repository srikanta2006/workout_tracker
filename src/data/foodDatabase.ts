export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: 'Breakfast' | 'Main' | 'Snack' | 'Protein' | 'Traditional';
  region?: 'South Indian' | 'North Indian' | 'General';
}

export const INDIAN_FOOD_DATABASE: FoodItem[] = [
  // Breakfast
  { id: '1', name: 'Idli (2 pcs)', calories: 120, protein: 4, carbs: 24, fat: 0.5, category: 'Breakfast', region: 'South Indian' },
  { id: '2', name: 'Plain Dosa', calories: 135, protein: 3, carbs: 25, fat: 3.5, category: 'Breakfast', region: 'South Indian' },
  { id: '3', name: 'Masala Dosa', calories: 350, protein: 6, carbs: 45, fat: 16, category: 'Breakfast', region: 'South Indian' },
  { id: '4', name: 'Upma (1 bowl)', calories: 250, protein: 6, carbs: 40, fat: 8, category: 'Breakfast', region: 'South Indian' },
  { id: '5', name: 'Poha (1 bowl)', calories: 230, protein: 4, carbs: 45, fat: 4, category: 'Breakfast', region: 'North Indian' },
  { id: '6', name: 'Aloo Paratha (1 px)', calories: 260, protein: 5, carbs: 35, fat: 11, category: 'Breakfast', region: 'North Indian' },
  
  // Power/Protein Items
  { id: 'p1', name: 'Bread Peanut Butter (2 slices)', calories: 280, protein: 10, carbs: 30, fat: 14, category: 'Protein' },
  { id: 'p2', name: 'Chicken Roast (150g)', calories: 240, protein: 35, carbs: 2, fat: 10, category: 'Protein' },
  { id: 'p3', name: 'Boiled Egg (Large)', calories: 78, protein: 6, carbs: 0.6, fat: 5, category: 'Protein' },
  { id: 'p4', name: 'Whey Protein (1 scoop)', calories: 120, protein: 24, carbs: 3, fat: 1.5, category: 'Protein' },
  { id: 'p5', name: 'Paneer Tikka (100g)', calories: 260, protein: 18, carbs: 6, fat: 18, category: 'Protein' },
  { id: 'p6', name: 'Soya Chunks Curry (1 bowl)', calories: 180, protein: 25, carbs: 12, fat: 3, category: 'Protein' },
  
  // Mains
  { id: 'm1', name: 'White Rice (1 bowl)', calories: 205, protein: 4, carbs: 45, fat: 0.4, category: 'Main' },
  { id: 'm2', name: 'Chapati (1 pc)', calories: 85, protein: 3, carbs: 17, fat: 0.5, category: 'Main' },
  { id: 'm3', name: 'Dal Tadka (1 bowl)', calories: 160, protein: 9, carbs: 20, fat: 6, category: 'Main' },
  { id: 'm4', name: 'Sambar (1 bowl)', calories: 120, protein: 5, carbs: 18, fat: 4, category: 'Main', region: 'South Indian' },
  { id: 'm5', name: 'Chicken Biryani (1 plate)', calories: 450, protein: 22, carbs: 55, fat: 18, category: 'Main' },
  { id: 'm6', name: 'Curd Rice (1 bowl)', calories: 220, protein: 6, carbs: 35, fat: 6, category: 'Main', region: 'South Indian' },
  
  // Snacks / Sides
  { id: 's1', name: 'Banana (Medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'Snack' },
  { id: 's2', name: 'Aloo Seeds Salad', calories: 180, protein: 4, carbs: 22, fat: 9, category: 'Snack' },
  { id: 's3', name: 'Mixed Sprouts (1 bowl)', calories: 120, protein: 9, carbs: 18, fat: 1, category: 'Snack' },
  { id: 's4', name: 'Handful Almonds', calories: 160, protein: 6, carbs: 6, fat: 14, category: 'Snack' },
  { id: 's5', name: 'Greek Yogurt (150g)', calories: 90, protein: 15, carbs: 5, fat: 0.5, category: 'Snack' },
];
