import { useMemo } from 'react';
import { useWorkoutState } from '../hooks/useWorkoutState';
import { subDays, startOfDay, format } from 'date-fns';


type MuscleZone = {
  id: string;
  label: string;
  muscleGroup: string;
  color: string;
  // SVG path for front-body polygon
  d: string;
};

const ZONES: MuscleZone[] = [
  {
    id: 'chest',
    label: 'Chest',
    muscleGroup: 'Chest',
    color: '#3b82f6',
    d: 'M68,52 L84,52 L88,72 L64,72 Z',
  },
  {
    id: 'shoulders',
    label: 'Shoulders',
    muscleGroup: 'Shoulders',
    color: '#8b5cf6',
    d: 'M56,44 L68,52 L66,62 L56,60 Z M84,52 L96,44 L96,60 L86,62 Z',
  },
  {
    id: 'arms',
    label: 'Arms',
    muscleGroup: 'Arms',
    color: '#f59e0b',
    d: 'M48,60 L56,60 L58,90 L50,90 Z M94,60 L102,60 L102,90 L94,90 Z',
  },
  {
    id: 'core',
    label: 'Core',
    muscleGroup: 'Core',
    color: '#10b981',
    d: 'M64,72 L88,72 L88,100 L64,100 Z',
  },
  {
    id: 'back',
    label: 'Back',
    muscleGroup: 'Back',
    color: '#ef4444',
    d: 'M64,100 L88,100 L90,116 L62,116 Z',
  },
  {
    id: 'legs',
    label: 'Legs',
    muscleGroup: 'Legs',
    color: '#06b6d4',
    d: 'M62,116 L76,116 L74,160 L62,160 Z M76,116 L90,116 L90,160 L78,160 Z',
  },
];

export function MuscleHeatmap() {
  const { workouts } = useWorkoutState();

  const today = startOfDay(new Date());

  // Volume per muscle group in the last 7 days
  const weeklyMuscleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    workouts.forEach(w => {
      const d = startOfDay(new Date(w.date));
      const diffDays = (today.getTime() - d.getTime()) / 86400000;
      if (diffDays >= 0 && diffDays < 7) {
        w.muscleGroups.forEach(mg => {
          counts[mg] = (counts[mg] || 0) + 1;
        });
      }
    });
    return counts;
  }, [workouts, today]);

  const getOpacity = (muscleGroup: string) => {
    const count = weeklyMuscleCount[muscleGroup] || 0;
    if (count === 0) return 0.08;
    if (count === 1) return 0.35;
    if (count === 2) return 0.6;
    return 1;
  };

  const weekLabel = `${format(subDays(today, 6), 'MMM d')} – ${format(today, 'MMM d')}`;

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] rounded-2xl p-5 animate-fade-in-up stagger-2">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-main)]">Muscle Activity Map</h3>
          <p className="text-xs text-[var(--color-text-muted)]">{weekLabel}</p>
        </div>
        <div className="flex flex-col gap-1 text-right">
          {ZONES.map(z => {
            const count = weeklyMuscleCount[z.muscleGroup] || 0;
            if (count === 0) return null;
            return (
              <span key={z.id} className="text-[10px] font-bold" style={{ color: z.color }}>
                {z.label} ×{count}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center">
        <svg viewBox="40 28 72 148" className="w-32 h-auto" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <ellipse cx="76" cy="36" rx="9" ry="10" fill="var(--color-border-subtle)" opacity="0.5" />
          {/* Torso outline */}
          <rect x="60" y="46" width="32" height="76" rx="6" fill="var(--color-border-subtle)" opacity="0.12" />
          {/* Legs outline */}
          <rect x="60" y="118" width="14" height="48" rx="4" fill="var(--color-border-subtle)" opacity="0.12" />
          <rect x="78" y="118" width="14" height="48" rx="4" fill="var(--color-border-subtle)" opacity="0.12" />
          {/* Arms outline */}
          <rect x="44" y="58" width="14" height="36" rx="4" fill="var(--color-border-subtle)" opacity="0.12" />
          <rect x="94" y="58" width="14" height="36" rx="4" fill="var(--color-border-subtle)" opacity="0.12" />

          {/* Muscle zones */}
          {ZONES.map(z => (
            <path
              key={z.id}
              d={z.d}
              fill={z.color}
              opacity={getOpacity(z.muscleGroup)}
              className="transition-all duration-500"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {ZONES.map(z => (
          <div key={z.id} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color, opacity: getOpacity(z.muscleGroup) * 1.5 }} />
            <span className="text-[9px] text-[var(--color-text-muted)]">{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
