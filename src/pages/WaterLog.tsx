import { useDiet } from '../context/DietContext';
import { Droplets, Plus, Minus, GlassWater, Trophy, Info, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import clsx from 'clsx';

export default function WaterLog() {
  const { waterIntake, updateWater, selectedDate, setSelectedDate } = useDiet();
  
  const formattedDate = format(selectedDate, 'EEEE, MMMM do');
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1));
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  const target = 3000;
  const percentage = Math.min((waterIntake / target) * 100, 100);

  const QUICK_ADDS = [
    { label: 'Glass', amount: 250, icon: GlassWater },
    { label: 'Bottle', amount: 500, icon: Droplets },
    { label: 'Big Bottle', amount: 1000, icon: Droplets },
  ];

  return (
    <div className="w-full h-full space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
              <div className="flex flex-col">
                  <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Hydration Tracker</h2>
                  <div className="flex items-center gap-2 mt-1 px-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-widest">{formattedDate}</span>
                      {isToday && <span className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase ml-2">Today</span>}
                  </div>
              </div>
              
              <div className="flex items-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-1 shadow-premium">
                  <button 
                    onClick={handlePrevDay}
                    className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-blue-500 transition-all active:scale-90"
                  >
                      <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleNextDay}
                    className="p-3 hover:bg-[var(--color-bg-base)] rounded-xl text-[var(--color-text-muted)] hover:text-blue-500 transition-all active:scale-90"
                  >
                      <ChevronRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Water Visualizer */}
          <div className="lg:col-span-2 glass-card rounded-[40px] p-10 flex flex-col items-center justify-between min-h-[500px] relative overflow-hidden group">
              {/* Wave Background */}
              <div 
                className="absolute inset-x-0 bottom-0 bg-blue-500/10 transition-all duration-1000 ease-out z-0" 
                style={{ height: `${percentage}%` }}
              >
                  <div className="absolute top-0 inset-x-0 h-4 bg-blue-500/20 animate-pulse blur-xl" />
              </div>

              <div className="relative z-10 text-center space-y-4">
                  <div className={clsx(
                    "w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto transition-all duration-500",
                    percentage >= 100 ? "bg-emerald-500 shadow-lg shadow-emerald-500/40" : "bg-blue-500/10"
                  )}>
                      {percentage >= 100 ? (
                        <Trophy className="w-12 h-12 text-white animate-bounce" />
                      ) : (
                        <Droplets className="w-12 h-12 text-blue-500 animate-pulse" />
                      )}
                  </div>
                  <div>
                      <span className="text-7xl font-black text-[var(--color-text-main)] tracking-tighter">
                          {waterIntake}
                      </span>
                      <span className="text-2xl font-black text-blue-500 ml-2">ml</span>
                  </div>
                  <div className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-[0.3em]">
                      Goal: {target} ml
                  </div>
              </div>

              <div className="relative z-10 w-full max-w-md bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 rounded-3xl p-8 flex items-center justify-between gap-8 group-hover:border-blue-500/30 transition-all shadow-premium">
                  <button 
                    onClick={() => updateWater(Math.max(0, waterIntake - 250))}
                    className="p-4 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] hover:bg-red-500 hover:text-white transition-all shadow-premium active:scale-95"
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <div className="flex-1 h-3 bg-[var(--color-bg-card)] rounded-full overflow-hidden border border-white/5 relative">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                      </div>
                  </div>

                  <button 
                    onClick={() => updateWater(waterIntake + 250)}
                    className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
              </div>
          </div>

          {/* Quick Add Grid */}
          <div className="space-y-6">
              <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight px-2 flex items-center gap-2">
                  <GlassWater className="w-5 h-5 text-blue-500" />
                  Quick Add
              </h3>
              <div className="grid grid-cols-1 gap-4">
                  {QUICK_ADDS.map((item) => (
                      <button 
                        key={item.amount}
                        onClick={() => updateWater(waterIntake + item.amount)}
                        className="glass-card hover:border-blue-500/50 p-6 rounded-[32px] flex items-center justify-between group transition-all hover:translate-x-2 shadow-premium hover:shadow-premium-hover"
                      >
                          <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 transition-colors group-hover:text-white">
                                  <item.icon className="w-6 h-6" />
                              </div>
                              <div className="text-left">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] group-hover:text-blue-500 transition-colors">
                                      {item.label}
                                  </span>
                                  <h4 className="text-xl font-black text-[var(--color-text-main)] tracking-tight">+{item.amount}ml</h4>
                              </div>
                          </div>
                          <Plus className="w-6 h-6 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:text-blue-500 transition-all" />
                      </button>
                  ))}
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] flex items-start gap-4">
                   <Info className="w-6 h-6 text-blue-500 shrink-0" />
                   <p className="text-xs font-medium text-blue-500/80 leading-relaxed">
                       Hydration is key for muscle recovery and metabolic health. Aim for small, consistent sips throughout the day.
                   </p>
              </div>
          </div>

      </div>

    </div>
  );
}
