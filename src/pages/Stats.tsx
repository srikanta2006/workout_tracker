import { useState, useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { EXERCISE_DATABASE } from '../data/exercises';
import { format, parseISO, subDays, isAfter, eachDayOfInterval, startOfDay } from 'date-fns';
import { TrendingUp, Target, Plus, Trash2, Crosshair, Scale, BarChart2, Medal, Trophy } from 'lucide-react';
import { StreakCalendar } from '../components/StreakCalendar';
import { MuscleHeatmap } from '../components/MuscleHeatmap';

export default function Stats() {
  const { workouts, bodyweights, addBodyweight, deleteBodyweight, goals, addGoal, deleteGoal } = useWorkoutState();

  // --- 1. BODYWEIGHT TRACKING (Existing) ---
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    addBodyweight({
      id: crypto.randomUUID(),
      date: weightDate,
      weight: Number(newWeight)
    });
    setNewWeight('');
  };

  const sortedBodyweights = useMemo(() => {
    return [...bodyweights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [bodyweights]);

  const weightChartData = useMemo(() => {
    return sortedBodyweights.map(bw => ({
      date: format(parseISO(bw.date), 'MMM d'),
      weight: bw.weight
    }));
  }, [sortedBodyweights]);

  // --- 3. 1RM FORECASTER LOGIC ---
  // Get all unique exercises the user has actually performed
  const performedExerciseNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => names.add(e.name)));
    return Array.from(names).sort();
  }, [workouts]);

  const [forecasterExercise, setForecasterExercise] = useState<string>(performedExerciseNames[0] || '');

  const forecasterData = useMemo(() => {
    if (!forecasterExercise) return [];
    
    // Group 1RM by date chronologically
    const chronologicalWorkouts = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dataPoints: { date: string; max1RM: number }[] = [];

    chronologicalWorkouts.forEach(w => {
      const exerciseRecords = w.exercises.filter(e => e.name === forecasterExercise);
      if (exerciseRecords.length === 0) return;

      let dailyMax1RM = 0;
      exerciseRecords.forEach(ex => {
        ex.sets.filter(set => set.completed).forEach(set => {
          const w = Number(set.weight);
          const r = Number(set.reps);
          // Brzycki formula is only somewhat accurate for reps <= 10
          if (r > 0 && r <= 10 && w > 0) {
            const calculated1RM = w * (36 / (37 - r));
            if (calculated1RM > dailyMax1RM) {
              dailyMax1RM = calculated1RM;
            }
          } else if (r === 1 && w > dailyMax1RM) {
            dailyMax1RM = w;
          }
        });
      });

      if (dailyMax1RM > 0) {
        dataPoints.push({
          date: format(parseISO(w.date), 'MMM d'),
          max1RM: Math.round(dailyMax1RM)
        });
      }
    });

    return dataPoints;
  }, [workouts, forecasterExercise]);

  // --- 4. VOLUME RADAR LOGIC ---
  const radarData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentWorkouts = workouts.filter(w => isAfter(parseISO(w.date), thirtyDaysAgo));
    
    const muscleGroupCounts: Record<string, number> = {
      'Chest': 0, 'Back': 0, 'Legs': 0, 'Shoulders': 0, 'Arms': 0, 'Core': 0
    };

    recentWorkouts.forEach(w => {
      w.exercises.forEach(ex => {
        let mg = 'Other';
        for (const [group, exercises] of Object.entries(EXERCISE_DATABASE)) {
          if (exercises.includes(ex.name)) {
            mg = group;
            break;
          }
        }
        
        if (mg !== 'Other' && muscleGroupCounts[mg] !== undefined) {
          // Precise mapping found in Dictionary
          muscleGroupCounts[mg] += ex.sets.filter(s => s.completed).length; 
        } else if (w.muscleGroups && w.muscleGroups.length > 0) {
          // Unknown or custom exercise: fall back to the session's macro-tags
          w.muscleGroups.forEach(taggedMg => {
            if (muscleGroupCounts[taggedMg] !== undefined) {
              muscleGroupCounts[taggedMg] += ex.sets.filter(s => s.completed).length;
            }
          });
        }
      });
    });

    return Object.keys(muscleGroupCounts).map(key => ({
      subject: key,
      A: muscleGroupCounts[key],
      fullMark: Math.max(...Object.values(muscleGroupCounts), 10) // dynamically scale radar boundary
    }));
  }, [workouts]);

  // --- 5. GOALS WIDGET LOGIC ---
  const [newGoalName, setNewGoalName] = useState(performedExerciseNames[0] || '');
  const [newGoalWeight, setNewGoalWeight] = useState('');
  const [newGoalDate, setNewGoalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const handleSaveGoal = () => {
    if (!newGoalName || !newGoalWeight) return;
    addGoal({
      id: crypto.randomUUID(),
      exerciseName: newGoalName,
      targetWeight: Number(newGoalWeight),
      deadlineDate: newGoalDate
    });
    setIsCreatingGoal(false);
    setNewGoalWeight('');
  };

  // Helper to find all time PR for a specific exercise
  const getAllTimePR = (exerciseName: string) => {
    let max = 0;
    workouts.forEach(w => {
      w.exercises.filter(e => e.name === exerciseName).forEach(ex => {
        ex.sets.filter(s => s.completed).forEach(s => { const sw = Number(s.weight); if (sw > max) max = sw; });
      });
    });
    return max;
  };

  // --- 6. VOLUME TREND (30-day daily) ---
  const volumeTrendData = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, 29);
    const days = eachDayOfInterval({ start, end: today });
    const byDay: Record<string, number> = {};
    workouts.forEach(w => {
      const key = w.date.slice(0, 10);
      const vol = w.exercises.reduce((t, e) =>
        t + e.sets.reduce((st, s) => st + (s.completed ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0), 0), 0);
      byDay[key] = (byDay[key] || 0) + Math.round(vol);
    });
    return days.map(d => ({
      date: format(d, 'MMM d'),
      volume: byDay[format(d, 'yyyy-MM-dd')] || 0,
    }));
  }, [workouts]);

  // --- 7. PR TIMELINE (per exercise, only new all-time high per session) ---
  const [prExercise, setPrExercise] = useState<string>(() => performedExerciseNames[0] || '');
  const prTimelineData = useMemo(() => {
    if (!prExercise) return [];
    const out: { date: string; weight: number }[] = [];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    sorted.forEach(w => {
      const exs = w.exercises.filter(e => e.name === prExercise);
      if (exs.length === 0) return;
      const maxW = Math.max(0, ...exs.flatMap(e => e.sets.filter(s => s.completed).map(s => Number(s.weight) || 0)));
      if (maxW > running) {
        running = maxW;
        out.push({ date: format(parseISO(w.date), 'MMM d'), weight: maxW });
      }
    });
    return out;
  }, [workouts, prExercise]);
  
  // --- 8. BIG THREE 1RM EVOLUTION ---
  const bigThreeData = useMemo(() => {
    const keyLifts = ['Barbell Squat', 'Barbell Bench Press', 'Deadlift'];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // We need a baseline for all dates where at least one key lift was performed
    const dataPoints: { date: string; Squat?: number; Bench?: number; Deadlift?: number; displayDate: string }[] = [];
    
    // Keep track of the last seen 1RM for each to "carry forward" the line
    let lastSquat = 0;
    let lastBench = 0;
    let lastDeadlift = 0;

    sorted.forEach(w => {
      let foundAny = false;
      const point: any = { 
        date: w.date,
        displayDate: format(parseISO(w.date), 'MMM d')
      };

      keyLifts.forEach(liftName => {
        const exs = w.exercises.filter(e => e.name === liftName);
        if (exs.length > 0) {
          let dailyMax = 0;
          exs.forEach(ex => {
            ex.sets.filter(s => s.completed).forEach(s => {
              const weight = Number(s.weight) || 0;
              const reps = Number(s.reps) || 0;
              if (reps > 0 && weight > 0) {
                const oneRM = weight * (36 / (37 - reps));
                if (oneRM > dailyMax) dailyMax = oneRM;
              }
            });
          });
          
          if (dailyMax > 0) {
            foundAny = true;
            const rounded = Math.round(dailyMax);
            if (liftName === 'Barbell Squat') { lastSquat = rounded; point.Squat = rounded; }
            if (liftName === 'Barbell Bench Press') { lastBench = rounded; point.Bench = rounded; }
            if (liftName === 'Deadlift') { lastDeadlift = rounded; point.Deadlift = rounded; }
          }
        }
      });

      if (foundAny) {
        // Carry forward previous values if not performed today to keep lines continuous
        if (!point.Squat && lastSquat > 0) point.Squat = lastSquat;
        if (!point.Bench && lastBench > 0) point.Bench = lastBench;
        if (!point.Deadlift && lastDeadlift > 0) point.Deadlift = lastDeadlift;
        dataPoints.push(point);
      }
    });

    return dataPoints;
  }, [workouts]);

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <section aria-labelledby="stats-title" className="mb-6 px-1">
        <h2 id="stats-title" className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Analytics Hub</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Deep dive into your predictive performance curves and volume distribution.
        </p>
      </section>
      <section aria-labelledby="stats-charts" className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* --- GOALS WIDGET --- */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 animate-scale-spring">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--color-text-main)]">
              <div className="bg-gradient-to-br from-red-500/20 to-red-500/10 backdrop-blur-sm border border-red-500/20 p-2 rounded-xl">
                <Crosshair className="w-5 h-5 text-red-500" />
              </div>
              Macrocycle Targets
            </h3>
            {!isCreatingGoal && (
              <button onClick={() => setIsCreatingGoal(true)} className="text-[var(--color-brand-600)] bg-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-2 rounded-xl hover:bg-[var(--color-brand-500)]/20 hover:scale-105 transition-all duration-300">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {isCreatingGoal && (
            <div className="bg-gradient-to-br from-[var(--color-bg-base)]/80 to-[var(--color-bg-base)]/60 backdrop-blur-xl border border-[var(--color-border-subtle)]/30 rounded-2xl p-5 mb-6 shadow-inner space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Exercise</label>
                <select value={newGoalName} onChange={e => setNewGoalName(e.target.value)} className="bg-[var(--color-bg-card)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 rounded-xl p-3 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/50 transition-colors">
                  {performedExerciseNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Target Weight</label>
                  <input type="number" value={newGoalWeight} onChange={e => setNewGoalWeight(e.target.value)} placeholder="kg" className="bg-[var(--color-bg-card)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 rounded-xl p-3 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Deadline</label>
                  <input type="date" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} className="bg-[var(--color-bg-card)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 rounded-xl p-3 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/50 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsCreatingGoal(false)} className="flex-1 py-3 text-sm font-bold text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]/30 rounded-xl hover:bg-[var(--color-bg-base)]/50 transition-colors">Cancel</button>
                <button onClick={handleSaveGoal} className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">Set Goal</button>
              </div>
            </div>
          )}

          {goals.length === 0 && !isCreatingGoal ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-[var(--color-text-muted)]/50 mx-auto mb-3" />
              <p className="text-sm text-[var(--color-text-muted)] font-medium">No active targets set. Pick a PR to chase!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map(goal => {
                const currentPR = getAllTimePR(goal.exerciseName);
                const progressPercent = Math.min((currentPR / goal.targetWeight) * 100, 100);
                
                return (
                  <div key={goal.id} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <div>
                        <span className="font-bold text-[var(--color-text-main)] block">{goal.exerciseName}</span>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)]">Target: {goal.targetWeight} by {format(parseISO(goal.deadlineDate), 'MMM d')}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-500 block">{currentPR} <span className="text-xs text-[var(--color-text-muted)] font-normal">Current</span></span>
                        <button onClick={() => deleteGoal(goal.id)} className="text-xs text-red-500/50 hover:text-red-500 uppercase font-bold transition-colors">Drop Goal</button>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-[var(--color-bg-base)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
                      <div 
                        className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 relative animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* --- 1RM FORECASTER --- */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 animate-scale-spring stagger-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--color-text-main)]">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 backdrop-blur-sm border border-blue-500/20 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              1RM Forecaster
            </h3>
            {performedExerciseNames.length > 0 && (
              <select 
                value={forecasterExercise}
                onChange={e => setForecasterExercise(e.target.value)}
                className="bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 text-sm font-bold text-[var(--color-brand-600)] px-3 py-2 rounded-xl outline-none focus:border-[var(--color-brand-500)]/50 transition-colors max-w-[160px] truncate"
              >
                {performedExerciseNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            )}
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium mb-6 leading-relaxed">Calculates true 1-Rep Max capability longitudinally using the Brzycki Formula (Weight × 36 / (37 - Reps)).</p>
          
          <div className="h-[240px] w-full">
            {forecasterData.length < 2 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center px-6 py-8 border-2 border-dashed border-[var(--color-border-subtle)]/30 rounded-2xl bg-[var(--color-bg-base)]/30 backdrop-blur-sm">
                <BarChart2 className="w-12 h-12 text-[var(--color-text-muted)]/50 mb-3" />
                <p className="text-sm text-[var(--color-text-muted)] font-medium">Log {forecasterExercise || 'an exercise'} at least twice with weight and reps to see the Brzycki prediction curve.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecasterData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      border: '1px solid var(--color-border-subtle)', 
                      borderRadius: '12px', 
                      color: 'var(--color-text-main)', 
                      fontWeight: '600',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                    labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '500' }}
                  />
                  <Line type="monotone" dataKey="max1RM" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- VOLUME RADAR --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm animate-scale-spring stagger-2">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-purple-500" /> Physique Radar
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">30-Day Set Volume Distribution to visualize neglected muscle groups.</p>
          
          <div className="h-[250px] w-full bg-[var(--color-bg-base)]/50 rounded-xl relative">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--color-border-subtle)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-main)', fontSize: 10, fontWeight: 'bold' }} />
                <Radar name="Sets" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-main)', fontWeight: 'bold' }}
                  itemStyle={{ color: '#a855f7' }}
                  formatter={(value) => [`${Number(value) || 0} Sets`, 'Volume']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BODYWEIGHT TREND --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm animate-scale-spring stagger-3">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Scale className="w-5 h-5 text-emerald-500" /> Bodyweight Trend
          </h3>
          
          <form onSubmit={handleAddWeight} className="flex gap-2 mb-6">
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Weight"
              className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] px-3 py-2 rounded-lg flex-1 border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-brand-500)]"
              step="0.1"
              required
            />
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] px-2 py-2 rounded-lg w-[130px] border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-brand-500)]"
              required
            />
            <button
              type="submit"
              className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm active:scale-95"
            >
              Add
            </button>
          </form>

          <div className="h-[200px] w-full">
            {weightChartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl">
                No bodyweight data logged yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value) => [`${Number(value) || 0} kg`]}
                    labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {sortedBodyweights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {sortedBodyweights.slice().reverse().map(bw => (
                <div key={bw.id} className="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-[var(--color-bg-base)] transition-colors">
                  <span className="text-[var(--color-text-muted)] font-medium">{format(parseISO(bw.date), 'MMMM d, yyyy')}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[var(--color-text-main)]">{bw.weight} kg</span>
                    <button onClick={() => deleteBodyweight(bw.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- VOLUME TREND --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm animate-fade-in-up stagger-3 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-[var(--color-brand-500)]" />
            <h3 className="text-lg font-bold">Volume Trend</h3>
            <span className="ml-auto text-xs text-[var(--color-text-muted)]">Last 30 days · kg moved per day</span>
          </div>
          <div className="h-[160px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} interval={6} />
                <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px' }}
                  formatter={(v) => [`${(Number(v) || 0).toLocaleString()} kg`, 'Volume']}
                  labelStyle={{ color: 'var(--color-text-muted)' }}
                />
                <Area type="monotone" dataKey="volume" stroke="var(--color-brand-500)" strokeWidth={2} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BIG THREE 1RM EVOLUTION --- */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 animate-scale-spring lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-[var(--color-text-main)]">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 backdrop-blur-sm border border-amber-500/20 p-2 rounded-xl">
                <Trophy className="w-5 h-5 text-amber-500" />
              </div>
              The Big Three: 1RM Evolution
            </h3>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Squat
              </span>
              <span className="flex items-center gap-1.5 text-blue-500">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Bench
              </span>
              <span className="flex items-center gap-1.5 text-orange-500">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div> Deadlift
              </span>
            </div>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium mb-8 leading-relaxed">
            Historical progression of your estimated 1-Rep Max for the core compound lifts. 
            Lines represent your peak estimated capability (Brzycki Formula) carried forward across sessions.
          </p>
          
          <div className="h-[320px] w-full">
            {bigThreeData.length < 1 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center px-6 py-8 border-2 border-dashed border-[var(--color-border-subtle)]/30 rounded-2xl bg-[var(--color-bg-base)]/30 backdrop-blur-sm">
                <Medal className="w-12 h-12 text-[var(--color-text-muted)]/50 mb-3" />
                <p className="text-sm text-[var(--color-text-muted)] font-medium">Log at least one set of Squat, Bench Press, or Deadlift to unlock your Powerlifting progression curve.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bigThreeData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.2} />
                  <XAxis dataKey="displayDate" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-card)', 
                      border: '1px solid var(--color-border-subtle)', 
                      borderRadius: '16px', 
                      color: 'var(--color-text-main)', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      backdropFilter: 'blur(12px)',
                      padding: '16px'
                    }}
                    cursor={{ stroke: 'var(--color-brand-500)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Line type="monotone" dataKey="Squat" name="Squat" stroke="#10b981" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: 'white' }} animationDuration={2000} />
                  <Line type="monotone" dataKey="Bench" name="Bench" stroke="#3b82f6" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: 'white' }} animationDuration={2000} />
                  <Line type="monotone" dataKey="Deadlift" name="Deadlift" stroke="#f59e0b" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 2, fill: 'white' }} animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- PR TIMELINE --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm animate-fade-in-up stagger-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Medal className="w-5 h-5 text-amber-400" /> PR Timeline
            </h3>
            {performedExerciseNames.length > 0 && (
              <select
                value={prExercise}
                onChange={e => setPrExercise(e.target.value)}
                className="bg-[var(--color-bg-base)] text-xs font-bold text-[var(--color-brand-600)] p-1.5 rounded outline-none max-w-[130px] truncate border border-[var(--color-brand-500)]/30"
              >
                {performedExerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">All-time personal record breakpoints per session.</p>
          <div className="h-[180px]">
            {prTimelineData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-sm text-[var(--color-text-muted)] border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl text-center px-4">
                Log {prExercise} in at least 2 sessions to see your PR curve.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={prTimelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px' }}
                    formatter={(v) => [`${Number(v) || 0} kg`, 'PR Weight']}
                    labelStyle={{ color: 'var(--color-text-muted)' }}
                  />
                  <Line type="stepAfter" dataKey="weight" stroke="#f59e0b" strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5, strokeDasharray: '' }}
                    activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- MUSCLE HEATMAP --- */}
        <MuscleHeatmap />

        {/* --- STREAK CALENDAR --- */}
        <div className="lg:col-span-2">
          <StreakCalendar />
        </div>

      </section>
    </div>
  );
}
