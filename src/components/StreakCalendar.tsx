import { useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { format, subDays, startOfDay } from 'date-fns';
import { calculateStreak } from '../lib/streak';
import clsx from 'clsx';

function getIntensityClass(count: number, isRestDay: boolean): string {
  if (isRestDay) return 'bg-blue-500/20 border border-blue-500/30';
  if (count === 0) return 'bg-[var(--color-border-subtle)] opacity-40';
  if (count === 1) return 'bg-[var(--color-brand-500)]/30';
  if (count === 2) return 'bg-[var(--color-brand-500)]/60';
  return 'bg-[var(--color-brand-500)]';
}

export function StreakCalendar() {
  const { workouts, activeProgram, programs } = useWorkoutState();

  const today = startOfDay(new Date());
  const DAYS = 364;

  const streakStats = useMemo(() => 
    calculateStreak(workouts, activeProgram, programs),
  [workouts, activeProgram, programs]);

  // Build a map of date → session count
  const dayMap = useMemo(() => {
    const map: Record<string, number> = {};
    workouts.forEach(w => {
      const key = w.date.slice(0, 10);
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [workouts]);

  // Build 52 weeks × 7 days grid (oldest first)
  const cells = useMemo(() => {
    return Array.from({ length: DAYS }, (_, i) => {
      const date = subDays(today, DAYS - 1 - i);
      const key = format(date, 'yyyy-MM-dd');
      return { 
        date, 
        key, 
        count: dayMap[key] || 0,
        isRestDay: streakStats.restDays.includes(key)
      };
    });
  }, [dayMap, today, streakStats.restDays]);

  const currentStreak = streakStats.currentStreak;
  const longestStreak = streakStats.longestStreak;

  // Group cells into weeks (columns of 7)
  const weeks = useMemo(() => {
    const weekArray: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weekArray.push(cells.slice(i, i + 7));
    }
    return weekArray;
  }, [cells]);

  const MONTH_LABELS = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) {
        labels.push({ label: format(week[0].date, 'MMM'), col });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-5 animate-fade-in-up stagger-3">
      {/* Stats row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-main)]">Training Activity</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Last 52 weeks</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xl font-black text-[var(--color-brand-500)]">{currentStreak}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Current Streak</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-amber-400">{longestStreak}</p>
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Longest</p>
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div className="relative overflow-x-auto">
        <div className="flex gap-[3px] mb-1 pl-0">
          {weeks.map((_, col) => {
            const label = MONTH_LABELS.find(m => m.col === col);
            return (
              <div key={col} className="w-[11px] flex-shrink-0">
                {label && <span className="text-[8px] text-[var(--color-text-muted)]">{label.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, col) => (
            <div key={col} className="flex flex-col gap-[3px]">
              {week.map(cell => (
                <div
                  key={cell.key}
                  title={`${cell.key}: ${cell.isRestDay ? 'Rest Day' : cell.count + ' session' + (cell.count !== 1 ? 's' : '')}`}
                  className={clsx(
                    'w-[11px] h-[11px] rounded-[2px] transition-transform hover:scale-125 cursor-default flex-shrink-0 relative group',
                    getIntensityClass(cell.count, cell.isRestDay)
                  )}
                >
                  {cell.isRestDay && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-1 h-1 rounded-full bg-blue-400/50" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 justify-end">
          <div className="flex items-center gap-1">
            <div className="w-[10px] h-[10px] rounded-[2px] bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <div className="w-0.5 h-0.5 rounded-full bg-blue-400" />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">Rest Day</span>
          </div>
          <div className="h-3 w-px bg-[var(--color-border-subtle)] mx-1" />
          <span className="text-[10px] text-[var(--color-text-muted)]">Less</span>
          {[0, 1, 2, 3].map(n => (
            <div key={n} className={clsx('w-[10px] h-[10px] rounded-[2px]', getIntensityClass(n, false))} />
          ))}
          <span className="text-[10px] text-[var(--color-text-muted)]">More</span>
        </div>
      </div>
    </div>
  );
}
