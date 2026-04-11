import { useMemo, useState } from 'react';
import { useDiet } from '../context/DietContext';
import { Apple, Plus, Utensils, Droplets, Flame, TrendingUp, ChevronRight, Scale, Settings } from 'lucide-react';
import { LogMealModal } from '../components/LogMealModal';
import { DietGoalModal } from '../components/DietGoalModal';
import BodyMetricModal from '../components/diet/BodyMetricModal';
import { useNavigate } from 'react-router-dom';

// --- MACRO RING COMPONENT ---
function MacroRing({ 
  percentage, 
  size = 160, 
  strokeWidth = 12, 
  color, 
  label, 
  value, 
  unit = 'g',
  icon: Icon
}: { 
  percentage: number; 
  size?: number; 
  strokeWidth?: number; 
  color: string; 
  label: string; 
  value: number;
  unit?: string;
  icon: any;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 group animate-scale-spring">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-[var(--color-bg-base)]"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-5 h-5 mb-1" style={{ color }} />
          <span className="text-xl font-black text-[var(--color-text-main)] tracking-tight">
            {Math.round(value)}
            <span className="text-[10px] font-bold text-[var(--color-text-muted)] ml-0.5">{unit}</span>
          </span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-[var(--color-text-main)] transition-colors">
        {label}
      </span>
    </div>
  );
}

