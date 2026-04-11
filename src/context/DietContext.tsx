import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Meal, DietGoals, BodyweightRecord, FoodItem, MealType, DietRoutine, DietProgram, ActiveDietProgramState } from '../types';
import { format } from 'date-fns';

interface DietContextType {
  meals: Meal[];
  waterIntake: number;
  dietGoals: DietGoals | null;
  weightRecords: BodyweightRecord[];
  customFoods: FoodItem[];
  favoriteMeals: Meal[];
  selectedDate: Date;
  uniqueMeals: Meal[];
  isLoading: boolean;

  dietRoutines: DietRoutine[];
  addDietRoutine: (routine: DietRoutine) => Promise<void>;
  updateDietRoutine: (id: string, updated: DietRoutine) => Promise<void>;
  deleteDietRoutine: (id: string) => Promise<void>;

  dietPrograms: DietProgram[];
  addDietProgram: (program: DietProgram) => Promise<void>;
  deleteDietProgram: (id: string) => Promise<void>;

  activeDietProgram: ActiveDietProgramState | null;
  setActiveDietProgram: (state: ActiveDietProgramState | null) => Promise<void>;

  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateMeal: (id: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  duplicateMeal: (mealType: MealType, sourceDateStr: string) => Promise<void>;
  
  getMealsInRange: (startDate: string, endDate: string) => Promise<Meal[]>;
  getWaterInRange: (startDate: string, endDate: string) => Promise<{date: string, amount_ml: number}[]>;
  
  saveFavoriteMeal: (meal: Meal) => Promise<void>;

  addCustomFood: (food: Omit<FoodItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateCustomFood: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  deleteCustomFood: (id: string) => Promise<void>;

  updateWater: (amount_ml: number) => Promise<void>;
  updateGoals: (goals: Omit<DietGoals, 'id' | 'user_id'>) => Promise<void>;
  addWeightRecord: (metrics: { weight: number; body_fat_pct?: number; muscle_mass_kg?: number; waist_cm?: number }) => Promise<void>;
  
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
  const [allHistoricalMeals, setAllHistoricalMeals] = useState<Meal[]>([]);
  
  const [dietRoutines, setDietRoutines] = useState<DietRoutine[]>([]);
  const [dietPrograms, setDietPrograms] = useState<DietProgram[]>([]);
  const [activeDietProgram, setActiveDietProgramState] = useState<ActiveDietProgramState | null>(null);

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
      // Fetch meals
      const cachedMealsStr = localStorage.getItem('mx_meals');
      const allLocalMeals: Meal[] = cachedMealsStr ? JSON.parse(cachedMealsStr) : [];
      
      try {
        const { data: remoteMeals, error } = await supabase.from('meals').select('*').eq('user_id', user.id);
        if (!error && remoteMeals) {
            setAllHistoricalMeals(remoteMeals);
            setMeals(remoteMeals.filter(m => m.date === dateStr));
        } else {
            setAllHistoricalMeals(allLocalMeals);
            setMeals(allLocalMeals.filter(m => m.date === dateStr && m.user_id === user.id));
        }
      } catch {
        setAllHistoricalMeals(allLocalMeals);
        setMeals(allLocalMeals.filter(m => m.date === dateStr && m.user_id === user.id));
      }

      // Fetch Foods & Favorites
      const foodsRaw = await safelyFetchArray('food_items', user.id, 'mx_foods');
      const migratedFoods = foodsRaw.map((f: any) => ({
        ...f,
        base_calories: f.base_calories || f.calories || 0,
        base_protein: f.base_protein || f.protein || 0,
        base_carbs: f.base_carbs || f.carbs || 0,
        base_fat: f.base_fat || f.fat || 0,
        base_fiber: f.base_fiber || 0,
        base_sugar: f.base_sugar || 0,
        base_sodium: f.base_sodium || 0,
        base_cholesterol: f.base_cholesterol || 0,
        base_vitA: f.base_vitA || 0,
        base_vitB: f.base_vitB || 0,
        base_vitC: f.base_vitC || 0,
        base_vitD: f.base_vitD || 0,
        base_calcium: f.base_calcium || 0,
        base_iron: f.base_iron || 0,
        default_serving: f.default_serving || 100,
        default_unit: f.default_unit || 'g'
      }));
      setCustomFoods(migratedFoods);
      
      const favsRaw = await safelyFetchArray('favorite_meals', user.id, 'mx_fav_meals');
      setFavoriteMeals(favsRaw);

      // Fetch water and diet goals
      const { data: waterData } = await supabase.from('water_logs').select('amount_ml').eq('user_id', user.id).eq('date', dateStr).maybeSingle();
      setWaterIntake(waterData?.amount_ml || 0);

      const { data: goalsData } = await supabase.from('diet_goals').select('*').eq('user_id', user.id).maybeSingle();
      setDietGoals(goalsData || null);

      const { data: weightData } = await supabase.from('bodyweight_records').select('*').eq('user_id', user.id).order('date', { ascending: true });
      setWeightRecords(weightData || []);

      // Fetch Diet Routines & Programs
      const { data: routinesData } = await supabase.from('diet_routines').select('*').eq('user_id', user.id);
      if (routinesData) setDietRoutines(routinesData.map(r => ({ id: r.id, name: r.name, meals: r.meals })));
      
      const { data: programsData } = await supabase.from('diet_programs').select('*').eq('user_id', user.id);
      if (programsData) setDietPrograms(programsData.map(p => ({ id: p.id, name: p.name, lengthInDays: p.length_in_days, schedule: p.schedule })));
      
      const { data: activeP } = await supabase.from('active_diet_program').select('*').eq('user_id', user.id).maybeSingle();
      if (activeP) setActiveDietProgramState({ programId: activeP.program_id, startDate: activeP.start_date });
    } catch (error) {
      console.error('Error fetching diet data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedDate]);

  const uniqueMeals = useMemo(() => {
    const seen = new Set<string>();
    const unique: Meal[] = [];
    [...allHistoricalMeals].sort((a,b) => b.date.localeCompare(a.date)).forEach(m => {
      if (m.name && !seen.has(m.name.toLowerCase())) {
        seen.add(m.name.toLowerCase());
        unique.push(m);
      }
    });
    return unique.slice(0, 20);
  }, [allHistoricalMeals]);

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
      setMeals(prev => [...prev.filter(m => m.id !== data.id), data]);
      setAllHistoricalMeals(prev => [...prev.filter(m => m.id !== data.id), data]);
    } catch {
      // Local Fallback
      const completeMeal = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() } as Meal;
      setMeals(prev => [...prev, completeMeal]);
      setAllHistoricalMeals(prev => [...prev, completeMeal]);
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
      setAllHistoricalMeals(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch {
      const mapper = (m: Meal) => m.id === id ? { ...m, ...updates } : m;
      setMeals(prev => prev.map(mapper));
      setAllHistoricalMeals(prev => prev.map(mapper));
      const allLocalStr = localStorage.getItem('mx_meals');
      if (allLocalStr) {
         const nextAll = JSON.parse(allLocalStr).map(mapper);
         localStorage.setItem('mx_meals', JSON.stringify(nextAll));
      }
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      await supabase.from('meals').delete().eq('id', id);
    } catch {
      // ignore
    } finally {
      setMeals(prev => prev.filter(m => m.id !== id));
      setAllHistoricalMeals(prev => prev.filter(m => m.id !== id));
      const allLocalStr = localStorage.getItem('mx_meals');
      if (allLocalStr) {
         localStorage.setItem('mx_meals', JSON.stringify(JSON.parse(allLocalStr).filter((m: Meal) => m.id !== id)));
      }
    }
  };

  const duplicateMeal = async (mealType: MealType, sourceDateStr: string) => {
    if (!user) return;
    let sourceMeal = allHistoricalMeals.find(m => m.date === sourceDateStr && m.meal_type === mealType);
    
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
        fiber: sourceMeal.fiber || 0,
        sugar: sourceMeal.sugar || 0,
        sodium: sourceMeal.sodium || 0,
        cholesterol: sourceMeal.cholesterol || 0,
        vitA: sourceMeal.vitA || 0,
        vitB: sourceMeal.vitB || 0,
        vitC: sourceMeal.vitC || 0,
        vitD: sourceMeal.vitD || 0,
        calcium: sourceMeal.calcium || 0,
        iron: sourceMeal.iron || 0,
        notes: sourceMeal.notes,
        timestamp: new Date().toISOString(),
        status: 'PLANNED'
      });
    }
  };

  const getMealsInRange = async (startDate: string, endDate: string): Promise<Meal[]> => {
    if (!user) return [];
    try {
        const { data, error } = await supabase.from('meals')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch {
        return allHistoricalMeals.filter(m => m.date >= startDate && m.date <= endDate && m.user_id === user.id);
    }
  };

  const getWaterInRange = async (startDate: string, endDate: string) => {
    if (!user) return [];
    try {
        const { data, error } = await supabase.from('water_logs')
            .select('date, amount_ml')
            .eq('user_id', user.id)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date', { ascending: true });
        if (error) throw error;
        return data || [];
    } catch {
        return [];
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
    const recentDbFoods: FoodItem[] = [];
    const seenMap = new Set<string>();
    
    [...allHistoricalMeals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).forEach(m => {
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

  const addWeightRecord = async (metrics: { weight: number; body_fat_pct?: number; muscle_mass_kg?: number; waist_cm?: number }) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase.from('bodyweight_records').upsert({ 
        user_id: user.id, 
        date: dateStr, 
        ...metrics 
    }, { onConflict: 'user_id,date' }).select().single();

    if (!error && data) {
      setWeightRecords(prev => {
        const filtered = prev.filter(r => r.date !== dateStr);
        const transformed: BodyweightRecord = {
            id: data.id,
            date: data.date,
            weight: data.weight,
            body_fat_pct: data.body_fat_pct,
            muscle_mass_kg: data.muscle_mass_kg,
            waist_cm: data.waist_cm
        };
        return [...filtered, transformed].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  };

  // --- Diet Routines & Programs Mutators ---
  const addDietRoutine = async (routine: DietRoutine) => {
    if (!user) return;
    await supabase.from('diet_routines').insert({
      id: routine.id, user_id: user.id, name: routine.name, meals: routine.meals
    });
    setDietRoutines(prev => [routine, ...prev]);
  };

  const updateDietRoutine = async (id: string, updated: DietRoutine) => {
    if (!user) return;
    await supabase.from('diet_routines').update({
      name: updated.name, meals: updated.meals
    }).eq('id', id).eq('user_id', user.id);
    setDietRoutines(prev => prev.map(r => r.id === id ? updated : r));
  };

  const deleteDietRoutine = async (id: string) => {
    if (!user) return;
    await supabase.from('diet_routines').delete().eq('id', id).eq('user_id', user.id);
    setDietRoutines(prev => prev.filter(r => r.id !== id));
  };

  const addDietProgram = async (program: DietProgram) => {
    if (!user) return;
    await supabase.from('diet_programs').insert({
      id: program.id, user_id: user.id, name: program.name,
      length_in_days: program.lengthInDays, schedule: program.schedule
    });
    setDietPrograms(prev => [...prev, program]);
  };

  const deleteDietProgram = async (id: string) => {
    if (!user) return;
    await supabase.from('diet_programs').delete().eq('id', id).eq('user_id', user.id);
    setDietPrograms(prev => prev.filter(p => p.id !== id));
    if (activeDietProgram?.programId === id) {
      await supabase.from('active_diet_program').delete().eq('user_id', user.id);
      setActiveDietProgramState(null);
    }
  };

  const setActiveDietProgram = async (state: ActiveDietProgramState | null) => {
    if (!user) return;
    if (state) {
      await supabase.from('active_diet_program').upsert(
        { user_id: user.id, program_id: state.programId, start_date: state.startDate },
        { onConflict: 'user_id' }
      );
    } else {
      await supabase.from('active_diet_program').delete().eq('user_id', user.id);
    }
    setActiveDietProgramState(state);
  };

  return (
    <DietContext.Provider value={{ 
      meals, waterIntake, dietGoals, weightRecords, 
      customFoods, favoriteMeals, uniqueMeals,
      selectedDate, isLoading, 
      dietRoutines, addDietRoutine, updateDietRoutine, deleteDietRoutine,
      dietPrograms, addDietProgram, deleteDietProgram,
      activeDietProgram, setActiveDietProgram,
      addMeal, updateMeal, deleteMeal, duplicateMeal, saveFavoriteMeal,
      getMealsInRange, getWaterInRange,
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
