import { useState } from 'react';
import { X, Utensils, Flame, TrendingUp, Apple } from 'lucide-react';
import { useDiet } from '../context/DietContext';
import type { MealType } from '../types';
import clsx from 'clsx';

interface LogMealModalProps {
  onClose: () => void;
}

export function LogMealModal({ onClose }: LogMealModalProps) {
  const { addMeal, uniqueMeals } = useDiet();
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;

    setIsSubmitting(true);
    await addMeal({
      meal_type: mealType,
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleSelectRecent = (meal: typeof uniqueMeals[0]) => {
    setName(meal.name);
    setMealType(meal.meal_type);
    setCalories(meal.calories.toString());
    setProtein(meal.protein.toString());
    setCarbs(meal.carbs.toString());
    setFat(meal.fat.toString());
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[var(--color-bg-card)] w-full max-w-xl rounded-[40px] shadow-premium overflow-hidden animate-scale-spring border border-white/10">
        <div className="p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Log New Meal</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-[var(--color-bg-base)] rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-[var(--color-text-muted)]" />
              </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
              {/* Meal Name */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1">Meal Name</label>
                 <input 
                    autoFocus
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Scrambled Eggs & Toast"
                    className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-4 font-bold text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)]/50 focus:border-emerald-500/50 outline-none transition-all"
                    required
                 />
              </div>

              {/* Recent Foods Chips */}
              {uniqueMeals.length > 0 && (
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] px-1">Quick Select (Recent)</label>
                    <div className="flex flex-wrap gap-2">
                        {uniqueMeals.map((meal, idx) => (
                            <button
                                key={`${meal.name}-${idx}`}
                                type="button"
                                onClick={() => handleSelectRecent(meal)}
                                className="px-3 py-1.5 rounded-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 text-[10px] font-bold text-[var(--color-text-main)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all active:scale-95"
                            >
                                {meal.name}
                            </button>
                        ))}
                    </div>
                </div>
              )}

              {/* Meal Type Toggle */}
              <div className="grid grid-cols-4 gap-2">
                 {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(t => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setMealType(t)}
                        className={clsx(
                            "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                            mealType === t 
                                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                                : "bg-[var(--color-bg-base)] border-[var(--color-border-subtle)]/30 text-[var(--color-text-muted)] hover:border-emerald-500/30"
                        )}
                    >
                        {t}
                    </button>
                 ))}
              </div>

              {/* Main Values: Calories & Macros */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="space-y-1">
                    <div className="flex items-center gap-1.2 px-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Calories</span>
                    </div>
                    <input 
                        type="number"
                        value={calories}
                        onChange={e => setCalories(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                        required
                    />
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-1.2 px-1">
                        <Flame className="w-3 h-3 text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Protein (g)</span>
                    </div>
                    <input 
                        type="number"
                        value={protein}
                        onChange={e => setProtein(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-1.2 px-1">
                        <TrendingUp className="w-3 h-3 text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Carbs (g)</span>
                    </div>
                    <input 
                        type="number"
                        value={carbs}
                        onChange={e => setCarbs(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                    />
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-1.2 px-1">
                        <Apple className="w-3 h-3 text-pink-500" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--color-text-muted)]">Fat (g)</span>
                    </div>
                    <input 
                        type="number"
                        value={fat}
                        onChange={e => setFat(e.target.value)}
                        placeholder="0"
                        className="w-full bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)]/30 rounded-xl px-4 py-3 font-bold text-[var(--color-text-main)] focus:border-emerald-500/50 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-base)] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-gradient-to-r from-emerald-500 to-teal-600 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Log Meal'}
                  </button>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
