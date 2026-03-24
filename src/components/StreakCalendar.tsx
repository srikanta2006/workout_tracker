import { useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { format, subDays, startOfDay } from 'date-fns';
import clsx from 'clsx';

function getIntensityClass(count: number): string {
  if (count === 0) return 'bg-[var(--color-border-subtle)] opacity-40';
  if (count === 1) return 'bg-[var(--color-brand-500)]/30';
  if (count === 2) return 'bg-[var(--color-brand-500)]/60';
  return 'bg-[var(--color-brand-500)]';
}

export function StreakCalendar() {
  const { workouts } = useWorkoutState();

  const today = startOfDay(new Date());
  const DAYS = 364;

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
      return { date, key, count: dayMap[key] || 0 };
    });
  }, [dayMap, today]);

  // Current streak
  const currentStreak = useMemo(() => {
    let streak = 0;
    let cursor = today;
    while (true) {
      const key = format(cursor, 'yyyy-MM-dd');
      if (!dayMap[key]) break;
      streak++;
      cursor = subDays(cursor, 1);
    }
    return streak;
  }, [dayMap, today]);

  // Longest streak
  const longestStreak = useMemo(() => {
    const sorted = [...workouts].map(w => w.date.slice(0, 10)).sort();
    const unique = [...new Set(sorted)];
    let longest = 0, current = 0;
    for (let i = 0; i < unique.length; i++) {
      if (i === 0) { current = 1; }
      else {
        const diff = (new Date(unique[i]).getTime() - new Date(unique[i - 1]).getTime()) / 86400000;
        current = diff === 1 ? current + 1 : 1;
      }
      longest = Math.max(longest, current);
    }
    return longest;
  }, [workouts]);

  // Group cells into weeks (columns of 7)
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

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
                  title={`${cell.key}: ${cell.count} session${cell.count !== 1 ? 's' : ''}`}
                  className={clsx(
                    'w-[11px] h-[11px] rounded-[2px] transition-transform hover:scale-125 cursor-default flex-shrink-0',
                    getIntensityClass(cell.count)
                  )}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-[var(--color-text-muted)]">Less</span>
          {[0, 1, 2, 3].map(n => (
            <div key={n} className={clsx('w-[10px] h-[10px] rounded-[2px]', getIntensityClass(n))} />
          ))}
          <span className="text-[10px] text-[var(--color-text-muted)]">More</span>
        </div>
      </div>
    </div>
  );
}
