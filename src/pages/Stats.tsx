import { useMemo, useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { Dumbbell, TrendingUp, Calendar as CalendarIcon, Scale, Plus } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

export function Stats() {
  const { workouts, bodyweights, addBodyweight } = useWorkoutState();
  const [weightInput, setWeightInput] = useState('');

  const volumeData = useMemo(() => {
    // Generate last 7 days including today
    const today = startOfDay(new Date());
    const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
    
    return days.map(day => {
      // Find all workouts for this day avoiding timezone shifts
      const dayWorkouts = workouts.filter(w => w.date === format(day, 'yyyy-MM-dd'));
      
      // Calculate total volume for the day
      const dailyVolume = dayWorkouts.reduce((acc, workout) => {
        return acc + workout.exercises.reduce((exAcc, ex) => {
          return exAcc + ex.sets.reduce((setAcc, set) => setAcc + ((Number(set.weight) || 0) * (Number(set.reps) || 0)), 0);
        }, 0);
      }, 0);

      return {
        name: format(day, 'EEE'), // Mon, Tue, etc.
        volume: dailyVolume
      };
    });
  }, [workouts]);

  const bodyweightData = useMemo(() => {
    return [...bodyweights]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(bw => ({
        date: format(new Date(bw.date + 'T00:00:00'), 'MMM d'),
        weight: bw.weight
      }));
  }, [bodyweights]);

  const totalWorkouts = workouts.length;
  const currentWeekWorkouts = workouts.filter(w => new Date(w.date + 'T00:00:00') >= subDays(startOfDay(new Date()), 7)).length;

  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!w || isNaN(w)) return;
    
    addBodyweight({
      id: crypto.randomUUID(),
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: w
    });
    setWeightInput('');
  };

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Your Stats</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Keep pushing towards your goals.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <Dumbbell className="w-6 h-6 text-[var(--color-brand-500)] mb-2" />
          <span className="text-2xl font-bold text-[var(--color-text-main)]">{totalWorkouts}</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">Total Sessions</span>
        </div>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-green-500 mb-2" />
          <span className="text-2xl font-bold text-[var(--color-text-main)]">{currentWeekWorkouts}</span>
          <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">This Week</span>
        </div>
      </div>

      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm flex-1 flex flex-col min-h-[300px] mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[var(--color-brand-600)]" />
          Volume (Last 7 Days)
        </h3>
        <div className="w-full -ml-4" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-brand-500)', opacity: 0.1 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-card)', 
                  borderColor: 'var(--color-border-subtle)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  color: 'var(--color-text-main)'
                }}
                itemStyle={{ color: 'var(--color-brand-600)', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="volume" 
                name="Volume (kg/lbs)"
                fill="var(--color-brand-500)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bodyweight Section */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-xl p-4 shadow-sm flex-1 flex flex-col min-h-[300px]">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-blue-500" />
          Bodyweight Trend
        </h3>

        <form onSubmit={handleLogWeight} className="flex gap-2 mb-6">
          <input
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="Today's Weight"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-1 transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Log
          </button>
        </form>

        {bodyweights.length > 0 ? (
          <div className="w-full -ml-4" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bodyweightData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-subtle)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
                  dy={10} 
                  minTickGap={20}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-bg-card)', 
                    borderColor: 'var(--color-border-subtle)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    color: 'var(--color-text-main)'
                  }}
                  itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} // blue-500
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'var(--color-bg-card)' }}
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: 'var(--color-bg-card)', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-text-muted)] text-sm italic opacity-70">
            <Scale className="w-8 h-8 mb-2 opacity-30" />
            No weight entries yet
          </div>
        )}
      </div>

    </div>
  );
}