export default function NutritionDashboard() {
  const { meals, waterIntake, dietGoals, updateWater } = useDiet();
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBodyMetricModal, setShowBodyMetricModal] = useState(false);
  const navigate = useNavigate();

  // Totals
  const totals = useMemo(() => {
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);

  // Fallback goals if not set
  const goals = dietGoals || {
    target_calories: 2500,
    target_protein: 180,
    target_carbs: 250,
    target_fat: 80,
    target_water: 3000,
  };

  const macroProgress = [
    { label: 'Protein', value: totals.protein, target: goals.target_protein, color: '#10b981', icon: Flame },
    { label: 'Carbs', value: totals.carbs, target: goals.target_carbs, color: '#f59e0b', icon: TrendingUp },
    { label: 'Fat', value: totals.fat, target: goals.target_fat, color: '#ec4899', icon: Apple },
  ];

  const calPercentage = (totals.calories / goals.target_calories) * 100;

  return (
    <div className="w-full h-full space-y-8 pb-12 overflow-x-hidden">
      
      {/* --- HERO SECTION: CALORIE OVERVIEW --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Calorie Ring Card */}
        <div className="lg:col-span-2 glass-card rounded-[40px] p-8 shadow-premium relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group transition-all duration-500 hover:shadow-premium-hover">
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
            
            <button 
              onClick={() => setShowGoalModal(true)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-bg-base)]/50 text-[var(--color-text-muted)] hover:text-emerald-500 transition-all opacity-0 group-hover:opacity-100"
            >
               <Settings className="w-5 h-5" />
            </button>
            
            {/* Big Calorie Ring */}
            <div className="relative shrink-0">
                <MacroRing 
                    percentage={calPercentage}
                    size={220}
                    strokeWidth={16}
                    color="#10b981"
                    label="Calories"
                    value={totals.calories}
                    unit="kcal"
                    icon={Flame}
                />
            </div>

            <div className="flex-1 space-y-6 text-center md:text-left">
                <div>
                   <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight leading-none mb-2">
                     Fueling Up
                   </h2>
                   <p className="text-[var(--color-text-muted)] font-medium">
                     You've consumed <span className="text-emerald-500 font-bold">{totals.calories} kcal</span> of your <span className="font-bold">{goals.target_calories} kcal</span> daily goal.
                   </p>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {macroProgress.map((m) => (
                        <div key={m.label} className="bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 rounded-2xl px-5 py-3 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                             <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{m.label}</span>
                                 <span className="text-sm font-bold text-[var(--color-text-main)]">
                                     {m.value} / {m.target}g
                                 </span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Water Tracker Widget */}
        <div className="glass-card rounded-[40px] p-8 shadow-premium flex flex-col justify-between items-center text-center group hover:shadow-premium-hover transition-all duration-500 overflow-hidden relative">
             <div className="absolute inset-x-0 bottom-0 bg-blue-500/10 pointer-events-none transition-all duration-1000" style={{ height: `${Math.min((waterIntake/(goals.target_water || 3000))*100, 100)}%` }} />
             
             <div className="relative z-10 w-full">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Droplets className="w-8 h-8 text-blue-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-[var(--color-text-main)] mb-1 tracking-tight">Hydration</h3>
                <p className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-6">Target: {goals.target_water || 3000}ml</p>
                
                <div className="text-4xl font-black text-[var(--color-text-main)] mb-6 tracking-tighter">
                   {waterIntake} <span className="text-lg font-bold text-blue-500">ml</span>
                </div>
             </div>

             <div className="relative z-10 flex gap-2 w-full max-w-[200px]">
                <button 
                  onClick={() => updateWater(Math.max(0, waterIntake - 250))}
                  className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] py-2 rounded-xl font-black text-xs active:scale-95 transition-all"
                >
                  -250
                </button>
                <button 
                  onClick={() => updateWater(waterIntake + 250)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-black text-xs shadow-md active:scale-95 transition-all hover:bg-blue-600"
                >
                  +250
                </button>
             </div>
        </div>
      </section>

      {/* --- RECENT MEALS & QUICK ACTIONS --- */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight">Today's Meals</h3>
                  <div className="flex items-center gap-4">
                      <button onClick={() => navigate('/diet-stats')} className="text-emerald-500 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1 group">
                          Analytics <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button onClick={() => navigate('/meals')} className="text-[var(--color-text-muted)] text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1 group">
                          Full Log <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meals.length > 0 ? meals.map(meal => (
                      <div key={meal.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/50 rounded-3xl p-5 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-sm">
                           <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                   <Utensils className="w-6 h-6 text-emerald-500" />
                               </div>
                               <div>
                                   <h4 className="font-bold text-[var(--color-text-main)] leading-tight">{meal.name}</h4>
                                   <p className="text-xs font-medium text-[var(--color-text-muted)] capitalize">{meal.meal_type}</p>
                               </div>
                           </div>
                           <div className="text-right">
                               <div className="font-black text-lg text-[var(--color-text-main)]">{meal.calories} kcal</div>
                               <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                   P: {meal.protein}g · C: {meal.carbs}g · F: {meal.fat}g
                               </div>
                           </div>
                      </div>
                  )) : (
                      <div className="md:col-span-2 bg-[var(--color-bg-base)] border border-dashed border-[var(--color-border-subtle)] rounded-3xl py-12 text-center">
                          <Plus className="w-12 h-12 text-[var(--color-text-muted)]/30 mx-auto mb-4" />
                          <p className="font-bold text-[var(--color-text-muted)]">No meals logged yet today</p>
                      </div>
                  )}
              </div>
          </div>

          <div className="space-y-4">
               <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight px-2">Quick Add</h3>
               <div className="space-y-3">
                    <button 
                      onClick={() => setShowLogModal(true)}
                      className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-emerald-500 hover:shadow-md p-4 rounded-3xl flex items-center gap-4 transition-all group text-left"
                    >
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 font-bold group-hover:scale-110 transition-transform">
                             <Plus className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-[var(--color-text-main)]">Custom Meal</span>
                    </button>
                    <button 
                      onClick={() => setShowBodyMetricModal(true)}
                      className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-3xl flex items-center gap-4 shadow-md hover:shadow-lg transition-all active:scale-[0.98] group text-left"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold">
                             <Scale className="w-5 h-5" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest text-white">Log Biometrics</span>
                    </button>
               </div>
          </div>
      </section>

      {showLogModal && <LogMealModal onClose={() => setShowLogModal(false)} />}
      {showGoalModal && <DietGoalModal onClose={() => setShowGoalModal(false)} />}
      <BodyMetricModal 
        isOpen={showBodyMetricModal} 
        onClose={() => setShowBodyMetricModal(false)} 
      />
    </div>
  );
}
