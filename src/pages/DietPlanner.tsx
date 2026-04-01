import { useState, useMemo } from 'react';
import { useDiet } from '../context/DietContext';
import { INDIAN_FOOD_DATABASE, type FoodItem } from '../data/foodDatabase';
import { 
  Plus, Search, Trash2, Info, Flame, TrendingUp, Apple, 
  Save, Utensils
} from 'lucide-react';
import type { FitnessGoalType } from '../types';
import clsx from 'clsx';

export default function DietPlanner() {
  const { plannedMeals, addToPlan, removeFromPlan, clearPlan, dietGoals, updateGoals, addMeal } = useDiet();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoalType>(dietGoals?.fitness_goal || 'maintain');

  const filteredFoods = useMemo<FoodItem[]>(() => {
    return INDIAN_FOOD_DATABASE.filter(food => 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const plannedTotals = useMemo(() => {
    return plannedMeals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [plannedMeals]);

  // Suggested targets based on goal
  const suggestedTargets = useMemo(() => {
    const baseTDEE = 2200;
    switch (selectedGoal) {
      case 'lose_weight': return { cal: baseTDEE - 400, p: 160, c: 180, f: 60 };
      case 'cut': return { cal: baseTDEE - 700, p: 180, c: 120, f: 50 };
      case 'gain_weight': return { cal: baseTDEE + 400, p: 150, c: 300, f: 80 };
      case 'bulk': return { cal: baseTDEE + 800, p: 170, c: 450, f: 90 };
      default: return { cal: baseTDEE, p: 140, c: 250, f: 70 };
    }
  }, [selectedGoal]);

  const handleGoalChange = (goal: FitnessGoalType) => {
    setSelectedGoal(goal);
    // Optionally update the persistent goals in Supabase
    updateGoals({
      target_calories: suggestedTargets.cal,
      target_protein: suggestedTargets.p,
      target_carbs: suggestedTargets.c,
      target_fat: suggestedTargets.f,
      fitness_goal: goal
    });
  };

  const handleLogAll = async () => {
    for (const meal of plannedMeals) {
      await addMeal(meal);
    }
    clearPlan();
    alert('All planned meals have been added to your today\'s log!');
  };

  return (
    <div className="w-full h-full space-y-8 pb-20 overflow-x-hidden">
      
      {/* --- HEADER & GOAL SELECTOR --- */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black text-[var(--color-text-main)] tracking-tighter italic uppercase leading-none mb-2">
            Diet <span className="text-emerald-500">Planner</span>
          </h1>
          <p className="text-[var(--color-text-muted)] font-medium">Design your perfect day's nutrition before you eat it.</p>
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-3xl p-1.5 flex flex-wrap gap-1 shadow-premium max-w-fit">
          {(['lose_weight', 'cut', 'maintain', 'gain_weight', 'bulk'] as FitnessGoalType[]).map((goal) => (
            <button
              key={goal}
              onClick={() => handleGoalChange(goal)}
              className={clsx(
                "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                selectedGoal === goal 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10"
              )}
            >
              {goal.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT: PLANNING PANE --- */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Progress Overview Card */}
          <div className="glass-card rounded-[40px] p-8 shadow-premium border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
               <div className="relative shrink-0">
                  <div className="w-48 h-48 rounded-full border-[12px] border-[var(--color-bg-base)] flex flex-col items-center justify-center relative shadow-inner">
                      <div 
                        className="absolute inset-x-0 bottom-0 bg-emerald-500/10 transition-all duration-1000 ease-out" 
                        style={{ height: `${Math.min((plannedTotals.calories/suggestedTargets.cal)*100, 100)}%` }}
                      />
                      <span className="text-4xl font-black text-[var(--color-text-main)] tracking-tighter">
                        {plannedTotals.calories}
                      </span>
                      <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Planned kcal</span>
                      <div className="text-[10px] font-bold text-[var(--color-text-muted)] mt-1">Goal: {suggestedTargets.cal}</div>
                  </div>
               </div>

               <div className="flex-1 grid grid-cols-3 gap-6 w-full">
                  {[
                    { label: 'Protein', value: plannedTotals.protein, target: suggestedTargets.p, color: '#10b981', icon: Flame },
                    { label: 'Carbs', value: plannedTotals.carbs, target: suggestedTargets.c, color: '#f59e0b', icon: TrendingUp },
                    { label: 'Fat', value: plannedTotals.fat, target: suggestedTargets.f, color: '#ec4899', icon: Apple },
                  ].map(m => (
                    <div key={m.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{m.label}</span>
                            <span className="text-xs font-bold text-[var(--color-text-main)]">{m.value}/{m.target}g</span>
                        </div>
                        <div className="h-3 bg-[var(--color-bg-base)] rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full transition-all duration-700"
                              style={{ 
                                width: `${Math.min((m.value/m.target)*100, 100)}%`,
                                backgroundColor: m.color
                              }}
                            />
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                        <Info className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] max-w-md">
                      Planning your meals in advance increases dietary compliance by <span className="text-emerald-500 font-bold">45%</span>. 
                      Log all these once you're done!
                    </p>
                </div>
                {plannedMeals.length > 0 && (
                  <div className="flex gap-3">
                    <button 
                      onClick={clearPlan}
                      className="px-6 py-4 rounded-2xl border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all"
                    >
                      Clear Plan
                    </button>
                    <button 
                      onClick={handleLogAll}
                      className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Add to Log
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Planned Items Slots */}
          <div className="space-y-4">
               <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight px-2 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-emerald-500" />
                  Your Day Schedule
               </h3>
               
               <div className="grid grid-cols-1 gap-4">
                  {plannedMeals.length > 0 ? plannedMeals.map((meal, idx) => (
                    <div key={idx} className="group bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/50 rounded-3xl p-5 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-sm">
                         <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-[var(--color-bg-base)] rounded-2xl flex items-center justify-center text-emerald-500 font-bold">
                                 {idx + 1}
                             </div>
                             <div>
                                 <h4 className="font-bold text-[var(--color-text-main)] leading-tight">{meal.name}</h4>
                                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">
                                    {meal.calories} kcal · P: {meal.protein}g C: {meal.carbs}g F: {meal.fat}g
                                 </p>
                             </div>
                         </div>
                         <button 
                           onClick={() => removeFromPlan(idx)}
                           className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>
                  )) : (
                    <div className="bg-[var(--color-bg-base)] border-2 border-dashed border-[var(--color-border-subtle)]/50 rounded-[40px] py-16 text-center">
                        <Plus className="w-12 h-12 text-[var(--color-text-muted)]/20 mx-auto mb-4" />
                        <h4 className="text-lg font-black text-[var(--color-text-muted)]">Empty Planner</h4>
                        <p className="text-sm text-[var(--color-text-muted)]/60 max-w-xs mx-auto">Start adding foods from the search pane to map out your nutrition.</p>
                    </div>
                  )}
               </div>
          </div>
        </div>

        {/* --- RIGHT: FOOD BROWSER PANE --- */}
        <div className="xl:col-span-4 space-y-6">
          <div className="p-1.5 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-[32px] shadow-premium">
             <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                <input 
                  type="text"
                  placeholder="Search Indian foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-bg-base)] border-none rounded-[28px] py-6 pl-16 pr-8 text-sm font-bold text-[var(--color-text-main)] focus:ring-2 focus:ring-emerald-500/30 placeholder:text-[var(--color-text-muted)]/50 transition-all outline-none"
                />
             </div>
          </div>

          <div className="space-y-3 h-[calc(100vh-400px)] overflow-y-auto pr-2 custom-scrollbar">
            {filteredFoods.map(food => (
              <button
                key={food.id}
                onClick={() => addToPlan({
                  name: food.name,
                  meal_type: 'snack', // Default for planner
                  calories: food.calories,
                  protein: food.protein,
                  carbs: food.carbs,
                  fat: food.fat
                })}
                className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 p-5 rounded-3xl flex items-center justify-between group hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-[0.98] text-left"
              >
                <div>
                  <h4 className="font-bold text-[var(--color-text-main)] group-hover:text-emerald-500 transition-colors">{food.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black uppercase text-emerald-500/70">{food.region || 'General'}</span>
                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">·</span>
                    <span className="text-[9px] font-black uppercase text-[var(--color-text-muted)]">{food.calories} kcal</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                   <Plus className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
