import { useState, useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { WorkoutCard } from '../components/WorkoutCard';
import { RecoveryWidget } from '../components/RecoveryWidget';
import { Dumbbell, Calendar, Play, Moon, Trophy, Zap, ChevronRight, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { differenceInDays, startOfDay } from 'date-fns';
import clsx from 'clsx';
import { computeAchievements } from '../data/achievements';
import { ShareCard } from '../components/ShareCard';

export function Dashboard() {
  const { workouts, deleteWorkout, activeProgram, programs, routines } = useWorkoutState();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [shareWorkoutId, setShareWorkoutId] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- XP / Gamification Logic ---
  const lifetimeVolume = useMemo(() =>
    workouts.reduce((t, s) =>
      t + s.exercises.reduce((et, e) =>
        et + e.sets.reduce((st, set) => st + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0), 0),
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
    const all = computeAchievements(workouts);
    return all.filter(a => !a.unlocked && a.progress > 0).sort((a, b) => b.progress - a.progress)[0] || null;
  }, [workouts]);


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

      {/* --- GAMIFICATION STRIP --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* XP / Level bar */}
        <div className="animate-scale-spring bg-gradient-to-br from-[var(--color-brand-500)]/20 to-[var(--color-bg-card)] border border-[var(--color-brand-500)]/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[var(--color-brand-500)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-500)]">Strength Level</span>
            </div>
            <span className="text-xs font-bold text-[var(--color-text-muted)]">{Math.round(lifetimeVolume).toLocaleString()} kg total</span>
          </div>
          <div className="flex items-end gap-3 mb-2">
            <span className="text-4xl font-black text-[var(--color-text-main)]">{level}</span>
            <span className="text-sm font-bold text-[var(--color-text-muted)] pb-1">{displayRank}</span>
          </div>
          <div className="h-2 bg-[var(--color-bg-base)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-brand-500)] to-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{Math.round(XP_PER_LEVEL - xpIntoLevel).toLocaleString()} kg to Level {level + 1}</p>
        </div>

        {/* Next Achievement Teaser */}
        {approachingAchievement ? (
          <Link to="/achievements" className="animate-scale-spring stagger-1 bg-[var(--color-bg-card)] border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-400/60 transition-all group">
            <span className="text-4xl">{approachingAchievement.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Next Trophy</span>
              </div>
              <p className="font-bold text-sm text-[var(--color-text-main)] truncate">{approachingAchievement.name}</p>
              <div className="h-1.5 bg-[var(--color-bg-base)] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                  style={{ width: `${approachingAchievement.progress * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{Math.round(approachingAchievement.progress * 100)}% complete</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-amber-400 transition-colors flex-shrink-0" />
          </Link>
        ) : (
          <Link to="/achievements" className="animate-scale-spring stagger-1 bg-[var(--color-bg-card)] border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 hover:border-amber-400/60 transition-all">
            <Trophy className="w-10 h-10 text-amber-400" />
            <div>
              <p className="font-bold text-[var(--color-text-main)]">View Trophies</p>
              <p className="text-sm text-[var(--color-text-muted)]">Check all your earned achievements.</p>
            </div>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-stretch">
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
      </div>

      {/* --- BOTTOM ROW: HISTORY GRID --- */}
      <div>
        <div className="mb-4 flex flex-col items-start w-full">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Recent Workouts</h2>
          <p className="text-sm font-medium text-[var(--color-text-muted)] mt-1">
            {workouts.length} lifetime {workouts.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {workouts.map((workout, index) => (
            <div 
              key={workout.id} 
              className={clsx("animate-fade-in-up", `stagger-${Math.min(index + 2, 5)}`)}
            >
              <WorkoutCard
                workout={workout}
                onClick={() => setSelectedWorkoutId(selectedWorkoutId === workout.id ? null : workout.id)}
              />
              {selectedWorkoutId === workout.id && (
                <div className="bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border-subtle)] mb-4 -mt-2 shadow-inner">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-[var(--color-text-main)]">Workout Details</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShareWorkoutId(workout.id)}
                        className="text-[var(--color-brand-500)] hover:text-white text-sm font-medium px-3 py-1 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)] transition-colors flex items-center gap-1"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <Link
                        to={`/workout/${workout.id}`}
                        className="text-[var(--color-brand-500)] hover:text-white text-sm font-medium px-3 py-1 rounded-lg border border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)] hover:bg-[var(--color-brand-500)] transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteWorkout(workout.id)}
                        className="text-red-500 hover:text-white text-sm font-medium px-3 py-1 rounded-lg border border-[var(--color-border-subtle)] hover:border-red-500 hover:bg-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {workout.exercises.map((ex, idx) => (
                    <div key={ex.id} className="mb-4 last:mb-0">
                      <p className="font-medium text-sm text-[var(--color-text-main)] mb-2">{idx + 1}. {ex.name}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-[var(--color-text-muted)] mb-1 px-2 border-b border-[var(--color-border-subtle)] pb-1">
                        <span>Set</span>
                        <span className="text-center">kg</span>
                        <span className="text-right">Reps</span>
                      </div>
                      {ex.sets.map(set => (
                        <div key={set.id} className="grid grid-cols-3 gap-2 text-sm px-2 py-1 bg-[--color-bg-base] rounded mb-1 text-[var(--color-text-main)]">
                          <span className="text-[var(--color-text-muted)]">{set.setNumber}</span>
                          <span className="font-medium text-center">{set.weight || '-'}</span>
                          <span className="font-medium text-right">{set.reps || '-'}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Share Card Modal */}
      {shareWorkoutId && (() => {
        const w = workouts.find(x => x.id === shareWorkoutId);
        return w ? <ShareCard workout={w} onClose={() => setShareWorkoutId(null)} /> : null;
      })()}
    </div>
  );
}
