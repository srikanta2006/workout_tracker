import { useState } from 'react';
import { useDiet } from '../context/DietContext';
import { Utensils, Trash2, Plus, Calendar } from 'lucide-react';
import { LogMealModal } from '../components/LogMealModal';
import { format, subDays, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MealLog() {
  const { meals, deleteMeal, selectedDate, setSelectedDate } = useDiet();
  const [showLogModal, setShowLogModal] = useState(false);
  
  const formattedDate = format(selectedDate, 'EEEE, MMMM do');
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  return (
    <div className="w-full h-full space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="flex flex-col">
                  <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Meal History</h2>
                  <div className="flex items-center gap-2 mt-1 px-1">
                      <Calendar className="w-4 h-4 text-emerald-500" />
                      <span className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-widest">{formattedDate}</span>
                      {isToday && <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase ml-2">Today</span>}
                  </div>
              </div>
              
              <div className="flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-1 shadow-premium">
                  <button 
                    onClick={handlePrevDay}
                    className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-emerald-500 transition-all active:scale-90"
                  >
                      <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextDay}
                    className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-emerald-500 transition-all active:scale-90"
                  >
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
          <button 
            onClick={() => setShowLogModal(true)}
            className="bg-emerald-500 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5" />
            Log New Meal
          </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="glass-card rounded-[32px] p-6 grid grid-cols-2 md:grid-cols-4 gap-6 border border-white/5">
          {[
            { label: 'Total kcal', value: meals.reduce((a, b) => a + b.calories, 0), color: 'text-orange-500' },
            { label: 'Protein', value: `${meals.reduce((a, b) => a + b.protein, 0)}g`, color: 'text-emerald-500' },
            { label: 'Carbs', value: `${meals.reduce((a, b) => a + b.carbs, 0)}g`, color: 'text-amber-500' },
            { label: 'Fat', value: `${meals.reduce((a, b) => a + b.fat, 0)}g`, color: 'text-pink-500' },
          ].map(stat => (
              <div key={stat.label} className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">{stat.label}</span>
                  <span className={stat.color + " text-2xl font-black tracking-tight"}>{stat.value}</span>
              </div>
          ))}
      </div>

      {/* Meals Table-ish List */}
      <div className="space-y-4">
          {meals.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                  {meals.map((meal) => (
                      <div key={meal.id} className="group glass-card rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                                  <Utensils className="w-8 h-8 text-emerald-500" />
                              </div>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="bg-[var(--color-bg-base)] text-[var(--color-text-muted)] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-[var(--color-border-subtle)]/30">
                                          {meal.meal_type}
                                      </span>
                                      <span className="text-[10px] font-bold text-[var(--color-text-muted)] opacity-50">
                                          {meal.created_at ? format(new Date(meal.created_at), 'HH:mm') : '--:--'}
                                      </span>
                                  </div>
                                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight group-hover:text-emerald-500 transition-colors">
                                      {meal.name}
                                  </h3>
                              </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-12 w-full md:w-auto">
                              <div className="flex gap-8">
                                  <div className="flex flex-col">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">Calories</span>
                                      <span className="font-black text-[var(--color-text-main)]">{meal.calories}<span className="text-[10px] ml-0.5 opacity-50">kcal</span></span>
                                  </div>
                                  <div className="flex gap-4">
                                      <div className="flex flex-col">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">P</span>
                                          <span className="font-bold text-sm text-[var(--color-text-main)]">{meal.protein}g</span>
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">C</span>
                                          <span className="font-bold text-sm text-[var(--color-text-main)]">{meal.carbs}g</span>
                                      </div>
                                      <div className="flex flex-col">
                                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-0.5">F</span>
                                          <span className="font-bold text-sm text-[var(--color-text-main)]">{meal.fat}g</span>
                                      </div>
                                  </div>
                              </div>

                              <button 
                                onClick={() => deleteMeal(meal.id)}
                                className="p-4 rounded-2xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border-subtle)] rounded-[40px] py-32 text-center">
                   <Utensils className="w-16 h-16 text-[var(--color-text-muted)]/20 mx-auto mb-6" />
                   <h3 className="text-2xl font-black text-[var(--color-text-main)] mb-2">No meals logged yet</h3>
                   <p className="text-[var(--color-text-muted)] font-medium mb-8">Ready to track your first meal of the day?</p>
                   <button 
                        onClick={() => setShowLogModal(true)}
                        className="bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:border-emerald-500 transition-all"
                   >
                        Start Logging
                   </button>
              </div>
          )}
      </div>

      {showLogModal && <LogMealModal onClose={() => setShowLogModal(false)} />}
    </div>
  );
}
