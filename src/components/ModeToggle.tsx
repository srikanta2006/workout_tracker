import { useAppMode } from '../context/AppModeContext';
import { Dumbbell, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

export function ModeToggle() {
  const { setMode, isWorkMode, isEatMode } = useAppMode();
  const navigate = useNavigate();

  return (
    <div className="flex items-center p-1 bg-[var(--color-bg-base)]/40 backdrop-blur-md rounded-2xl border border-[var(--color-border-subtle)]/30 w-full max-w-[240px] relative overflow-hidden shadow-inner">
      {/* Background Pill - Moving highlight */}
      <div 
        className={clsx(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-premium",
          isWorkMode ? "left-1 bg-gradient-to-r from-[var(--color-brand-500)] to-blue-500" : "left-[calc(50%+1px)] bg-gradient-to-r from-emerald-500 to-teal-500"
        )}
      />

      <button
        onClick={() => {
          setMode('work');
          navigate('/');
        }}
        className={clsx(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black tracking-widest transition-colors duration-500",
          isWorkMode ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
        )}
      >
        <Dumbbell className={clsx("w-3.5 h-3.5", isWorkMode ? "animate-pulse" : "")} />
        WORK
      </button>

      <button
        onClick={() => {
          setMode('eat');
          navigate('/diet');
        }}
        className={clsx(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black tracking-widest transition-colors duration-500",
          isEatMode ? "text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
        )}
      >
        <UtensilsCrossed className={clsx("w-3.5 h-3.5", isEatMode ? "animate-bounce-subtle" : "")} />
        EAT
      </button>
    </div>
  );
}
