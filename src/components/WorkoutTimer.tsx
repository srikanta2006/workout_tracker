import { useState, useEffect } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useWorkout } from '../context/WorkoutContext';
import clsx from 'clsx';

export function WorkoutTimer() {
  const { 
    elapsed, isPaused, setIsPaused, setElapsed,
    restTimeLeft, startRestTimer, addRestTime, stopRestTimer 
  } = useWorkout();

  const [hasPinged, setHasPinged] = useState(false);

  // Audio Notification
  const playPing = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // A4
      
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  useEffect(() => {
    if (restTimeLeft === 0 && !hasPinged) {
      playPing();
      setHasPinged(true);
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else if (restTimeLeft !== 0) {
      setHasPinged(false);
    }
  }, [restTimeLeft, hasPinged]);

  // Helpers
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addExtraRest = (seconds: number) => {
    addRestTime(seconds);
  };

  const isResting = restTimeLeft !== null;
  const restFinished = isResting && restTimeLeft === 0;

  return (
    <div className="flex flex-col gap-3 my-4 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-4 shadow-sm relative overflow-hidden">
      
      {/* 1. Global Stopwatch Row */}
      <div className="flex justify-between items-center pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <Clock className={clsx("w-5 h-5", isPaused ? "text-[var(--color-text-muted)]" : "text-[var(--color-brand-500)]")} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] leading-none mb-1">Workout Duration</span>
            <span className={clsx("font-bold text-xl leading-none font-mono tracking-tight", isPaused ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-main)]")}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="p-2 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-text-main)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-brand-500)]/10 hover:text-[var(--color-brand-500)] transition-colors active:scale-95"
            aria-label={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
          <button 
            onClick={() => { setElapsed(0); setIsPaused(true); }} 
            className="p-2 rounded-lg bg-[var(--color-bg-base)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] hover:bg-red-500/10 hover:text-red-500 transition-colors active:scale-95"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Rest Timer Controls */}
      {!isResting && (
        <div className="pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-2">Start Rest Timer</span>
          <div className="flex gap-2">
            <button onClick={() => startRestTimer(60)} className="flex-1 py-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl text-xs font-bold text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors active:scale-95">
              1:00
            </button>
            <button onClick={() => startRestTimer(90)} className="flex-1 py-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl text-xs font-bold text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors active:scale-95">
              1:30
            </button>
            <button onClick={() => startRestTimer(120)} className="flex-1 py-2 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl text-xs font-bold text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors active:scale-95">
              2:00
            </button>
          </div>
        </div>
      )}

      {/* 3. Active Rest Countdown Bar */}
      {isResting && (
        <div className={clsx(
          "flex items-center justify-between p-3 rounded-xl transition-all relative overflow-hidden mt-1 border",
          restFinished 
            ? "bg-green-500/10 border-green-500/30" 
            : "bg-[var(--color-brand-500)]/10 border-[var(--color-brand-500)]/30"
        )}>
          {!restFinished && (
            <div 
              className="absolute bottom-0 left-0 h-1 bg-[var(--color-brand-500)] transition-all duration-1000 ease-linear"
              style={{ width: `${(restTimeLeft / 120) * 100}%` }} // Approximate visual scale based on 2 mins max
            ></div>
          )}

          <div className="flex items-center gap-3 z-10 w-full">
            <Timer className={clsx("w-5 h-5", restFinished ? "text-green-500" : "text-[var(--color-brand-500)] animate-subtle-pulse")} />
            <span className={clsx("font-bold text-lg font-mono tracking-tight", restFinished ? "text-green-600 dark:text-green-400" : "text-[var(--color-brand-600)] animate-subtle-pulse")}>
              {restFinished ? "Ready to Lift!" : formatTime(restTimeLeft)}
            </span>
            
            <div className="flex items-center gap-1 ml-auto">
              {!restFinished && (
                <button 
                  onClick={() => addExtraRest(30)} 
                  className="px-2 py-1 bg-white/50 dark:bg-black/30 text-[var(--color-text-main)] rounded text-xs font-bold border border-[var(--color-border-subtle)] hover:bg-[var(--color-brand-500)] hover:text-white transition-colors active:scale-95"
                >
                  +30s
                </button>
              )}
              <button 
                onClick={stopRestTimer} 
                className="p-1 px-2 bg-white/50 dark:bg-black/30 text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500 border border-[var(--color-border-subtle)] rounded transition-colors active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
