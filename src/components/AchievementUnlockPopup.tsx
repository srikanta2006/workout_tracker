import { useEffect, useState, useRef } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { computeAchievements } from '../data/achievements';
import { RARITY_COLORS, RARITY_GLOW } from '../data/achievements';
import type { ComputedAchievement } from '../data/achievements';
import clsx from 'clsx';
import { Trophy, X } from 'lucide-react';

const STORAGE_KEY = 'maxout_notified_achievements_v1';

export function AchievementUnlockPopup() {
  const { workouts, isLoading, activeProgram, programs } = useWorkoutState();
  const [pendingQueue, setPendingQueue] = useState<ComputedAchievement[]>([]);
  const [current, setCurrent] = useState<ComputedAchievement | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Track which IDs we've already "seen" (either from previous sessions or this session)
  const seenIdsRef = useRef<Set<string>>(new Set());

  // 1. Initial hydration from localStorage and current workout state
  useEffect(() => {
    if (isLoading) return;

    // Load from storage
    const stored = localStorage.getItem(STORAGE_KEY);
    const notifiedIds = stored ? JSON.parse(stored) : [];
    const seenSet = new Set<string>(notifiedIds);

    // Also include what's currently unlocked (to prevent popping up what was already achieved)
    const currentUnlocked = computeAchievements(workouts, activeProgram, programs)
      .filter(a => a.unlocked)
      .map(a => a.id);
    
    currentUnlocked.forEach(id => seenSet.add(id));

    seenIdsRef.current = seenSet;
    
    // Save the combined state back to ensure storage is up to date
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seenSet)));
    
    setHasInitialized(true);
  }, [isLoading, workouts.length]); // Re-run if workouts load or length changes significantly

  // 2. Watch for NEWLY unlocked achievements
  useEffect(() => {
    if (!hasInitialized || isLoading) return;

    const all = computeAchievements(workouts, activeProgram, programs);
    const newlyUnlocked = all.filter(a => a.unlocked && !seenIdsRef.current.has(a.id));

    if (newlyUnlocked.length > 0) {
      // Update our "seen" set immediately to prevent double-queuing
      newlyUnlocked.forEach(a => seenIdsRef.current.add(a.id));
      
      // Update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seenIdsRef.current)));
      
      // Add to queue
      setPendingQueue(q => [...q, ...newlyUnlocked]);
    }
  }, [workouts, hasInitialized, isLoading]);

  // 3. Dequeue mechanic
  useEffect(() => {
    if (!current && pendingQueue.length > 0) {
      setCurrent(pendingQueue[0]);
      setPendingQueue(q => q.slice(1));
    }
  }, [current, pendingQueue]);

  // 4. Auto-dismiss
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => setCurrent(null), 5000);
    return () => clearTimeout(t);
  }, [current]);

  if (!current) return null;

  const rarityName = current.rarity;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none p-4">
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={() => setCurrent(null)} />

      {/* Card */}
      <div
        className={clsx(
          'relative pointer-events-auto flex flex-col items-center text-center max-w-sm w-full rounded-[40px] p-10 animate-scale-spring overflow-hidden',
          'bg-gradient-to-br border border-white/20',
          RARITY_COLORS[rarityName],
          RARITY_GLOW[rarityName],
        )}
      >
        {/* Shimmer/Reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-black/20 pointer-events-none" />

        {/* Dismiss icon */}
        <button
          onClick={() => setCurrent(null)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Main Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl scale-150 animate-pulse" />
          <div className="text-8xl relative z-10 animate-bounce-subtle drop-shadow-2xl">{current.icon}</div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
             <div className="h-px w-8 bg-white/30" />
             <Trophy className="w-5 h-5 text-white/90" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Achievement Unlocked</span>
             <div className="h-px w-8 bg-white/30" />
          </div>
          
          <h3 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase italic drop-shadow-lg">
            {current.name}
          </h3>
          
          <p className="text-base text-white/80 mb-6 font-medium leading-relaxed drop-shadow-sm">
            {current.description}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
              {rarityName} · {current.category}
            </span>
          </div>
        </div>

        {/* Countdown bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
          <div className="h-full bg-white/60 animate-[shrink-width_5s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}
