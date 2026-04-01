import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Meal, DietGoals, BodyweightRecord, FoodItem, MealType } from '../types';
import { format, subDays } from 'date-fns';

interface DietContextType {
  meals: Meal[];
  waterIntake: number;
  dietGoals: DietGoals | null;
  weightRecords: BodyweightRecord[];
  customFoods: FoodItem[];
  favoriteMeals: Meal[];
  selectedDate: Date;
  isLoading: boolean;

  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  duplicateMeal: (mealType: MealType, sourceDateStr: string) => Promise<void>;
  
  saveFavoriteMeal: (meal: Meal) => Promise<void>;

  addCustomFood: (food: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCustomFood: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteCustomFood: (id: string) => Promise<void>;

  updateWater: (amount_ml: number) => Promise<void>;
  updateGoals: (goals: Omit<DietGoals, 'id' | 'user_id'>) => Promise<void>;
  addWeightRecord: (weight: number) => Promise<void>;
  
  setSelectedDate: (date: Date) => void;
  getRecentFoods: () => FoodItem[];
  refreshData: () => Promise<void>;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

export function DietProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Meal[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [dietGoals, setDietGoals] = useState<DietGoals | null>(null);
  const [weightRecords, setWeightRecords] = useState<BodyweightRecord[]>([]);
  
  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<Meal[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fallback storage wrappers incase Supabase tables don't exist yet
  const safelyFetchArray = async (table: string, user_id: string, fallbackKey: string) => {
    try {
      const { data, error } = await supabase.from(table).select('*').eq('user_id', user_id);
      if (error) throw error;
      return data || [];
    } catch {
      const local = localStorage.getItem(fallbackKey);
      return local ? JSON.parse(local) : [];
    }
  };

  const safelyInsert = async (table: string, payload: any, fallbackKey: string, memList: any[], setMemList: any) => {
    try {
      const { data, error } = await supabase.from(table).insert([payload]).select().single();
      if (error) throw error;
      setMemList([...memList, data]);
    } catch {
      const localPayload = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      const updated = [...memList, localPayload];
      setMemList(updated);
      localStorage.setItem(fallbackKey, JSON.stringify(updated));
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // Fetch meals for selected date (we parse JSON items gracefully)
      const cachedMealsStr = localStorage.getItem('mx_meals');
      const allMeals: Meal[] = cachedMealsStr ? JSON.parse(cachedMealsStr) : [];
      
      try {
        const { data: remoteMeals } = await supabase.from('meals').select('*').eq('user_id', user.id).eq('date', dateStr);
        if (remoteMeals && remoteMeals.length > 0) setMeals(remoteMeals);
        else setMeals(allMeals.filter(m => m.date === dateStr && m.user_id === user.id));
      } catch {
        setMeals(allMeals.filter(m => m.date === dateStr && m.user_id === user.id));
      }

      // Fetch Foods & Favorites
      const foodsRaw = await safelyFetchArray('food_items', user.id, 'mx_foods');
      const migratedFoods = foodsRaw.map((f: any) => ({
        ...f,
        base_calories: f.base_calories || f.calories || 0,
        base_protein: f.base_protein || f.protein || 0,
        base_carbs: f.base_carbs || f.carbs || 0,
        base_fat: f.base_fat || f.fat || 0,
        default_serving: f.default_serving || 100,
        default_unit: f.default_unit || 'g'
      }));
      setCustomFoods(migratedFoods);
      
      const favsRaw = await safelyFetchArray('favorite_meals', user.id, 'mx_fav_meals');
      // Potential migration for favorites if needed
      setFavoriteMeals(favsRaw);

      // Fetch water and diet goals
      const { data: waterData } = await supabase.from('water_logs').select('amount_ml').eq('user_id', user.id).eq('date', dateStr).maybeSingle();
      setWaterIntake(waterData?.amount_ml || 0);

      const { data: goalsData } = await supabase.from('diet_goals').select('*').eq('user_id', user.id).maybeSingle();
      setDietGoals(goalsData || null);

      const { data: weightData } = await supabase.from('bodyweight_records').select('*').eq('user_id', user.id).order('date', { ascending: true });
      setWeightRecords(weightData || []);
    } catch (error) {
      console.error('Error fetching diet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Data Mutators
  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    const payload = { ...meal, user_id: user.id };
    
    try {
      const { data, error } = await supabase.from('meals').insert([payload]).select().single();
      if (error) throw error;
      setMeals(prev => [...prev, data]);
    } catch {
      // Local Fallback
      const completeMeal = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      setMeals(prev => [...prev, completeMeal as Meal]);
      const allLocalStr = localStorage.getItem('mx_meals');
      const allLocal = allLocalStr ? JSON.parse(allLocalStr) : [];
      localStorage.setItem('mx_meals', JSON.stringify([...allLocal, completeMeal]));
    }
  };

  const updateMeal = async (id: string, updates: Partial<Meal>) => {
    try {
      const { error } = await supabase.from('meals').update(updates).eq('id', id);
      if (error) throw error;
      setMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch {
      setMeals(prev => {
        const next = prev.map(m => m.id === id ? { ...m, ...updates } : m);
        const allLocalStr = localStorage.getItem('mx_meals');
        if (allLocalStr) {
           const nextAll = JSON.parse(allLocalStr).map((m: Meal) => m.id === id ? { ...m, ...updates } : m);
           localStorage.setItem('mx_meals', JSON.stringify(nextAll));
        }
        return next;
      });
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await supabase.from('meals').delete().eq('id', id);
    } catch {
      // ignoring error, handle local
    } finally {
      setMeals(prev => prev.filter(m => m.id !== id));
      const allLocalStr = localStorage.getItem('mx_meals');
      if (allLocalStr) {
         localStorage.setItem('mx_meals', JSON.stringify(JSON.parse(allLocalStr).filter((m: Meal) => m.id !== id)));
      }
    }
  };

  const duplicateMeal = async (mealType: MealType, sourceDateStr: string) => {
    if (!user) return;
    
    let sourceMeal: Meal | null = null;
    try {
      // Try fetching the exact meal from the network for that user
      const { data, error } = await supabase.from('meals').select('*').eq('user_id', user.id).eq('date', sourceDateStr).eq('meal_type', mealType).maybeSingle();
      if (data) sourceMeal = data;
    } catch {
      // Try local
      const allLocalStr = localStorage.getItem('mx_meals');
      if (allLocalStr) {
        const found = JSON.parse(allLocalStr).find((m: Meal) => m.date === sourceDateStr && m.meal_type === mealType && m.user_id === user.id);
        if (found) sourceMeal = found;
      }
    }
    
    if (sourceMeal) {
      await addMeal({
        date: format(selectedDate, 'yyyy-MM-dd'),
        meal_type: mealType,
        name: sourceMeal.name || '',
        items: sourceMeal.items || [],
        calories: sourceMeal.calories,
        protein: sourceMeal.protein,
        carbs: sourceMeal.carbs,
        fat: sourceMeal.fat,
        notes: sourceMeal.notes,
        timestamp: new Date().toISOString()
      });
    }
  };

  const addCustomFood = async (food: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;
    await safelyInsert('food_items', { ...food, user_id: user.id }, 'mx_foods', customFoods, setCustomFoods);
  };

  const updateCustomFood = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const { error } = await supabase.from('food_items').update(updates).eq('id', id);
      if (error) throw error;
      setCustomFoods(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    } catch {
      setCustomFoods(prev => {
        const next = prev.map(f => f.id === id ? { ...f, ...updates } : f);
        localStorage.setItem('mx_foods', JSON.stringify(next));
        return next;
      });
    }
  };

  const deleteCustomFood = async (id: string) => {
    try {
      await supabase.from('food_items').delete().eq('id', id);
    } catch {}
    setCustomFoods(prev => {
      const next = prev.filter(f => f.id !== id);
      localStorage.setItem('mx_foods', JSON.stringify(next));
      return next;
    });
  };

  const saveFavoriteMeal = async (meal: Meal) => {
    if (!user) return;
    // Creates a favorite meal template (doesn't have date)
    const payload = {
      user_id: user.id,
      name: meal.name,
      meal_type: meal.meal_type,
      items: meal.items,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat
    };
    await safelyInsert('favorite_meals', payload, 'mx_fav_meals', favoriteMeals, setFavoriteMeals);
  };

  const getRecentFoods = () => {
    // Scans across all local meals to find unique foods used recently
    const allLocalStr = localStorage.getItem('mx_meals');
    const allMeals: Meal[] = allLocalStr ? JSON.parse(allLocalStr) : [];
    const recentDbFoods: FoodItem[] = [];
    const seenMap = new Set<string>();
    
    // Sort meals desc by date
    allMeals.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(m => {
       m.items?.forEach(item => {
          if (!seenMap.has(item.food_item.name.toLowerCase())) {
             seenMap.add(item.food_item.name.toLowerCase());
             recentDbFoods.push(item.food_item);
          }
       });
    });
    
    return recentDbFoods.slice(0, 15);
  };

  const updateWater = async (amount_ml: number) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { error } = await supabase.from('water_logs').upsert({ user_id: user.id, date: dateStr, amount_ml }, { onConflict: 'user_id,date' });
    if (!error) setWaterIntake(amount_ml);
  };

  const updateGoals = async (goals: Omit<DietGoals, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('diet_goals').upsert({ ...goals, user_id: user.id }, { onConflict: 'user_id' }).select().single();
    if (!error && data) setDietGoals(data);
  };

  const addWeightRecord = async (weight: number) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase.from('bodyweight_records').upsert({ user_id: user.id, date: dateStr, weight }, { onConflict: 'user_id,date' }).select().single();
    if (!error && data) {
      setWeightRecords(prev => {
        const filtered = prev.filter(r => r.date !== dateStr);
        return [...filtered, data].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  };

  return (
    <DietContext.Provider value={{ 
      meals, waterIntake, dietGoals, weightRecords, 
      customFoods, favoriteMeals,
      selectedDate, isLoading, 
      addMeal, updateMeal, deleteMeal, duplicateMeal, saveFavoriteMeal,
      addCustomFood, updateCustomFood, deleteCustomFood,
      updateWater, updateGoals, addWeightRecord,
      setSelectedDate, getRecentFoods, refreshData: fetchData
    }}>
      {children}
    </DietContext.Provider>
  );
}

export function useDiet() {
  const context = useContext(DietContext);
  if (context === undefined) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}
