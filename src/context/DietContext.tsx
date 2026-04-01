import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Meal, DietGoals, BodyweightRecord } from '../types';
import { format } from 'date-fns';

interface DietContextType {
  meals: Meal[];
  waterIntake: number;
  dietGoals: DietGoals | null;
  weightRecords: BodyweightRecord[];
  plannedMeals: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>[];
  selectedDate: Date;
  isLoading: boolean;
  addMeal: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  addToPlan: (meal: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>) => void;
  removeFromPlan: (index: number) => void;
  clearPlan: () => void;
  updateWater: (amount_ml: number) => Promise<void>;
  updateGoals: (goals: Omit<DietGoals, 'id' | 'user_id'>) => Promise<void>;
  addWeightRecord: (weight: number) => Promise<void>;
  setSelectedDate: (date: Date) => void;
  uniqueMeals: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>[];
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
  const [plannedMeals, setPlannedMeals] = useState<Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>[]>(() => {
    const saved = localStorage.getItem('maxout_planned_meals');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);

  // Persistence for planned meals
  useEffect(() => {
    localStorage.setItem('maxout_planned_meals', JSON.stringify(plannedMeals));
  }, [plannedMeals]);

  const addToPlan = (meal: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>) => {
    setPlannedMeals(prev => [...prev, meal]);
  };

  const removeFromPlan = (index: number) => {
    setPlannedMeals(prev => prev.filter((_, i) => i !== index));
  };

  const clearPlan = () => {
    setPlannedMeals([]);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // Fetch meals for selected date
      const { data: mealsData } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr);
      
      setMeals(mealsData || []);

      // Fetch water for selected date
      const { data: waterData } = await supabase
        .from('water_logs')
        .select('amount_ml')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();
      
      setWaterIntake(waterData?.amount_ml || 0);

      // Fetch diet goals (not date dependent)
      const { data: goalsData } = await supabase
        .from('diet_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setDietGoals(goalsData || null);

      // Fetch weight records (all history for chart)
      const { data: weightData } = await supabase
        .from('bodyweight_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
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

  const addMeal = async (meal: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('meals')
      .insert([{ ...meal, user_id: user.id, date: format(selectedDate, 'yyyy-MM-dd') }])
      .select()
      .single();
    
    if (!error && data) {
      setMeals(prev => [...prev, data]);
    }
  };

  const deleteMeal = async (id: string) => {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setMeals(prev => prev.filter(m => m.id !== id));
    }
  };

  const updateWater = async (amount_ml: number) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('water_logs')
      .upsert({ user_id: user.id, date: dateStr, amount_ml }, { onConflict: 'user_id,date' });
    
    if (!error) {
      setWaterIntake(amount_ml);
    }
  };

  const updateGoals = async (goals: Omit<DietGoals, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('diet_goals')
      .upsert({ ...goals, user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single();
    
    if (!error && data) {
      setDietGoals(data);
    }
  };

  const addWeightRecord = async (weight: number) => {
    if (!user) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('bodyweight_records')
      .upsert({ user_id: user.id, date: dateStr, weight }, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (!error && data) {
      setWeightRecords(prev => {
        const filtered = prev.filter(r => r.date !== dateStr);
        return [...filtered, data].sort((a, b) => a.date.localeCompare(b.date));
      });
    }
  };

  return (
    <DietContext.Provider value={{ 
      meals, 
      waterIntake, 
      dietGoals, 
      weightRecords,
      plannedMeals,
      selectedDate,
      isLoading, 
      addMeal, 
      deleteMeal, 
      addToPlan,
      removeFromPlan,
      clearPlan,
      updateWater, 
      updateGoals,
      addWeightRecord,
      setSelectedDate,
      uniqueMeals: getUniqueMeals(meals),
      refreshData: fetchData
    }}>
      {children}
    </DietContext.Provider>
  );
}

// Function to get unique meals based on name (case-insensitive)
function getUniqueMeals(meals: Meal[]) {
  const seen = new Set();
  const unique: Omit<Meal, 'id' | 'user_id' | 'created_at' | 'date'>[] = [];
  
  // Sort by created_at desc to get most recent macros for a given name
  const sorted = [...meals].sort((a, b) => 
    new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );

  for (const meal of sorted) {
    const key = meal.name.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        name: meal.name,
        meal_type: meal.meal_type,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      });
    }
  }
  return unique.slice(0, 8); // Top 8 recent meals
}

export function useDiet() {
  const context = useContext(DietContext);
  if (context === undefined) {
    throw new Error('useDiet must be used within a DietProvider');
  }
  return context;
}
