import { useState, useMemo } from 'react';
import { useDiet } from '../context/DietContext';
import { Utensils, Trash2, Plus, Calendar, Clock, ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { FoodDatabaseModal } from '../components/diet/FoodDatabaseModal';
import type { MealType } from '../types';

export default function MealLog() {
  const { meals, deleteMeal, duplicateMeal, selectedDate, setSelectedDate } = useDiet();
  const [activeModalType, setActiveModalType] = useState<MealType | null>(null);
  
  const formattedDate = format(selectedDate, 'EEEE, MMMM do');
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  const mealBlocks: { type: MealType; label: string; icon: any }[] = [
      { type: 'breakfast', label: 'Breakfast', icon: Clock },
      { type: 'lunch', label: 'Lunch', icon: Utensils },
      { type: 'dinner', label: 'Dinner', icon: Utensils },
      { type: 'snack', label: 'Snacks', icon: Clock }
  ];

  /* Group meals by type for the selected day */
  const groupedMeals = useMemo(() => {
     return mealBlocks.reduce((acc, block) => {
         acc[block.type] = meals.filter(m => m.meal_type === block.type);
         return acc;
     }, {} as Record<MealType, typeof meals>);
  }, [meals]);

  return (
    <div className="w-full h-full space-y-8 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="flex flex-col">
                  <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Diet Log</h2>
                  <div className="flex items-center gap-2 mt-1 px-1">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-widest">{formattedDate}</span>
                      {isToday && <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase ml-2">Today</span>}
                  </div>
              </div>
              
              <div className="flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-1 shadow-premium">
                  <button onClick={handlePrevDay} className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-emerald-500 transition-all active:scale-90">
                      <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={handleNextDay} className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-emerald-500 transition-all active:scale-90">
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="glass-card rounded-[32px] p-6 grid grid-cols-2 md:grid-cols-4 gap-6 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
          {[
            { label: 'Total kcal', value: meals.reduce((a, b) => a + b.calories, 0), color: 'text-orange-500' },
            { label: 'Protein', value: `${meals.reduce((a, b) => a + b.protein, 0)}g`, color: 'text-emerald-500' },
            { label: 'Carbs', value: `${meals.reduce((a, b) => a + b.carbs, 0)}g`, color: 'text-amber-500' },
            { label: 'Fat', value: `${meals.reduce((a, b) => a + b.fat, 0)}g`, color: 'text-pink-500' },
          ].map(stat => (
              <div key={stat.label} className="flex flex-col relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{stat.label}</span>
                  <span className={stat.color + " text-3xl font-black tracking-tight"}>{stat.value}</span>
              </div>
          ))}
      </div>

      {/* Time Blocks */}
      <div className="space-y-6">
         {mealBlocks.map(block => {
             const blockMeals = groupedMeals[block.type];
             const blockCals = blockMeals.reduce((a,b) => a + b.calories, 0);
             const blockP = blockMeals.reduce((a,b) => a + b.protein, 0);
             const blockC = blockMeals.reduce((a,b) => a + b.carbs, 0);
             const blockF = blockMeals.reduce((a,b) => a + b.fat, 0);

             return (
                 <div key={block.type} className="glass-card rounded-[32px] overflow-hidden border border-white/5">
                     {/* Block Header */}
                     <div className="bg-[var(--color-bg-base)]/50 p-6 flex items-center justify-between border-b border-[var(--color-border-subtle)]/30">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                                 <block.icon className="w-6 h-6 text-emerald-500" />
                             </div>
                             <div>
                                 <h3 className="text-xl font-black text-[var(--color-text-main)] italic tracking-tight">{block.label}</h3>
                                 <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{blockCals} kcal • {blockP}p • {blockC}c • {blockF}f</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-2">
                             {blockMeals.length === 0 && (
                                <button 
                                    onClick={() => duplicateMeal(block.type, format(subDays(selectedDate, 1), 'yyyy-MM-dd'))}
                                    title="Clone from yesterday"
                                    className="p-3 text-[var(--color-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                                >
                                    <Copy className="w-5 h-5" />
                                </button>
                             )}
                             <button
                                 onClick={() => setActiveModalType(block.type)}
                                 className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                             >
                                 <Plus className="w-4 h-4" /> Add Food
                             </button>
                         </div>
                     </div>

                     {/* Logged Meals List */}
                     <div className="p-6">
                         {blockMeals.length > 0 ? (
                             <div className="space-y-4">
                                 {blockMeals.map(meal => (
                                     <div key={meal.id} className="group relative bg-[var(--color-bg-base)]/30 p-4 rounded-2xl border border-[var(--color-border-subtle)]/30 hover:border-emerald-500/30 transition-all">
                                         
                                         <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-[var(--color-text-main)]">{meal.name || 'Custom Log'}</h4>
                                                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">{meal.calories} kcal • {meal.timestamp ? format(new Date(meal.timestamp), 'h:mm a') : ''}</span>
                                            </div>
                                            <button 
                                              onClick={() => deleteMeal(meal.id)}
                                              className="p-2 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                         </div>

                                         {/* Embedded Items */}
                                         {meal.items && meal.items.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]/30 space-y-2">
                                                {meal.items.map(item => (
                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-subtle)]" />
                                                            <span className="text-[var(--color-text-muted)] font-medium">
                                                                <span className="text-[var(--color-text-main)] font-bold">{item.food_item.name}</span> — {item.quantity}{item.unit}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black text-[var(--color-text-muted)] tabular-nums">{item.calories} kcal</span>
                                                    </div>
                                                ))}
                                            </div>
                                         )}
                                         
                                         {meal.notes && (
                                             <div className="mt-3 text-xs text-[var(--color-text-muted)] italic pl-4 border-l-2 border-emerald-500/30">"{meal.notes}"</div>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="py-8 text-center text-sm font-bold text-[var(--color-text-muted)] opacity-50 uppercase tracking-widest border border-dashed border-[var(--color-border-subtle)]/30 rounded-2xl">
                                 Empty Plate
                             </div>
                         )}
                     </div>
                 </div>
             );
         })}
      </div>

      {activeModalType && (
          <FoodDatabaseModal 
             mealType={activeModalType} 
             onClose={() => setActiveModalType(null)} 
          />
      )}
    </div>
  );
}
