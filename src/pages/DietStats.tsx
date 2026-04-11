import { useState, useMemo, useEffect } from 'react';
import { useDiet } from '../context/DietContext';
import { useAuth } from '../context/AuthContext';
import { calculateBMR, calculateTDEE } from '../utils/healthCalculations';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, Line, AreaChart, Area
} from 'recharts';
import { 
  Activity, Flame, TrendingUp, Calendar, 
  Target, Zap, Waves
} from 'lucide-react';
import { format, subDays, startOfMonth, eachDayOfInterval } from 'date-fns';
import clsx from 'clsx';
import type { Meal } from '../types';

export default function DietStats() {
  const { profile } = useAuth();
  const { getMealsInRange, getWaterInRange, dietGoals } = useDiet();
  const [rangeType, setRangeType] = useState<'7d' | '30d' | 'month'>('7d');
  const [historyMeals, setHistoryMeals] = useState<Meal[]>([]);
  const [historyWater, setHistoryWater] = useState<{date: string, amount_ml: number}[]>([]);

  const rangeDates = useMemo(() => {
    const end = new Date();
    let start = subDays(end, 6);
    
    if (rangeType === '30d') start = subDays(end, 29);
    else if (rangeType === 'month') {
        start = startOfMonth(end);
    }
    
    return { 
        start: format(start, 'yyyy-MM-dd'), 
        end: format(end, 'yyyy-MM-dd'),
        interval: eachDayOfInterval({ start, end })
    };
  }, [rangeType]);

  useEffect(() => {
    const fetchData = async () => {
        const [meals, water] = await Promise.all([
            getMealsInRange(rangeDates.start, rangeDates.end),
            getWaterInRange(rangeDates.start, rangeDates.end)
        ]);
        setHistoryMeals(meals);
        setHistoryWater(water);
    };
    fetchData();
  }, [rangeDates.start, rangeDates.end, getMealsInRange, getWaterInRange]);

  // --- DATA PROCESSING ---
  
  // 1. Daily Aggregates (for Line/Area charts)
  const userTDEE = useMemo(() => {
    const bmr = calculateBMR(profile || {});
    return bmr ? calculateTDEE(bmr, profile?.activity_level) : null;
  }, [profile]);

  const chartData = useMemo(() => {
    return rangeDates.interval.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayMeals = historyMeals.filter(m => m.date === dateStr);
        const dayWater = historyWater.find(w => w.date === dateStr);
        
        return {
            date: format(day, 'MMM dd'),
            fullDate: dateStr,
            calories: dayMeals.reduce((sum, m) => sum + m.calories, 0),
            protein: dayMeals.reduce((sum, m) => sum + (m.protein || 0), 0),
            carbs: dayMeals.reduce((sum, m) => sum + (m.carbs || 0), 0),
            fat: dayMeals.reduce((sum, m) => sum + (m.fat || 0), 0),
            water: dayWater?.amount_ml || 0,
            goal: dietGoals?.target_calories || 2000,
            tdee: userTDEE || 0
        };
    });
  }, [rangeDates.interval, historyMeals, historyWater, dietGoals, userTDEE]);

  // Weight Prediction Logic
  const weightPrediction = useMemo(() => {
     if (!userTDEE) return null;
     const totalIntake = chartData.reduce((s, d) => s + (d.calories || 0), 0);
     const totalBurn = userTDEE * chartData.length;
     const netBalance = totalIntake - totalBurn;
     const kgChange = netBalance / 7700; // 7700 kcal per kg of fat
     return {
         change: kgChange.toFixed(2),
         isGain: netBalance > 0,
         netCals: Math.abs(netBalance)
     };
  }, [chartData, userTDEE]);

  const adherenceStats = useMemo(() => {
    const plannedItems = historyMeals.filter(m => m.status === 'PLANNED' || m.status === 'COMPLETED');
    const completedItems = historyMeals.filter(m => m.status === 'COMPLETED');
    const unplannedItems = historyMeals.filter(m => m.status === 'UNPLANNED');

    const score = plannedItems.length > 0 
       ? Math.round((completedItems.length / plannedItems.length) * 100) 
       : null;

    const extrasCals = unplannedItems.reduce((sum, m) => sum + m.calories, 0);

    return { score, extrasCals, unplannedCount: unplannedItems.length };
  }, [historyMeals]);

  // 2. Macro Totals (for Pie Chart)
  const macroTotals = useMemo(() => {
    const totals = historyMeals.reduce((acc, m) => ({
        p: acc.p + (m.protein || 0),
        c: acc.c + (m.carbs || 0),
        f: acc.f + (m.fat || 0)
    }), { p: 0, c: 0, f: 0 });
    
    return [
        { name: 'Protein', value: totals.p * 4, color: '#10b981' },
        { name: 'Carbs', value: totals.c * 4, color: '#f59e0b' },
        { name: 'Fat', value: totals.f * 9, color: '#ec4899' },
    ];
  }, [historyMeals]);

  // 3. Micronutrient Averages (for Bar Chart)
  const microAverages = useMemo(() => {
    const dayCount = rangeDates.interval.length;
    const totals = historyMeals.reduce((acc, m) => ({
        fiber: acc.fiber + (m.fiber || 0),
        sugar: acc.sugar + (m.sugar || 0),
        sodium: acc.sodium + (m.sodium || 0),
        calcium: acc.calcium + (m.calcium || 0),
        iron: acc.iron + (m.iron || 0),
        vitC: acc.vitC + (m.vitC || 0)
    }), { fiber: 0, sugar: 0, sodium: 0, calcium: 0, iron: 0, vitC: 0 });
    
    return [
        { name: 'Fiber', value: Math.round(totals.fiber/dayCount), target: 30, unit: 'g' },
        { name: 'Sugar', value: Math.round(totals.sugar/dayCount), target: 50, unit: 'g' },
        { name: 'Sodium', value: Math.round(totals.sodium/dayCount), target: 2300, unit: 'mg' },
        { name: 'Calcium', value: Math.round(totals.calcium/dayCount), target: 1000, unit: 'mg' },
        { name: 'Iron', value: Math.round(totals.iron/dayCount), target: 18, unit: 'mg' },
        { name: 'Vit C', value: Math.round(totals.vitC/dayCount), target: 90, unit: 'mg' },
    ];
  }, [historyMeals, rangeDates.interval]);

  const avgCals = Math.round(chartData.reduce((s,d) => s + d.calories, 0) / chartData.length);

  return (
    <div className="w-full h-full space-y-8 pb-24 overflow-x-hidden">
      
      {/* HEADER & CONTROLS */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="animate-slide-down">
          <h1 className="text-5xl font-black text-[var(--color-text-main)] tracking-tighter italic uppercase leading-none">
            Analytics <span className="text-emerald-500">Hub</span>
          </h1>
          <p className="text-[var(--color-text-muted)] font-bold text-xs uppercase tracking-[0.3em] mt-2 px-1">
            {rangeDates.start} — {rangeDates.end}
          </p>
        </div>

        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]/30 rounded-[28px] p-1.5 flex gap-1 shadow-premium max-w-fit animate-slide-down delay-100">
          {(['7d', '30d', 'month'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setRangeType(type)}
              className={clsx(
                "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                rangeType === type 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-[var(--color-text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10"
              )}
            >
              {type === '7d' ? 'Last 7 Days' : type === '30d' ? 'Last 30 Days' : 'This Month'}
            </button>
          ))}
        </div>
      </header>

      {/* QUICK STATS SCORECARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
              { label: 'Avg Daily Cal', value: avgCals, unit: 'kcal', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Weight Projection', value: weightPrediction ? `${weightPrediction.change}kg` : '-', unit: weightPrediction?.isGain ? 'Surplus' : 'Deficit', icon: TrendingUp, color: weightPrediction?.isGain ? 'text-red-500' : 'text-emerald-500', bg: weightPrediction?.isGain ? 'bg-red-500/10' : 'bg-emerald-500/10' },
              { label: 'Adherence', value: adherenceStats.score !== null ? adherenceStats.score : '-', unit: '%', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Unplanned Extras', value: adherenceStats.extrasCals, unit: 'kcal', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Active Days', value: chartData.filter(d => d.calories > 0).length, unit: 'days', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
              <div key={i} className="glass-card rounded-[32px] p-6 border border-white/5 shadow-premium animate-scale-spring" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4 mb-4">
                      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                          <stat.icon className={clsx("w-6 h-6", stat.color)} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{stat.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[var(--color-text-main)] tracking-tight">{stat.value}</span>
                      <span className="text-xs font-bold text-[var(--color-text-muted)]">{stat.unit}</span>
                  </div>
              </div>
          ))}
      </div>

      {/* PRIMARY CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Calorie Trend Area Chart */}
          <div className="lg:col-span-8 glass-card rounded-[40px] p-8 min-h-[450px] border border-white/5 flex flex-col shadow-premium group relative overflow-hidden animate-slide-up">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-emerald-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Calorie Consumption Trend</h3>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Intake</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white/10" />
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Goal</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500/30" />
                          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">TDEE</span>
                      </div>
                  </div>
              </div>

              <div className="flex-1 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                          <defs>
                              <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.1} />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }}
                            interval={rangeType === '30d' ? 5 : 0}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--color-bg-card)', 
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '20px',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                padding: '16px'
                            }}
                            itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="calories" 
                            stroke="#10b981" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorCals)" 
                            animationDuration={1500}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="goal" 
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth={2} 
                            strokeDasharray="5 5" 
                            dot={false}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="tdee" 
                            stroke="rgba(249, 115, 22, 0.3)" 
                            strokeWidth={2} 
                            strokeDasharray="3 3" 
                            dot={false}
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Macro Distribution Pie Chart */}
          <div className="lg:col-span-4 glass-card rounded-[40px] p-8 min-h-[450px] border border-white/5 flex flex-col shadow-premium animate-slide-up delay-100">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Macro Balance</h3>
              </div>

              <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={macroTotals}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {macroTotals.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--color-bg-card)', 
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '16px'
                            }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                          <span className="block text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Total Energy</span>
                          <span className="text-2xl font-black text-[var(--color-text-main)] tracking-tighter">
                            {Math.round(macroTotals.reduce((s,i) => s + i.value, 0))} <span className="text-xs uppercase">kcal</span>
                          </span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Micronutrient Performance Bar Chart */}
          <div className="lg:col-span-12 glass-card rounded-[40px] p-8 min-h-[400px] border border-white/5 flex flex-col shadow-premium animate-slide-up delay-200">
              <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                          <Waves className="w-5 h-5 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Avg Daily Micronutrient Performance</h3>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">Vs Suggested Daily Intake</p>
              </div>

              <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={microAverages} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border-subtle)" opacity={0.1} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text-main)', fontSize: 11, fontWeight: 'black' }} 
                            width={80}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ 
                                backgroundColor: 'var(--color-bg-card)', 
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '16px'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="#10b981" 
                            radius={[0, 8, 8, 0]} 
                            barSize={24}
                          >
                             {microAverages.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.value >= entry.target ? '#10b981' : '#fbbf24'} />
                             ))}
                          </Bar>
                          <Bar dataKey="target" fill="rgba(255,255,255,0.1)" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

      </div>

      {/* INSIGHTS BANNER */}
      <div className="p-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-[40px] flex flex-col md:flex-row items-center gap-8 animate-slide-up delay-300">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center shrink-0">
              <Activity className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Diagnostic Summary</h4>
              <p className="text-sm font-medium text-[var(--color-text-muted)] leading-relaxed max-w-4xl">
                  Across the last <span className="text-emerald-500 font-bold">{chartData.length} days</span>, your average daily adherence to your calorie goal is <span className="text-emerald-500 font-bold">{Math.round((chartData.filter(d => d.calories >0).length / chartData.length) * 100)}%</span>.
                  Your highest performing micronutrient is <span className="text-emerald-500 font-bold">{[...microAverages].sort((a,b) => (b.value/b.target)-(a.value/a.target))[0].name}</span>. 
                  Focus on increasing <span className="text-amber-500 font-bold">{[...microAverages].sort((a,b) => (a.value/a.target)-(b.value/b.target))[0].name}</span> for optimal metabolic health.
              </p>
          </div>
      </div>

    </div>
  );
}
