import { useState, useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { EXERCISE_DATABASE } from '../data/exercises';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { TrendingUp, Target, Plus, Trash2, Crosshair, Scale } from 'lucide-react';

export function Stats() {
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
        ex.sets.forEach(set => {
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
        if (muscleGroupCounts[mg] !== undefined) {
          muscleGroupCounts[mg] += ex.sets.length; 
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
        ex.sets.forEach(s => { const sw = Number(s.weight); if (sw > max) max = sw; });
      });
    });
    return max;
  };

  return (
    <div className="w-full h-full flex flex-col pb-8">
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Analytics Hub</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Deep dive into your predictive performance curves and volume distribution.
        </p>
      </div>

      <div className="flex-1 w-full space-y-6">

        {/* --- GOALS WIDGET --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-red-500" /> Macrocyle Targets
            </h3>
            {!isCreatingGoal && (
              <button onClick={() => setIsCreatingGoal(true)} className="text-[var(--color-brand-600)] bg-[var(--color-brand-500)]/10 p-1.5 rounded-lg hover:bg-[var(--color-brand-500)]/20 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {isCreatingGoal && (
            <div className="bg-[var(--color-bg-base)] p-3 rounded-xl border border-[var(--color-border-subtle)] mb-4 space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Exercise</label>
                <select value={newGoalName} onChange={e => setNewGoalName(e.target.value)} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] outline-none">
                  {performedExerciseNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Target WT</label>
                  <input type="number" value={newGoalWeight} onChange={e => setNewGoalWeight(e.target.value)} placeholder="lbs/kg" className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] outline-none w-full" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Deadline</label>
                  <input type="date" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-lg p-2 text-sm text-[var(--color-text-main)] outline-none w-full" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setIsCreatingGoal(false)} className="flex-1 py-2 text-xs font-bold text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] rounded-lg">Cancel</button>
                <button onClick={handleSaveGoal} className="flex-1 py-2 text-xs font-bold text-white bg-[var(--color-brand-500)] rounded-lg">Set Goal</button>
              </div>
            </div>
          )}

          {goals.length === 0 && !isCreatingGoal ? (
            <p className="text-sm text-[var(--color-text-muted)]">No active targets set. Pick a PR to chase!</p>
          ) : (
            <div className="space-y-4">
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
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" /> 1RM Forecaster
            </h3>
            {performedExerciseNames.length > 0 && (
              <select 
                value={forecasterExercise}
                onChange={e => setForecasterExercise(e.target.value)}
                className="bg-[var(--color-bg-base)] text-xs font-bold text-[var(--color-brand-600)] p-1.5 rounded outline-none max-w-[140px] truncate border border-[var(--color-brand-500)]/30"
              >
                {performedExerciseNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">Calculates true 1-Rep Max capability longitudinally using the Brzycki Formula (Weight × 36 / (37 - Reps)).</p>
          
          <div className="h-[200px] w-full">
            {forecasterData.length < 2 ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-[var(--color-text-muted)] text-center px-4 border-2 border-dashed border-[var(--color-border-subtle)] rounded-xl">
                Log {forecasterExercise || 'an exercise'} at least twice with weight and reps to see the Brzycki prediction curve.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecasterData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', color: 'var(--color-text-main)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3b82f6' }}
                    formatter={(value: any) => [`${value} lbs`, 'Predicted 1RM']}
                    labelStyle={{ color: 'var(--color-text-muted)', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="max1RM" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* --- VOLUME RADAR --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm">
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
                  formatter={(value: any) => [`${value} Sets`, 'Volume']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- BODYWEIGHT TREND --- */}
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm">
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
                    formatter={(value: any) => [`${value} lbs`]}
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
                    <span className="font-bold text-[var(--color-text-main)]">{bw.weight} lbs</span>
                    <button onClick={() => deleteBodyweight(bw.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
