import { useState, useMemo } from 'react';
import { useDiet } from '../context/DietContext';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Scale, Plus, History, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

export default function WeightLog() {
  const { weightRecords, addWeightRecord } = useDiet();
  const [weightValue, setWeightValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : null;
  const startWeight = weightRecords.length > 0 ? weightRecords[0].weight : null;
  const weightChange = (currentWeight && startWeight) ? (currentWeight - startWeight).toFixed(1) : '0.0';

  const chartData = useMemo(() => {
     return weightRecords.map(r => ({
       date: format(parseISO(r.date), 'MMM dd'),
       weight: r.weight
     }));
  }, [weightRecords]);

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightValue) return;
    setIsSubmitting(true);
    await addWeightRecord({ weight: Number(weightValue) });
    setIsSubmitting(false);
    setWeightValue('');
  };

  return (
    <div className="w-full h-full space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h2 className="text-4xl font-black text-[var(--color-text-main)] tracking-tight italic uppercase">Weight Tracker</h2>
              <p className="text-[var(--color-text-muted)] font-black text-xs uppercase tracking-widest mt-1 px-1">Monitor your body composition.</p>
          </div>
          
          <form onSubmit={handleAddWeight} className="flex items-center gap-3">
              <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                  <input 
                    type="number"
                    step="0.1"
                    placeholder="Enter weight..."
                    value={weightValue}
                    onChange={(e) => setWeightValue(e.target.value)}
                    className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl pl-12 pr-6 py-4 w-48 font-bold text-[var(--color-text-main)] focus:border-emerald-500 outline-none transition-all shadow-premium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--color-text-muted)] uppercase">kg</span>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 text-white p-4 rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                  <Plus className="w-6 h-6" />
              </button>
          </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Current Weight', value: currentWeight ? `${currentWeight} kg` : '--', icon: Scale, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Start Weight', value: startWeight ? `${startWeight} kg` : '--', icon: History, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { 
                label: 'Total Change', 
                value: `${Number(weightChange) > 0 ? '+' : ''}${weightChange} kg`, 
                icon: Number(weightChange) <= 0 ? TrendingDown : TrendingUp, 
                color: Number(weightChange) <= 0 ? 'text-emerald-500' : 'text-orange-500',
                bg: Number(weightChange) <= 0 ? 'bg-emerald-500/10' : 'bg-orange-500/10'
            },
          ].map(stat => (
              <div key={stat.label} className="glass-card rounded-[32px] p-8 flex items-center gap-6 border border-white/5">
                  <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                      <stat.icon className={clsx("w-7 h-7", stat.color)} />
                  </div>
                  <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">{stat.label}</span>
                      <h4 className="text-2xl font-black text-[var(--color-text-main)] tracking-tight">{stat.value}</h4>
                  </div>
              </div>
          ))}
      </div>

      {/* Trend Chart */}
      <div className="glass-card rounded-[40px] p-8 min-h-[450px] flex flex-col border border-white/5">
          <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight uppercase">Weight Trend</h3>
              </div>
              <div className="flex bg-[var(--color-bg-base)]/50 rounded-xl p-1 border border-white/5">
                  {['7D', '30D', 'ALL'].map(range => (
                      <button key={range} className={clsx(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all",
                        range === 'ALL' ? "bg-emerald-500 text-white shadow-md" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
                      )}>
                          {range}
                      </button>
                  ))}
              </div>
          </div>
          
          <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                      <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
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
                        dy={10}
                      />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'var(--color-bg-card)', 
                            border: '1px solid var(--color-border-subtle)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#10b981" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#weightGradient)" 
                        animationDuration={1500}
                      />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
          <h3 className="text-xl font-black text-[var(--color-text-main)] tracking-tight px-2 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-500" />
              Recent Records
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weightRecords.slice().reverse().map((record) => (
                  <div key={record.id} className="group glass-card rounded-[24px] p-5 flex items-center justify-between border border-white/5 hover:border-emerald-500/30 transition-all shadow-premium hover:shadow-premium-hover">
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[var(--color-bg-base)] rounded-xl flex items-center justify-center border border-[var(--color-border-subtle)]/30">
                              <Calendar className="w-5 h-5 text-[var(--color-text-muted)]" />
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">
                                  {format(parseISO(record.date), 'EEEE')}
                              </p>
                              <h4 className="text-lg font-black text-[var(--color-text-main)] tracking-tight">
                                  {format(parseISO(record.date), 'MMM do, yyyy')}
                              </h4>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="block text-2xl font-black text-emerald-500 tracking-tighter">{record.weight}</span>
                          <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Kilograms</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}
