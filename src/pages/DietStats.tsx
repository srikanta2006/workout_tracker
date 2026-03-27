import { useMemo } from 'react';
import { useDiet } from '../context/DietContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Activity, Flame, TrendingUp } from 'lucide-react';

export default function DietStats() {
  const { meals } = useDiet();

  const totals = useMemo(() => {
    return meals.reduce((acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [meals]);

  const pieData = [
    { name: 'Protein', value: totals.protein * 4, color: '#10b981' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#f59e0b' },
    { name: 'Fat', value: totals.fat * 9, color: '#ec4899' },
  ];

  const barData = [
    { name: 'Breakfast', kcal: meals.filter(m => m.meal_type === 'breakfast').reduce((a, b) => a + b.calories, 0) },
    { name: 'Lunch', kcal: meals.filter(m => m.meal_type === 'lunch').reduce((a, b) => a + b.calories, 0) },
    { name: 'Dinner', kcal: meals.filter(m => m.meal_type === 'dinner').reduce((a, b) => a + b.calories, 0) },
    { name: 'Snacks', kcal: meals.filter(m => m.meal_type === 'snack').reduce((a, b) => a + b.calories, 0) },
  ];

  return (
    <div className="w-full h-full space-y-8 pb-20">
      
      {/* Header */}
      <div>
          <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Diet Analytics</h2>
          <p className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-widest mt-1 px-1">Visualizing your performance fuel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Macro Distribution Pie */}
          <div className="glass-card rounded-[40px] p-8 min-h-[450px] flex flex-col border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Macro Breakdown (kcal)</h3>
              </div>
              <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'var(--color-bg-card)', 
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '16px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: 'var(--color-text-main)', fontWeight: 'bold' }}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Calorie Distribution Bar */}
          <div className="glass-card rounded-[40px] p-8 min-h-[450px] flex flex-col border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                      <Flame className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Calorie by Meal Type</h3>
              </div>
              <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" opacity={0.2} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }}
                          />
                          <Tooltip 
                            cursor={{ fill: 'var(--color-bg-base)', opacity: 0.5 }}
                            contentStyle={{ 
                                backgroundColor: 'var(--color-bg-card)', 
                                border: '1px solid var(--color-border-subtle)',
                                borderRadius: '16px'
                            }}
                          />
                          <Bar dataKey="kcal" fill="#f97316" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

      </div>

      {/* Insights */}
      <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] flex flex-col md:flex-row items-center gap-8">
           <div className="w-20 h-20 bg-emerald-500/10 rounded-[28px] flex items-center justify-center shrink-0">
               <Activity className="w-10 h-10 text-emerald-500" />
           </div>
           <div className="space-y-2 text-center md:text-left">
               <h4 className="text-xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Fuel Efficiency</h4>
               <p className="text-sm font-medium text-[var(--color-text-muted)] leading-relaxed max-w-2xl">
                   Based on your current intake, your protein percentage is <span className="text-emerald-500 font-bold">{Math.round((totals.protein * 4 / (totals.calories || 1)) * 100)}%</span>. 
                   Optimizing macro distribution helps preserve lean muscle mass while managing body composition.
               </p>
           </div>
      </div>

    </div>
  );
}
