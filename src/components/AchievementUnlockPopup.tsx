import { useEffect, useState, useRef } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { computeAchievements } from '../data/achievements';
import { RARITY_COLORS, RARITY_GLOW } from '../data/achievements';
import type { ComputedAchievement } from '../data/achievements';
import clsx from 'clsx';
import { Trophy, X } from 'lucide-react';

export function AchievementUnlockPopup() {
  const { workouts } = useWorkoutState();
  const [pendingQueue, setPendingQueue] = useState<ComputedAchievement[]>([]);
  const [current, setCurrent] = useState<ComputedAchievement | null>(null);
  const prevUnlockedRef = useRef<Set<string>>(new Set());

  // Initialise ref on first mount without triggering popups
  useEffect(() => {
    const initial = computeAchievements(workouts).filter(a => a.unlocked).map(a => a.id);
    prevUnlockedRef.current = new Set(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for newly unlocked achievements
  useEffect(() => {
    const all = computeAchievements(workouts);
    const nowUnlocked = all.filter(a => a.unlocked);
    const newOnes = nowUnlocked.filter(a => !prevUnlockedRef.current.has(a.id));
    if (newOnes.length > 0) {
      prevUnlockedRef.current = new Set(nowUnlocked.map(a => a.id));
      setPendingQueue(q => [...q, ...newOnes]);
    }
  }, [workouts]);

  // Dequeue one at a time
  useEffect(() => {
    if (!current && pendingQueue.length > 0) {
      setCurrent(pendingQueue[0]);
      setPendingQueue(q => q.slice(1));
    }
  }, [current, pendingQueue]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 5000);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;

  const rarityName = current.rarity;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={() => setCurrent(null)} />

      {/* Card */}
      <div
        className={clsx(
          'relative pointer-events-auto flex flex-col items-center text-center max-w-sm w-[90vw] rounded-3xl p-8 animate-scale-spring',
          'bg-gradient-to-br',
          RARITY_COLORS[rarityName],
          RARITY_GLOW[rarityName],
        )}
      >
        {/* Dismiss */}
        <button
          onClick={() => setCurrent(null)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Sparkle ring */}
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '1s' }} />
          <div className="text-6xl relative z-10 animate-scale-spring">{current.icon}</div>
        </div>

        <div className="flex items-center gap-1 mb-2">
          <Trophy className="w-4 h-4 text-white/80" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/80">Achievement Unlocked!</span>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{current.name}</h3>
        <p className="text-sm text-white/75 mb-4 leading-relaxed">{current.description}</p>

        <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-white/80">
          {rarityName} · {current.category}
        </span>

        {/* Countdown bar */}
        <div className="w-full mt-5 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/60 rounded-full animate-[shrink-width_5s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
