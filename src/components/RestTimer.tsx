import { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';
import clsx from 'clsx';

export function RestTimer() {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const addTime = (seconds: number) => {
    setTimeLeft(prev => (prev ? prev + seconds : seconds));
  };

  if (timeLeft === null) {
    return (
      <div className="flex justify-center flex-wrap gap-2 my-4">
        <button onClick={() => addTime(60)} className="px-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-full text-sm font-medium text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors">
          60s Rest
        </button>
        <button onClick={() => addTime(90)} className="px-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-full text-sm font-medium text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors">
          90s
        </button>
        <button onClick={() => addTime(120)} className="px-4 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-full text-sm font-medium text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-brand-500)] hover:text-[var(--color-brand-600)] transition-colors">
          120s
        </button>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isFinished = timeLeft === 0;

  return (
    <div className={clsx(
      "flex items-center justify-between p-4 my-4 rounded-xl shadow-sm transition-all relative overflow-hidden",
      isFinished 
        ? "bg-green-500/10 border-2 border-green-500" 
        : "bg-[var(--color-brand-500)]/10 border-2 border-[var(--color-brand-500)]"
    )}>
      {!isFinished && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-[var(--color-brand-500)] transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / (minutes * 60 + seconds || 1)) * 100}%` }}
        ></div>
      )}

      <div className="flex items-center gap-3 z-10">
        <Timer className={clsx("w-6 h-6", isFinished ? "text-green-600 dark:text-green-400" : "text-[var(--color-brand-600)] animate-pulse")} />
        <span className={clsx("font-bold text-2xl tracking-tight", isFinished ? "text-green-700 dark:text-green-300" : "text-[var(--color-brand-600)]")}>
          {isFinished ? "Ready to Lift!" : `${minutes}:${seconds.toString().padStart(2, '0')}`}
        </span>
      </div>
      
      <div className="flex items-center gap-2 z-10">
        {!isFinished && (
          <button 
            onClick={() => addTime(30)} 
            className="px-3 py-1.5 bg-white dark:bg-black/20 text-[var(--color-brand-600)] rounded-lg font-bold text-xs shadow-sm shadow-[var(--color-brand-500)]/20 active:scale-95 transition-transform"
          >
            +30s
          </button>
        )}

        <button 
          onClick={() => setTimeLeft(null)} 
          className="p-1.5 bg-white dark:bg-black/20 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg shadow-sm active:scale-95 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
