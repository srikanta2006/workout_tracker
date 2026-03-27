import { useState, useMemo, type ReactNode } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell
} from 'recharts';
import { EXERCISE_DATABASE } from '../data/exercises';
import { format, parseISO, subDays, isAfter, eachDayOfInterval, startOfDay, getWeek } from 'date-fns';
import {
  TrendingUp, Target, Plus, Trash2, Crosshair, Scale, BarChart2,
  Medal, Trophy, Flame, Zap, Calendar, Activity, ChevronUp, Star,
  Award, Dumbbell, CheckCircle2
} from 'lucide-react';
import { StreakCalendar } from '../components/StreakCalendar';
import { MuscleHeatmap } from '../components/MuscleHeatmap';
import { calculateStreak } from '../lib/streak';

export default function Stats() {
  const { 
    workouts, 
    bodyweights, 
    addBodyweight, 
    deleteBodyweight, 
    goals, 
    addGoal, 
    deleteGoal,
    activeProgram,
    programs
  } = useWorkoutState();

  // ─── BODYWEIGHT ──────────────────────────────────────────────────────────────
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    addBodyweight({ id: crypto.randomUUID(), date: weightDate, weight: Number(newWeight) });
    setNewWeight('');
  };

  const sortedBodyweights = useMemo(() =>
    [...bodyweights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [bodyweights]
  );

  const weightChartData = useMemo(() =>
    sortedBodyweights.map(bw => ({ date: format(parseISO(bw.date), 'MMM d'), weight: bw.weight })),
    [sortedBodyweights]
  );

  // ─── PERFORMED EXERCISES ─────────────────────────────────────────────────────
  const performedExerciseNames = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => names.add(e.name)));
    return Array.from(names).sort();
  }, [workouts]);

  // ─── HERO STATS ──────────────────────────────────────────────────────────────
  const heroStats = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const thirtyDaysAgo = subDays(new Date(), 30);

    const weekVolume = workouts
      .filter(w => isAfter(parseISO(w.date), sevenDaysAgo))
      .reduce((total, w) =>
        total + w.exercises.reduce((et, e) =>
          et + e.sets.reduce((st, s) => st + (s.completed ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0), 0), 0), 0);

    const monthSessions = workouts.filter(w => isAfter(parseISO(w.date), thirtyDaysAgo)).length;

    // Count total all-time PRs (number of exercises with at least one logged set)
    const totalPRs = performedExerciseNames.length;

    // Current streak using shared utility
    const streakStats = calculateStreak(workouts, activeProgram, programs);
    const streak = streakStats.currentStreak;

    // Total lifetime volume
    const lifetimeVolume = workouts.reduce((total, w) =>
      total + w.exercises.reduce((et, e) =>
        et + e.sets.reduce((st, s) => st + (s.completed ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0), 0), 0), 0);

    return {
      weekVolume: Math.round(weekVolume),
      monthSessions,
      totalPRs,
      streak,
      lifetimeVolume: Math.round(lifetimeVolume),
    };
  }, [workouts, performedExerciseNames]);

  // ─── 1RM FORECASTER ──────────────────────────────────────────────────────────
  const [forecasterExercise, setForecasterExercise] = useState<string>(performedExerciseNames[0] || '');

  const forecasterData = useMemo(() => {
    if (!forecasterExercise) return [];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: { date: string; max1RM: number }[] = [];
    sorted.forEach(w => {
      const exs = w.exercises.filter(e => e.name === forecasterExercise);
      if (!exs.length) return;
      let dailyMax = 0;
      exs.forEach(ex => ex.sets.filter(s => s.completed).forEach(s => {
        const w2 = Number(s.weight), r = Number(s.reps);
        if (r > 0 && r <= 10 && w2 > 0) {
          const rm = w2 * (36 / (37 - r));
          if (rm > dailyMax) dailyMax = rm;
        } else if (r === 1 && w2 > dailyMax) dailyMax = w2;
      }));
      if (dailyMax > 0) points.push({ date: format(parseISO(w.date), 'MMM d'), max1RM: Math.round(dailyMax) });
    });
    return points;
  }, [workouts, forecasterExercise]);

  // ─── VOLUME RADAR ────────────────────────────────────────────────────────────
  const radarData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recent = workouts.filter(w => isAfter(parseISO(w.date), thirtyDaysAgo));
    const counts: Record<string, number> = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0 };
    recent.forEach(w => {
      w.exercises.forEach(ex => {
        let mg = 'Other';
        for (const [group, exercises] of Object.entries(EXERCISE_DATABASE)) {
          if ((exercises as string[]).includes(ex.name)) { mg = group; break; }
        }
        if (mg !== 'Other' && counts[mg] !== undefined) {
          counts[mg] += ex.sets.filter(s => s.completed).length;
        } else if (w.muscleGroups?.length) {
          w.muscleGroups.forEach(t => { if (counts[t] !== undefined) counts[t] += ex.sets.filter(s => s.completed).length; });
        }
      });
    });
    return Object.keys(counts).map(k => ({ subject: k, A: counts[k], fullMark: Math.max(...Object.values(counts), 10) }));
  }, [workouts]);

  // ─── GOALS ───────────────────────────────────────────────────────────────────
  const [newGoalName, setNewGoalName] = useState(performedExerciseNames[0] || '');
  const [newGoalWeight, setNewGoalWeight] = useState('');
  const [newGoalDate, setNewGoalDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);

  const handleSaveGoal = () => {
    if (!newGoalName || !newGoalWeight) return;
    addGoal({ id: crypto.randomUUID(), exerciseName: newGoalName, targetWeight: Number(newGoalWeight), deadlineDate: newGoalDate });
    setIsCreatingGoal(false);
    setNewGoalWeight('');
  };

  const getAllTimePR = (name: string) => {
    let max = 0;
    workouts.forEach(w => w.exercises.filter(e => e.name === name).forEach(ex =>
      ex.sets.filter(s => s.completed).forEach(s => { const sw = Number(s.weight); if (sw > max) max = sw; })
    ));
    return max;
  };

  // ─── VOLUME TREND ────────────────────────────────────────────────────────────
  const volumeTrendData = useMemo(() => {
    const today = startOfDay(new Date());
    const start = subDays(today, 29);
    const days = eachDayOfInterval({ start, end: today });
    const byDay: Record<string, number> = {};
    workouts.forEach(w => {
      const key = w.date.slice(0, 10);
      const vol = w.exercises.reduce((t, e) => t + e.sets.reduce((st, s) => st + (s.completed ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0), 0), 0);
      byDay[key] = (byDay[key] || 0) + Math.round(vol);
    });
    return days.map(d => ({ date: format(d, 'MMM d'), volume: byDay[format(d, 'yyyy-MM-dd')] || 0 }));
  }, [workouts]);

  // ─── PR TIMELINE ─────────────────────────────────────────────────────────────
  const [prExercise, setPrExercise] = useState<string>(performedExerciseNames[0] || '');
  const prTimelineData = useMemo(() => {
    if (!prExercise) return [];
    const out: { date: string; weight: number }[] = [];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let running = 0;
    sorted.forEach(w => {
      const exs = w.exercises.filter(e => e.name === prExercise);
      if (!exs.length) return;
      const maxW = Math.max(0, ...exs.flatMap(e => e.sets.filter(s => s.completed).map(s => Number(s.weight) || 0)));
      if (maxW > running) { running = maxW; out.push({ date: format(parseISO(w.date), 'MMM d'), weight: maxW }); }
    });
    return out;
  }, [workouts, prExercise]);

  // ─── BIG THREE ───────────────────────────────────────────────────────────────
  const bigThreeData = useMemo(() => {
    const keyLifts = ['Barbell Squat', 'Barbell Bench Press', 'Deadlift'];
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const points: { date: string; Squat?: number; Bench?: number; Deadlift?: number; displayDate: string }[] = [];
    let lastSquat = 0, lastBench = 0, lastDeadlift = 0;
    sorted.forEach(w => {
      let foundAny = false;
      const point: any = { date: w.date, displayDate: format(parseISO(w.date), 'MMM d') };
      keyLifts.forEach(liftName => {
        const exs = w.exercises.filter(e => e.name === liftName);
        if (!exs.length) return;
        let dailyMax = 0;
        exs.forEach(ex => ex.sets.filter(s => s.completed).forEach(s => {
          const weight = Number(s.weight) || 0, reps = Number(s.reps) || 0;
          if (reps > 0 && weight > 0) { const rm = weight * (36 / (37 - reps)); if (rm > dailyMax) dailyMax = rm; }
        }));
        if (dailyMax > 0) {
          foundAny = true;
          const r = Math.round(dailyMax);
          if (liftName === 'Barbell Squat') { lastSquat = r; point.Squat = r; }
          if (liftName === 'Barbell Bench Press') { lastBench = r; point.Bench = r; }
          if (liftName === 'Deadlift') { lastDeadlift = r; point.Deadlift = r; }
        }
      });
      if (foundAny) {
        if (!point.Squat && lastSquat > 0) point.Squat = lastSquat;
        if (!point.Bench && lastBench > 0) point.Bench = lastBench;
        if (!point.Deadlift && lastDeadlift > 0) point.Deadlift = lastDeadlift;
        points.push(point);
      }
    });
    return points;
  }, [workouts]);

  // ─── ALL-TIME PRs LEADERBOARD ────────────────────────────────────────────────
  const allTimePRs = useMemo(() => {
    return performedExerciseNames.map(name => {
      let maxWeight = 0;
      let maxDate = '';
      workouts.forEach(w => {
        w.exercises.filter(e => e.name === name).forEach(ex => {
          ex.sets.filter(s => s.completed).forEach(s => {
            const sw = Number(s.weight) || 0;
            if (sw > maxWeight) { maxWeight = sw; maxDate = w.date; }
          });
        });
      });
      return { name, weight: maxWeight, date: maxDate };
    }).filter(pr => pr.weight > 0).sort((a, b) => b.weight - a.weight);
  }, [workouts, performedExerciseNames]);

  // ─── CONSISTENCY SCORE ───────────────────────────────────────────────────────
  const consistencyData = useMemo(() => {
    const weeks: { label: string; hit: number; total: number; pct: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(new Date(), i * 7 + 6);
      const weekEnd = subDays(new Date(), i * 7);
      const days = eachDayOfInterval({ start: startOfDay(weekStart), end: startOfDay(weekEnd) });
      const loggedDays = new Set(workouts.map(w => w.date.slice(0, 10)));
      const hit = days.filter(d => loggedDays.has(format(d, 'yyyy-MM-dd'))).length;
      weeks.push({ label: `W${4 - i}`, hit, total: 7, pct: Math.round((hit / 7) * 100) });
    }
    const overall = Math.round(weeks.reduce((s, w) => s + w.pct, 0) / 4);
    return { weeks, overall };
  }, [workouts]);

  // ─── VOLUME SPLIT (PIE) ──────────────────────────────────────────────────────
  const volumeSplitData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recent = workouts.filter(w => isAfter(parseISO(w.date), thirtyDaysAgo));
    const vol: Record<string, number> = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0 };
    recent.forEach(w => {
      w.exercises.forEach(ex => {
        let mg = 'Other';
        for (const [group, exercises] of Object.entries(EXERCISE_DATABASE)) {
          if ((exercises as string[]).includes(ex.name)) { mg = group; break; }
        }
        const setVol = ex.sets.filter(s => s.completed).reduce((t, s) => t + (Number(s.weight) || 0) * (Number(s.reps) || 0), 0);
        if (mg !== 'Other' && vol[mg] !== undefined) vol[mg] += setVol;
        else if (w.muscleGroups?.length) w.muscleGroups.forEach(t => { if (vol[t] !== undefined) vol[t] += setVol; });
      });
    });
    const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#06b6d4'];
    return Object.entries(vol).filter(([, v]) => v > 0).map(([k, v], i) => ({ name: k, value: Math.round(v), color: PIE_COLORS[i % PIE_COLORS.length] }));
  }, [workouts]);

  // ─── SHARED TOOLTIP STYLE ────────────────────────────────────────────────────
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border-subtle)',
      borderRadius: '12px',
      color: 'var(--color-text-main)',
      fontWeight: '600',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    },
    labelStyle: { color: 'var(--color-text-muted)', marginBottom: '4px' },
  };

  // ─── CARD HEADER COMPONENT (inline) ─────────────────────────────────────────
  const CardHeader = ({
    icon: Icon,
    iconColor,
    iconBg,
    title,
    subtitle,
    right,
  }: {
    icon: any; iconColor: string; iconBg: string; title: string; subtitle?: string; right?: React.ReactNode;
  }) => (
    <div className="flex justify-between items-start mb-5">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-2xl border ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)] leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-tight">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );

  const emptyState = (msg: string, icon: ReactNode) => (
    <div className="h-full w-full flex flex-col items-center justify-center text-center px-6 py-8 border border-dashed border-[var(--color-border-subtle)]/40 rounded-2xl bg-[var(--color-bg-base)]/20">
      <div className="mb-3 opacity-30">{icon}</div>
      <p className="text-sm text-[var(--color-text-muted)] font-medium leading-relaxed">{msg}</p>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col pb-12">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <section className="mb-8 px-1">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-500)] mb-1">Performance</p>
            <h2 className="text-3xl font-black tracking-tight text-[var(--color-text-main)]">Analytics Hub</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5">Your complete performance breakdown — volume, strength, and consistency.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] px-3 py-1.5 rounded-xl">
            <Activity className="w-3.5 h-3.5 text-[var(--color-brand-500)]" />
            {workouts.length} sessions logged
          </div>
        </div>
      </section>

      {/* ── HERO STAT BAR ───────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'This Week',
              value: heroStats.weekVolume.toLocaleString(),
              unit: 'kg',
              icon: Zap,
              color: 'text-[var(--color-brand-500)]',
              bg: 'bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]/20',
              sub: 'total volume moved',
            },
            {
              label: 'Active Streak',
              value: heroStats.streak,
              unit: heroStats.streak === 1 ? 'day' : 'days',
              icon: Flame,
              color: 'text-orange-500',
              bg: 'bg-orange-500/10 border-orange-500/20',
              sub: 'consecutive training',
            },
            {
              label: 'This Month',
              value: heroStats.monthSessions,
              unit: 'sessions',
              icon: Calendar,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10 border-emerald-500/20',
              sub: 'last 30 days',
            },
            {
              label: 'Exercises Tracked',
              value: heroStats.totalPRs,
              unit: 'lifts',
              icon: Award,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10 border-amber-500/20',
              sub: 'with personal records',
            },
          ].map(stat => (
            <div key={stat.label}
              className="glass-card rounded-2xl p-4 shadow-premium hover:shadow-premium-hover transition-all duration-300 group">
              <div className={`inline-flex p-2 rounded-xl border mb-3 ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[var(--color-text-main)]">{stat.value}</span>
                <span className={`text-sm font-bold ${stat.color}`}>{stat.unit}</span>
              </div>
              <div className="mt-1">
                <p className="text-xs font-bold text-[var(--color-text-main)]">{stat.label}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Lifetime volume banner */}
        <div className="mt-3 glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-premium">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-4 h-4 text-[var(--color-brand-500)]" />
            <span className="text-sm font-bold text-[var(--color-text-muted)]">Lifetime Volume Moved</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[var(--color-text-main)]">{heroStats.lifetimeVolume.toLocaleString()}</span>
            <span className="text-sm font-bold text-[var(--color-brand-500)]">kg</span>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <section className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── MACROCYCLE TARGETS ──────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={Crosshair}
            iconColor="text-red-500"
            iconBg="bg-red-500/10 border-red-500/20"
            title="Macrocycle Targets"
            subtitle="Track your PR chase progress"
            right={
              !isCreatingGoal && (
                <button onClick={() => setIsCreatingGoal(true)}
                  className="p-2 rounded-xl text-[var(--color-brand-600)] bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 hover:bg-[var(--color-brand-500)]/20 hover:scale-105 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                </button>
              )
            }
          />

          {isCreatingGoal && (
            <div className="bg-[var(--color-bg-base)]/60 border border-[var(--color-border-subtle)]/30 rounded-2xl p-4 mb-5 space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.15em]">Exercise</label>
                <select value={newGoalName} onChange={e => setNewGoalName(e.target.value)}
                  className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border-subtle)]/40 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors">
                  {performedExerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.15em]">Target (kg)</label>
                  <input type="number" value={newGoalWeight} onChange={e => setNewGoalWeight(e.target.value)} placeholder="e.g. 140"
                    className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border-subtle)]/40 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.15em]">Deadline</label>
                  <input type="date" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)}
                    className="bg-[var(--color-bg-card)]/50 border border-[var(--color-border-subtle)]/40 rounded-xl px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-[var(--color-brand-500)]/60 transition-colors" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setIsCreatingGoal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]/40 rounded-xl hover:bg-[var(--color-bg-base)]/50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleSaveGoal}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-600)] rounded-xl hover:shadow-lg transition-all duration-200 active:scale-95">
                  Set Goal
                </button>
              </div>
            </div>
          )}

          {goals.length === 0 && !isCreatingGoal ? (
            <div className="py-10 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                <Target className="w-7 h-7 text-red-500/50" />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] font-medium">No active targets yet.</p>
              <p className="text-xs text-[var(--color-text-muted)]/60 mt-1">Pick a lift. Set a number. Chase it.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {goals.map(goal => {
                const currentPR = getAllTimePR(goal.exerciseName);
                const pct = Math.min((currentPR / goal.targetWeight) * 100, 100);
                const remaining = goal.targetWeight - currentPR;
                return (
                  <div key={goal.id}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-[var(--color-text-main)] text-sm">{goal.exerciseName}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                          Target <span className="font-bold text-[var(--color-text-main)]">{goal.targetWeight} kg</span> by {format(parseISO(goal.deadlineDate), 'MMM d')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-emerald-500">{currentPR} <span className="text-[10px] font-normal text-[var(--color-text-muted)]">kg now</span></p>
                        <button onClick={() => deleteGoal(goal.id)} className="text-[10px] text-red-500/40 hover:text-red-500 font-bold transition-colors">Remove</button>
                      </div>
                    </div>
                    <div className="h-2.5 w-full bg-[var(--color-bg-base)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]/50">
                      <div className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, var(--color-brand-500), var(--color-brand-600))'
                        }}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-[var(--color-text-muted)]">{Math.round(pct)}% there</span>
                      {remaining > 0 && <span className="text-[10px] text-[var(--color-text-muted)]">{remaining} kg to go</span>}
                      {pct >= 100 && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Crushed it!</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── CONSISTENCY SCORE ───────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={CheckCircle2}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            title="Consistency Score"
            subtitle="4-week training adherence"
          />

          {/* Big score ring */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-bg-base)" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={consistencyData.overall >= 70 ? '#10b981' : consistencyData.overall >= 40 ? 'var(--color-brand-500)' : '#f59e0b'}
                  strokeWidth="8"
                  strokeDasharray={`${(consistencyData.overall / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[var(--color-text-main)]">{consistencyData.overall}%</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--color-text-main)] mb-0.5">
                {consistencyData.overall >= 70 ? 'Elite consistency 🔥' : consistencyData.overall >= 40 ? 'Building momentum' : 'Needs more work'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Based on your last 28 days of training. Aim for 4+ sessions per week for best results.
              </p>
            </div>
          </div>

          {/* Week breakdown */}
          <div className="space-y-2.5">
            {consistencyData.weeks.map((week, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--color-text-muted)] w-6">{week.label}</span>
                <div className="flex-1 h-2 bg-[var(--color-bg-base)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]/30">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${week.pct}%`,
                      background: week.pct >= 70 ? '#10b981' : week.pct >= 40 ? 'var(--color-brand-500)' : '#f59e0b'
                    }} />
                </div>
                <div className="flex items-center gap-1 w-16 justify-end">
                  <span className="text-xs font-bold text-[var(--color-text-main)]">{week.hit}<span className="text-[var(--color-text-muted)] font-normal">/7</span></span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 1RM FORECASTER ──────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={TrendingUp}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10 border-blue-500/20"
            title="1RM Forecaster"
            subtitle="Brzycki formula · estimated peak capability"
            right={
              performedExerciseNames.length > 0 && (
                <select value={forecasterExercise} onChange={e => setForecasterExercise(e.target.value)}
                  className="bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 text-xs font-bold text-[var(--color-brand-500)] px-2.5 py-1.5 rounded-xl outline-none max-w-[140px] truncate">
                  {performedExerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              )
            }
          />
          <div className="h-[220px]">
            {forecasterData.length < 2
              ? emptyState(`Log ${forecasterExercise || 'an exercise'} at least twice with weight + reps to unlock your Brzycki curve.`, <BarChart2 className="w-10 h-10" />)
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecasterData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip {...tooltipStyle} itemStyle={{ color: '#3b82f6' }} />
                    <Area type="monotone" dataKey="max1RM" stroke="#3b82f6" fill="url(#blueGlow)" strokeWidth={0} />
                    <Line type="monotone" dataKey="max1RM" stroke="#3b82f6" strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* ── PR TIMELINE ─────────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={Medal}
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10 border-amber-500/20"
            title="PR Timeline"
            subtitle="All-time personal record breakpoints"
            right={
              performedExerciseNames.length > 0 && (
                <select value={prExercise} onChange={e => setPrExercise(e.target.value)}
                  className="bg-[var(--color-bg-base)]/50 border border-[var(--color-border-subtle)]/30 text-xs font-bold text-[var(--color-brand-500)] px-2.5 py-1.5 rounded-xl outline-none max-w-[140px] truncate">
                  {performedExerciseNames.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              )
            }
          />
          <div className="h-[220px]">
            {prTimelineData.length < 2
              ? emptyState(`Log ${prExercise} in at least 2 sessions to see your PR curve.`, <Medal className="w-10 h-10" />)
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prTimelineData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v) || 0} kg`, 'PR Weight']} itemStyle={{ color: '#f59e0b' }} />
                    <Line type="stepAfter" dataKey="weight" stroke="#f59e0b" strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* ── VOLUME TREND (full width) ────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 lg:col-span-2">
          <CardHeader
            icon={BarChart2}
            iconColor="text-[var(--color-brand-500)]"
            iconBg="bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]/20"
            title="Volume Trend"
            subtitle="Last 30 days · total kg moved per session"
          />
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrendData} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="volAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} interval={6} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${(Number(v) || 0).toLocaleString()} kg`, 'Volume']} />
                <Area type="monotone" dataKey="volume" stroke="var(--color-brand-500)" strokeWidth={2.5} fill="url(#volAreaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── BIG THREE (full width) ───────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 lg:col-span-2">
          <CardHeader
            icon={Trophy}
            iconColor="text-amber-500"
            iconBg="bg-amber-500/10 border-amber-500/20"
            title="The Big Three: 1RM Evolution"
            subtitle="Peak estimated capability over time · Brzycki Formula · carried forward"
            right={
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Squat</span>
                <span className="flex items-center gap-1.5 text-blue-500"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Bench</span>
                <span className="flex items-center gap-1.5 text-orange-500"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Deadlift</span>
              </div>
            }
          />
          <div className="h-[300px]">
            {bigThreeData.length < 1
              ? emptyState('Log at least one set of Squat, Bench Press, or Deadlift to unlock your powerlifting curve.', <Medal className="w-10 h-10" />)
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bigThreeData} margin={{ top: 10, right: 20, left: -18, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.2} />
                    <XAxis dataKey="displayDate" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip {...tooltipStyle} cursor={{ stroke: 'var(--color-brand-500)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line type="monotone" dataKey="Squat" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: 'white' }} />
                    <Line type="monotone" dataKey="Bench" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: 'white' }} />
                    <Line type="monotone" dataKey="Deadlift" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 5, strokeWidth: 2, fill: 'white' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>

        {/* ── PHYSIQUE RADAR ───────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={Target}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10 border-purple-500/20"
            title="Physique Radar"
            subtitle="30-day set volume · spot neglected groups"
          />
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="var(--color-border-subtle)" opacity={0.5} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-main)', fontSize: 11, fontWeight: 700 }} />
                <Radar name="Sets" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.25} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v) || 0} sets`, 'Volume']} itemStyle={{ color: '#a855f7' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── VOLUME SPLIT PIE ─────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={Activity}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-500/10 border-cyan-500/20"
            title="Volume Split"
            subtitle="30-day kg distribution by muscle group"
          />
          {volumeSplitData.length === 0
            ? emptyState('Log workouts with weight and reps to see your volume split.', <Activity className="w-10 h-10" />)
            : (
              <div className="flex items-center gap-4">
                <div className="h-[220px] flex-shrink-0" style={{ width: '160px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={volumeSplitData} cx="50%" cy="50%" innerRadius={52} outerRadius={75}
                        paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {volumeSplitData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip
                        contentStyle={{ ...tooltipStyle.contentStyle }}
                        formatter={(v) => [`${(Number(v) || 0).toLocaleString()} kg`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2.5 min-w-0">
                  {volumeSplitData.map(entry => {
                    const total = volumeSplitData.reduce((s, e) => s + e.value, 0);
                    const pct = Math.round((entry.value / total) * 100);
                    return (
                      <div key={entry.name}>
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-bold text-[var(--color-text-main)] truncate">{entry.name}</span>
                          </div>
                          <span className="text-xs font-black text-[var(--color-text-muted)]">{pct}%</span>
                        </div>
                        <div className="h-1 w-full bg-[var(--color-bg-base)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: entry.color, opacity: 0.8 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

        {/* ── ALL-TIME PRs LEADERBOARD ─────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500 lg:col-span-2">
          <CardHeader
            icon={Star}
            iconColor="text-amber-400"
            iconBg="bg-amber-400/10 border-amber-400/20"
            title="All-Time PRs Leaderboard"
            subtitle="Every lift · best weight ever recorded"
          />
          {allTimePRs.length === 0
            ? emptyState('Log workouts with weight data to build your personal records board.', <Trophy className="w-10 h-10" />)
            : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {allTimePRs.slice(0, 12).map((pr, i) => (
                  <div key={pr.name}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 hover:scale-[1.02] ${i === 0
                        ? 'bg-amber-500/10 border-amber-500/25'
                        : i === 1
                          ? 'bg-[var(--color-text-muted)]/5 border-[var(--color-border-subtle)]/40'
                          : i === 2
                            ? 'bg-orange-500/5 border-orange-500/15'
                            : 'bg-[var(--color-bg-base)]/30 border-[var(--color-border-subtle)]/20'
                      }`}>
                    <span className={`text-xs font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-[var(--color-text-muted)]' : i === 2 ? 'text-orange-500' : 'text-[var(--color-text-muted)]/50'
                      }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--color-text-main)] truncate">{pr.name}</p>
                      {pr.date && <p className="text-[10px] text-[var(--color-text-muted)]">{format(parseISO(pr.date), 'MMM d, yyyy')}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-base font-black text-[var(--color-text-main)]">{pr.weight}</span>
                      <span className="text-[10px] font-bold text-[var(--color-brand-500)] ml-0.5">kg</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* ── BODYWEIGHT TREND ─────────────────────────────────────────────── */}
        <div className="glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <CardHeader
            icon={Scale}
            iconColor="text-emerald-500"
            iconBg="bg-emerald-500/10 border-emerald-500/20"
            title="Bodyweight Trend"
            subtitle="Track your body composition over time"
          />

          <form onSubmit={handleAddWeight} className="flex gap-2 mb-5">
            <input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="Weight (kg)"
              className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] px-3 py-2.5 rounded-xl flex-1 border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-brand-500)] text-sm transition-colors"
              step="0.1" required />
            <input type="date" value={weightDate} onChange={e => setWeightDate(e.target.value)}
              className="bg-[var(--color-bg-base)] text-[var(--color-text-main)] px-2 py-2.5 rounded-xl w-[130px] border border-[var(--color-border-subtle)] focus:outline-none focus:border-[var(--color-brand-500)] text-sm transition-colors"
              required />
            <button type="submit"
              className="bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors active:scale-95">
              Add
            </button>
          </form>

          <div className="h-[180px]">
            {weightChartData.length === 0
              ? emptyState('No bodyweight data logged yet.', <Scale className="w-10 h-10" />)
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} opacity={0.3} />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip {...tooltipStyle} formatter={(v) => [`${Number(v) || 0} kg`]} itemStyle={{ color: '#10b981' }} />
                    <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>

          {sortedBodyweights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]/40 space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {sortedBodyweights.slice().reverse().map(bw => (
                <div key={bw.id} className="flex justify-between items-center text-sm px-2 py-1.5 rounded-xl hover:bg-[var(--color-bg-base)]/50 transition-colors group">
                  <span className="text-[var(--color-text-muted)] text-xs font-medium">{format(parseISO(bw.date), 'MMM d, yyyy')}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[var(--color-text-main)] text-sm">{bw.weight} kg</span>
                    <button onClick={() => deleteBodyweight(bw.id)} className="text-red-500/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MUSCLE HEATMAP ───────────────────────────────────────────────── */}
        <MuscleHeatmap />

        {/* ── STREAK CALENDAR (full width) ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <StreakCalendar />
        </div>

      </section>
    </div>
  );
}