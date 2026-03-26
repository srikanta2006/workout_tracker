import { useState, useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { RecoveryWidget } from '../components/RecoveryWidget';
import { Dumbbell, Calendar, Play, Moon, Trophy, Zap, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { differenceInDays, startOfDay, format, parseISO } from 'date-fns';
import clsx from 'clsx';
import { computeAchievements } from '../data/achievements';
import { StoryCard } from '../components/StoryCard';

export default function Dashboard() {
  const { workouts, deleteWorkout, activeProgram, programs, routines } = useWorkoutState();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [storyWorkoutId, setStoryWorkoutId] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- XP / Gamification Logic ---
  const lifetimeVolume = useMemo(() =>
    workouts.reduce((t, s) =>
      t + s.exercises.reduce((et, e) =>
        et + e.sets.reduce((st, set) => st + (set.completed ? (Number(set.weight) || 0) * (Number(set.reps) || 0) : 0), 0), 0), 0),
    [workouts]
  );
  const XP_PER_LEVEL = 5000;
  const level = Math.floor(lifetimeVolume / XP_PER_LEVEL) + 1;
  const xpIntoLevel = lifetimeVolume % XP_PER_LEVEL;
  const xpPercent = (xpIntoLevel / XP_PER_LEVEL) * 100;
  const RANK_NAMES: Record<number, string> = {
    1: 'Raw Recruit', 5: 'Iron Novice', 10: 'Steel Apprentice', 15: 'Bronze Warrior',
    20: 'Silver Challenger', 30: 'Gold Contender', 50: 'Platinum Elite', 75: 'Diamond Legend', 100: 'Obsidian God'
  };
  const rankName = Object.keys(RANK_NAMES)
    .map(Number).sort((a, b) => b - a)
    .find(l => level >= l);
  const displayRank = rankName ? RANK_NAMES[rankName] : 'Raw Recruit';

  // Approaching achievement
  const approachingAchievement = useMemo(() => {
    const all = computeAchievements(workouts, activeProgram, programs);
    return all.filter(a => !a.unlocked && a.progress > 0).sort((a, b) => b.progress - a.progress)[0] || null;
  }, [workouts, activeProgram, programs]);


  // Active Program Logic
  const activeProg = activeProgram ? programs.find(p => p.id === activeProgram.programId) : null;
  let currentDaySchedule: { dayNumber: number; routineId: string | null } | undefined;
  let daysPassed = 0;
  let currentCycleDay = 0;
  let routineToPerform: { id: string; name: string } | undefined;

  if (activeProg && activeProgram) {
    const today = startOfDay(new Date());
    const start = startOfDay(new Date(activeProgram.startDate));
    daysPassed = Math.max(0, differenceInDays(today, start));
    currentCycleDay = (daysPassed % activeProg.lengthInDays) + 1;
    
    currentDaySchedule = activeProg.schedule.find(s => s.dayNumber === currentCycleDay);
    if (currentDaySchedule && currentDaySchedule.routineId) {
      routineToPerform = routines.find(r => r.id === currentDaySchedule!.routineId);
    }
  }

  if (workouts.length === 0 && !activeProg) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full mt-20 text-center px-4 w-full">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] p-8 rounded-3xl shadow-sm mb-6 text-center max-w-md w-full">
          <Dumbbell className="w-16 h-16 text-[var(--color-brand-500)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold tracking-tight mb-2 text-[var(--color-text-main)]">No Workouts Yet</h2>
          <p className="text-[var(--color-text-muted)] mb-8 font-medium">Time to hit the gym. Start your first session now!</p>
          <Link
            to="/routines"
            className="w-full bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-600)] text-white px-8 py-3 rounded-xl font-bold inline-block shadow-sm active:scale-95 transition-all"
          >
            Start a Workout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-8 pb-8">

      <section aria-labelledby="dashboard-gamification" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <h2 id="dashboard-gamification" className="sr-only">Gamification Overview</h2>

        {/* --- GAMIFICATION STRIP --- */}

        {/* XP / Level bar */}
        <div className="lg:col-span-2 animate-scale-spring glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-[var(--color-brand-500)]" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-brand-500)]">Strength Level</span>
            </div>
            <span className="text-sm font-bold text-[var(--color-text-muted)]">{Math.round(lifetimeVolume).toLocaleString()} kg total</span>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <span className="text-5xl font-black text-[var(--color-text-main)] bg-gradient-to-br from-[var(--color-brand-500)] to-blue-500 bg-clip-text text-transparent">
              {level}
            </span>
            <span className="text-lg font-bold text-[var(--color-text-muted)] pb-2">{displayRank}</span>
          </div>
          <div className="h-3 bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-brand-500)] via-[var(--color-brand-500)] to-blue-400 rounded-full transition-all duration-1000 ease-out shadow-sm"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs font-bold text-[var(--color-text-muted)] mt-3">{Math.round(XP_PER_LEVEL - xpIntoLevel).toLocaleString()} kg to Level {level + 1}</p>
        </div>

        {/* Next Achievement Teaser */}
        {approachingAchievement ? (
          <Link to="/achievements" className="group animate-scale-spring glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover hover:border-amber-400/50 transition-all duration-500 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{approachingAchievement.icon}</span>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Next Trophy</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-[var(--color-text-main)] mb-2 group-hover:text-amber-400 transition-colors duration-300">{approachingAchievement.name}</p>
              <div className="h-2 bg-[var(--color-bg-base)]/50 backdrop-blur-sm border border-[var(--color-border-subtle)]/30 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${approachingAchievement.progress * 100}%` }}
                />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] font-medium">{Math.round(approachingAchievement.progress * 100)}% complete</p>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-subtle)]/30">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">View All</span>
              <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </Link>
        ) : (
          <Link to="/achievements" className="group animate-scale-spring glass-card rounded-3xl p-6 shadow-premium hover:shadow-premium-hover hover:border-amber-400/50 transition-all duration-500 flex flex-col justify-center items-center text-center">
            <Trophy className="w-12 h-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <p className="font-bold text-xl text-[var(--color-text-main)] mb-2 group-hover:text-amber-400 transition-colors duration-300">View Trophies</p>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">Check all your earned achievements.</p>
          </Link>
        )}
      </section>

      <section aria-labelledby="dashboard-routine-status" className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
        <h2 id="dashboard-routine-status" className="sr-only">Routine and Recovery status</h2>
        {activeProg && (
          <div className="animate-scale-spring bg-gradient-to-br from-[var(--color-bg-card)] to-[#1a1a1c] rounded-3xl p-6 shadow-sm border border-[var(--color-border-subtle)] flex flex-col justify-between relative overflow-hidden h-full">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 transform rotate-12 pointer-events-none">
              <Calendar className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10 w-full mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-[var(--color-brand-500)]/10 text-[var(--color-brand-500)] text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Active Routine</span>
                <span className="text-sm font-semibold text-[var(--color-text-muted)]">{activeProg.name}</span>
              </div>
              
              <h3 className="text-3xl font-bold text-[var(--color-text-main)] tracking-tight">
                Day {currentCycleDay} <span className="text-[var(--color-text-muted)] text-xl font-medium">/ {activeProg.lengthInDays}</span>
              </h3>
            </div>

            <div className="relative z-10 w-full mt-auto">
              {routineToPerform ? (
                <div className="bg-[var(--color-bg-base)] rounded-2xl p-4 border border-[var(--color-border-subtle)] flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-500)]">Workout Today</p>
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-lg leading-tight line-clamp-1 break-all flex-1">{routineToPerform.name}</span>
                    <button 
                      onClick={() => navigate(`/session`)}
                      className="bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <Play className="w-4 h-4 fill-current" /> GO
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--color-bg-base)] rounded-2xl p-4 border border-[var(--color-border-subtle)] flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg flex items-center gap-2"><Moon className="w-5 h-5 text-[var(--color-text-muted)]" /> Rest Day</p>
                    <p className="text-xs font-medium text-[var(--color-text-muted)] mt-1 uppercase tracking-wider">Recover and rebuild.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-full w-full animate-scale-spring stagger-1">
          <RecoveryWidget />
        </div>
      </section>

      {/* --- BOTTOM ROW: RECENT WORKOUTS LIST --- */}
      <div className="animate-scale-spring">
        <div className="mb-6 flex flex-col items-start w-full">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-main)] bg-gradient-to-r from-[var(--color-text-main)] to-[var(--color-text-muted)] bg-clip-text text-transparent">
            Recent Workouts
          </h2>
          <p className="text-sm font-medium text-[var(--color-text-muted)] mt-2">
            {workouts.length} lifetime {workouts.length === 1 ? 'session' : 'sessions'} • Keep pushing forward
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 shadow-premium">
          <div className="space-y-3">
            {workouts.slice(0, 10).map((workout, index) => {
              const totalVolume = workout.exercises.reduce((acc, ex) => {
                const exVolume = ex.sets.reduce((setAcc, set) => setAcc + (set.completed ? ((Number(set.reps) || 0) * (Number(set.weight) || 0)) : 0), 0);
                return acc + exVolume;
              }, 0);

              return (
                <div
                  key={workout.id}
                  className={clsx(
                    "group flex items-center justify-between p-4 rounded-2xl border border-[var(--color-border-subtle)]/30 hover:border-[var(--color-brand-500)]/30 bg-[var(--color-bg-base)]/30 hover:bg-[var(--color-bg-base)]/50 transition-all duration-300 cursor-pointer animate-fade-in-up",
                    `stagger-${Math.min(index + 2, 5)}`
                  )}
                  onClick={() => setSelectedWorkoutId(selectedWorkoutId === workout.id ? null : workout.id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-brand-500)]/10 backdrop-blur-sm border border-[var(--color-brand-500)]/20 rounded-xl flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-[var(--color-brand-500)]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-brand-500)] transition-colors duration-300 truncate">
                          {workout.muscleGroups?.join(', ')} Day
                        </h3>
                        <span className="text-xs text-[var(--color-text-muted)] font-medium whitespace-nowrap">
                          {format(parseISO(workout.date), 'MMM d')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[var(--color-text-main)]">{workout.exercises.length}</span>
                          exercises
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-[var(--color-text-main)]">{totalVolume.toLocaleString()}</span>
                          kg volume
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStoryWorkoutId(workout.id);
                      }}
                      className="p-2 text-[var(--color-text-muted)] hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-500/10"
                      title="Share to Story"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/workout/${workout.id}`}
                      className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand-500)] transition-colors rounded-lg hover:bg-[var(--color-brand-500)]/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {workouts.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="w-16 h-16 text-[var(--color-text-muted)]/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-[var(--color-text-muted)]">No workouts yet</p>
              <p className="text-sm text-[var(--color-text-muted)]/70 mt-1">Start your fitness journey today!</p>
            </div>
          )}
        </div>

        {/* Expanded workout details */}
        {selectedWorkoutId && (() => {
          const workout = workouts.find(w => w.id === selectedWorkoutId);
          if (!workout) return null;

          return (
            <div className="glass-card rounded-3xl p-6 shadow-premium mt-4 animate-scale-spring">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-main)]">
                    {workout.muscleGroups?.join(', ')} Day Details
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {format(parseISO(workout.date), 'EEEE, MMMM do, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                    <button
                      onClick={() => setStoryWorkoutId(workout.id)}
                      className="text-orange-500 hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] hover:border-orange-500 hover:bg-orange-500 transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> Story
                    </button>
                  <Link
                    to={`/workout/${workout.id}`}
                    className="text-[var(--color-brand-500)] hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)] transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteWorkout(workout.id)}
                    className="text-red-500 hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] hover:border-red-500 hover:bg-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {workout.exercises.map((ex, idx) => (
                  <div key={ex.id} className="bg-[var(--color-bg-base)]/50 rounded-2xl p-4 border border-[var(--color-border-subtle)]/30">
                    <p className="font-semibold text-[var(--color-text-main)] mb-3">{idx + 1}. {ex.name}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs text-[var(--color-text-muted)] mb-2 px-2">
                      <span>Set</span>
                      <span>kg</span>
                      <span>Reps</span>
                      <span className="text-right">Volume</span>
                    </div>
                    {ex.sets.map(set => {
                      const setVolume = set.completed ? (Number(set.weight) || 0) * (Number(set.reps) || 0) : 0;
                      return (
                        <div key={set.id} className={clsx("grid grid-cols-4 gap-2 text-sm px-2 py-2 bg-[var(--color-bg-base)] rounded-lg mb-1 text-[var(--color-text-main)]", !set.completed && "opacity-40")}>
                          <span className="text-[var(--color-text-muted)]">{set.setNumber}</span>
                          <span className="font-medium">{set.weight || '-'}</span>
                          <span className="font-medium">{set.reps || '-'}</span>
                          <span className="font-medium text-right text-[var(--color-brand-500)]">{setVolume || '-'}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Story Card Modal */}
      {storyWorkoutId && (() => {
        const w = workouts.find(x => x.id === storyWorkoutId);
        return w ? <StoryCard workout={w} onClose={() => setStoryWorkoutId(null)} /> : null;
      })()}
    </div>
  );
}
