import { useMemo, useState } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { computeAchievements, RARITY_COLORS, RARITY_GLOW, CATEGORY_COLORS } from '../data/achievements';
import type { AchievementCategory } from '../data/achievements';
import clsx from 'clsx';
import { Trophy, Lock, Flame, Star, CheckCircle2 } from 'lucide-react';

const CATEGORIES: (AchievementCategory | 'All')[] = ['All', 'Consistency', 'Volume', 'Strength', 'Milestone', 'Special'];

function getBarColor(progress: number): string {
  if (progress >= 0.75) return 'from-green-400 to-emerald-500';
  if (progress >= 0.4) return 'from-amber-400 to-orange-500';
  return 'from-[var(--color-brand-500)] to-blue-500';
}

export function Achievements() {
  const { workouts } = useWorkoutState();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'All'>('All');
  const [showAll, setShowAll] = useState(false);

  const achievements = useMemo(() => computeAchievements(workouts), [workouts]);

  // Unlocked badges
  const unlocked = achievements.filter(a => a.unlocked);
  // In-progress (approaching) — sorted by progress descending
  const inProgress = achievements
    .filter(a => !a.unlocked && a.progress > 0)
    .sort((a, b) => b.progress - a.progress);
  // Completely locked (0% progress) — only shown in "show all"
  const locked = achievements.filter(a => !a.unlocked && a.progress === 0);

  const allFiltered = useMemo(() => {
    const pool = showAll ? achievements : [...unlocked, ...inProgress];
    return activeCategory === 'All' ? pool : pool.filter(a => a.category === activeCategory);
  }, [achievements, unlocked, inProgress, activeCategory, showAll]);

  return (
    <div className="w-full h-full flex flex-col pb-8">

      {/* Header */}
      <div className="mb-6 px-1 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-1">
          <Trophy className="w-7 h-7 text-amber-400" />
          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-main)]">Achievements</h2>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {unlocked.length} of {achievements.length} unlocked · {inProgress.length} in progress
        </p>
        <div className="mt-3 h-2 bg-[var(--color-bg-card)] rounded-full overflow-hidden border border-[var(--color-border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
            style={{ width: `${(unlocked.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* In-Progress Spotlight */}
      {inProgress.length > 0 && activeCategory === 'All' && !showAll && (
        <div className="mb-6 animate-scale-spring">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400 animate-subtle-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Approaching ({inProgress.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {inProgress.map((a, i) => (
              <div
                key={a.id}
                className={clsx(
                  'flex flex-col bg-[var(--color-bg-card)] border rounded-2xl p-3 animate-fade-in-up',
                  `stagger-${Math.min(i + 1, 5)}`,
                  a.progress >= 0.75
                    ? 'border-green-500/40 bg-green-500/5'
                    : a.progress >= 0.4
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'border-[var(--color-border-subtle)]'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{a.icon}</span>
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    a.progress >= 0.75 ? 'text-green-400 bg-green-400/10' :
                    a.progress >= 0.4 ? 'text-amber-400 bg-amber-400/10' :
                    'text-[var(--color-brand-500)] bg-[var(--color-brand-500)]/10'
                  )}>
                    {Math.round(a.progress * 100)}%
                  </span>
                </div>
                <p className="font-bold text-xs text-[var(--color-text-main)] leading-tight mb-1">{a.name}</p>
                {a.getHint && (
                  <p className="text-[10px] text-[var(--color-text-muted)] mb-2 leading-tight">
                    {a.getHint(workouts)}
                  </p>
                )}
                <div className="h-1.5 bg-[var(--color-bg-base)] rounded-full overflow-hidden mt-auto">
                  <div
                    className={clsx('h-full bg-gradient-to-r rounded-full transition-all duration-700', getBarColor(a.progress))}
                    style={{ width: `${a.progress * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Trophies */}
      {unlocked.length > 0 && (
        <div className="mb-6 animate-fade-in-up stagger-2">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              Trophies ({unlocked.length})
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(activeCategory === 'All' ? unlocked : unlocked.filter(a => a.category === activeCategory)).map((a, idx) => (
              <div
                key={a.id}
                className={clsx(
                  'relative flex flex-col items-center text-center rounded-2xl p-5 overflow-hidden animate-scale-spring',
                  `stagger-${Math.min(idx + 1, 5)}`,
                  `bg-gradient-to-br ${RARITY_COLORS[a.rarity]}`,
                  RARITY_GLOW[a.rarity],
                )}
              >
                {/* Shimmer highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/20 pointer-events-none rounded-2xl" />

                {/* Rarity chip */}
                <span className="absolute top-2.5 right-2.5 text-[9px] font-bold bg-black/30 text-white/80 rounded-full px-2 py-0.5 uppercase tracking-widest">
                  {a.rarity}
                </span>

                {/* Icon with glow */}
                <div className="relative mb-3 mt-2">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-lg scale-150" />
                  <span className="relative z-10 text-5xl leading-none block">{a.icon}</span>
                </div>

                <h4 className="font-black text-sm text-white leading-tight mb-1 drop-shadow">{a.name}</h4>
                <p className="text-[10px] text-white/60 leading-relaxed mb-3">{a.description}</p>

                <div className="flex items-center gap-1.5 mt-auto">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full text-white/70">
                    {a.category}
                  </span>
                  <CheckCircle2 className="w-3 h-3 text-white/70" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Category Filter (only visible when browsing all) */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar animate-fade-in-up stagger-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95',
              activeCategory === cat
                ? 'bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)]'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border-[var(--color-border-subtle)] hover:border-[var(--color-brand-500)]/50'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Show All / Locked toggle */}
      {locked.length > 0 && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition-colors mb-4 w-fit"
        >
          <Lock className="w-3.5 h-3.5" />
          {showAll ? 'Hide locked badges' : `Show ${locked.length} locked badges`}
        </button>
      )}

      {/* Locked Badge Grid (collapsed by default) */}
      {showAll && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allFiltered.filter(a => !a.unlocked && a.progress === 0).map((a, idx) => (
            <div
              key={a.id}
              className={clsx(
                'relative flex flex-col items-center text-center rounded-2xl p-4 border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] animate-fade-in-up',
                `stagger-${Math.min(idx + 1, 5)}`
              )}
            >
              <Lock className="absolute top-3 left-3 w-3 h-3 text-[var(--color-text-muted)] opacity-40" />
              <div className="text-3xl mb-2 grayscale opacity-30">{a.icon}</div>
              <h4 className="font-bold text-xs text-[var(--color-text-muted)] leading-tight mb-1">{a.name}</h4>
              <p className="text-[10px] text-[var(--color-text-muted)]/60">{a.description}</p>
              <span className={clsx('text-[9px] font-bold uppercase tracking-wider mt-2', CATEGORY_COLORS[a.category])}>{a.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
