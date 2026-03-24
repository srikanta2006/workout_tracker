import type { WorkoutSession } from '../types';

export type AchievementCategory = 'Consistency' | 'Volume' | 'Strength' | 'Milestone' | 'Special';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  /** Returns a 0–1 progress value. 1 = unlocked. */
  getProgress: (workouts: WorkoutSession[]) => number;
  /** Human-readable hint of current value vs target */
  getHint?: (workouts: WorkoutSession[]) => string;
}

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────

function totalVolume(workouts: WorkoutSession[]): number {
  return workouts.reduce((t, s) =>
    t + s.exercises.reduce((et, e) =>
      et + e.sets.reduce((st, set) => st + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0), 0);
}

function sessionVolume(s: WorkoutSession): number {
  return s.exercises.reduce((et, e) =>
    et + e.sets.reduce((st, set) => st + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0), 0);
}

function maxWeight(workouts: WorkoutSession[]): number {
  return Math.max(0, ...workouts.flatMap(s =>
    s.exercises.flatMap(e => e.sets.map(set => Number(set.weight) || 0))));
}

function uniqueExercises(workouts: WorkoutSession[]): Set<string> {
  const names = new Set<string>();
  workouts.forEach(s => s.exercises.forEach(e => { if (e.name.trim()) names.add(e.name.trim()); }));
  return names;
}

function daysActiveInWeek(workouts: WorkoutSession[]): number {
  const weekMap: Record<string, Set<string>> = {};
  workouts.forEach(s => {
    const d = new Date(s.date);
    const week = `${d.getFullYear()}-${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`;
    if (!weekMap[week]) weekMap[week] = new Set();
    weekMap[week].add(s.date.slice(0, 10));
  });
  return Math.max(0, ...Object.values(weekMap).map(s => s.size));
}

function longestStreakDays(workouts: WorkoutSession[]): number {
  if (workouts.length === 0) return 0;
  const sortedDates = [...new Set(workouts.map(w => w.date.slice(0, 10)))].sort();
  let longest = 1, current = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / 86400000;
    if (diff === 1) { current++; longest = Math.max(longest, current); }
    else { current = 1; }
  }
  return longest;
}

function uniqueMuscleGroups(workouts: WorkoutSession[]): Set<string> {
  const groups = new Set<string>();
  workouts.forEach(s => s.muscleGroups.forEach(mg => groups.add(mg)));
  return groups;
}

// ────────────────────────────────────────────────
// BADGE DEFINITIONS
// ────────────────────────────────────────────────
export const ACHIEVEMENTS: AchievementDef[] = [

  // ══════ CONSISTENCY ══════
  {
    id: 'first_sweat',
    name: 'First Sweat',
    description: 'Log your very first workout.',
    icon: '💧',
    category: 'Consistency',
    rarity: 'Common',
    getProgress: (w) => Math.min(w.length, 1),
    getHint: (w) => `${w.length} / 1 workout`,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Train 3 days in a single calendar week.',
    icon: '🗓️',
    category: 'Consistency',
    rarity: 'Common',
    getProgress: (w) => Math.min(daysActiveInWeek(w) / 3, 1),
    getHint: (w) => `${Math.min(daysActiveInWeek(w), 3)} / 3 days in a week`,
  },
  {
    id: 'grind_mode',
    name: 'Grind Mode',
    description: 'Train 5 days in a single calendar week.',
    icon: '🔥',
    category: 'Consistency',
    rarity: 'Rare',
    getProgress: (w) => Math.min(daysActiveInWeek(w) / 5, 1),
    getHint: (w) => `${Math.min(daysActiveInWeek(w), 5)} / 5 days in a week`,
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: 'Train 3 consecutive days.',
    icon: '⚡',
    category: 'Consistency',
    rarity: 'Common',
    getProgress: (w) => Math.min(longestStreakDays(w) / 3, 1),
    getHint: (w) => `${Math.min(longestStreakDays(w), 3)} / 3 day streak`,
  },
  {
    id: 'streak_7',
    name: 'Seven Day Shredder',
    description: 'Train 7 consecutive days.',
    icon: '🌊',
    category: 'Consistency',
    rarity: 'Epic',
    getProgress: (w) => Math.min(longestStreakDays(w) / 7, 1),
    getHint: (w) => `${Math.min(longestStreakDays(w), 7)} / 7 day streak`,
  },
  {
    id: 'ten_sessions',
    name: 'Double Digits',
    description: 'Complete 10 total sessions.',
    icon: '🔟',
    category: 'Consistency',
    rarity: 'Common',
    getProgress: (w) => Math.min(w.length / 10, 1),
    getHint: (w) => `${w.length} / 10 sessions`,
  },
  {
    id: 'thirty_sessions',
    name: 'Iron Regular',
    description: 'Complete 30 total sessions.',
    icon: '📅',
    category: 'Consistency',
    rarity: 'Rare',
    getProgress: (w) => Math.min(w.length / 30, 1),
    getHint: (w) => `${w.length} / 30 sessions`,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 total sessions.',
    icon: '💯',
    category: 'Consistency',
    rarity: 'Epic',
    getProgress: (w) => Math.min(w.length / 100, 1),
    getHint: (w) => `${w.length} / 100 sessions`,
  },
  {
    id: 'five_weeks',
    name: 'Dedicated Athlete',
    description: 'Train across 5 different calendar weeks.',
    icon: '🏋️',
    category: 'Consistency',
    rarity: 'Rare',
    getProgress: (w) => {
      const weeks = new Set<string>();
      w.forEach(s => {
        const d = new Date(s.date);
        weeks.add(`${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`);
      });
      return Math.min(weeks.size / 5, 1);
    },
    getHint: (w) => {
      const weeks = new Set<string>();
      w.forEach(s => { const d = new Date(s.date); weeks.add(`${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`); });
      return `${Math.min(weeks.size, 5)} / 5 active weeks`;
    },
  },

  // ══════ VOLUME ══════
  {
    id: 'first_tonne',
    name: 'First Tonne',
    description: 'Lift 1,000 kg in volume in a single session.',
    icon: '🏋️',
    category: 'Volume',
    rarity: 'Common',
    getProgress: (w) => {
      const max = Math.max(0, ...w.map(sessionVolume));
      return Math.min(max / 1000, 1);
    },
    getHint: (w) => {
      const max = Math.round(Math.max(0, ...w.map(sessionVolume)));
      return `Best session: ${max.toLocaleString()} / 1,000 kg`;
    },
  },
  {
    id: 'steady_climber',
    name: 'Steady Climber',
    description: 'Accumulate 5,000 kg of lifetime volume.',
    icon: '📈',
    category: 'Volume',
    rarity: 'Common',
    getProgress: (w) => Math.min(totalVolume(w) / 5000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 5,000 kg`,
  },
  {
    id: 'volume_beast',
    name: 'Volume Beast',
    description: 'Accumulate 100,000 kg of lifetime volume.',
    icon: '🦣',
    category: 'Volume',
    rarity: 'Rare',
    getProgress: (w) => Math.min(totalVolume(w) / 100000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 100,000 kg`,
  },
  {
    id: 'half_megaton',
    name: 'Half Megaton',
    description: 'Accumulate 500,000 kg lifetime volume.',
    icon: '⚛️',
    category: 'Volume',
    rarity: 'Epic',
    getProgress: (w) => Math.min(totalVolume(w) / 500000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 500,000 kg`,
  },
  {
    id: 'megaton',
    name: 'Megaton',
    description: 'Accumulate 1,000,000 kg of lifetime volume.',
    icon: '☢️',
    category: 'Volume',
    rarity: 'Legendary',
    getProgress: (w) => Math.min(totalVolume(w) / 1000000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 1,000,000 kg`,
  },
  {
    id: 'session_beast',
    name: 'Session Beast',
    description: 'Lift over 5,000 kg in a single session.',
    icon: '🌋',
    category: 'Volume',
    rarity: 'Epic',
    getProgress: (w) => {
      const max = Math.max(0, ...w.map(sessionVolume));
      return Math.min(max / 5000, 1);
    },
    getHint: (w) => {
      const max = Math.round(Math.max(0, ...w.map(sessionVolume)));
      return `Best: ${max.toLocaleString()} / 5,000 kg`;
    },
  },
  {
    id: 'weekly_50k',
    name: 'Weekly Warrior',
    description: 'Lift 50,000 kg in a single week.',
    icon: '📊',
    category: 'Volume',
    rarity: 'Epic',
    getProgress: (w) => {
      const weekMap: Record<string, number> = {};
      w.forEach(s => {
        const d = new Date(s.date);
        const key = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`;
        weekMap[key] = (weekMap[key] || 0) + sessionVolume(s);
      });
      const best = Math.max(0, ...Object.values(weekMap));
      return Math.min(best / 50000, 1);
    },
    getHint: (w) => {
      const weekMap: Record<string, number> = {};
      w.forEach(s => {
        const d = new Date(s.date);
        const key = `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`;
        weekMap[key] = (weekMap[key] || 0) + sessionVolume(s);
      });
      const best = Math.round(Math.max(0, ...Object.values(weekMap)));
      return `Best week: ${best.toLocaleString()} / 50,000 kg`;
    },
  },

  // ══════ STRENGTH ══════
  {
    id: 'fifty_kg',
    name: 'Fifty Club',
    description: 'Log a set with 50 kg or more on any exercise.',
    icon: '🥈',
    category: 'Strength',
    rarity: 'Common',
    getProgress: (w) => Math.min(maxWeight(w) / 50, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 50 kg`,
  },
  {
    id: 'double_plates',
    name: 'Double Plates',
    description: 'Log a set with 100 kg or more.',
    icon: '🏅',
    category: 'Strength',
    rarity: 'Rare',
    getProgress: (w) => Math.min(maxWeight(w) / 100, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 100 kg`,
  },
  {
    id: 'triple_plate',
    name: 'Triple Plate Club',
    description: 'Log a set with 140 kg or more.',
    icon: '🥇',
    category: 'Strength',
    rarity: 'Epic',
    getProgress: (w) => Math.min(maxWeight(w) / 140, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 140 kg`,
  },
  {
    id: 'two_hundred',
    name: 'Two Hundred Club',
    description: 'Log a set with 200 kg or more.',
    icon: '👑',
    category: 'Strength',
    rarity: 'Legendary',
    getProgress: (w) => Math.min(maxWeight(w) / 200, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 200 kg`,
  },
  {
    id: 'rep_master_10',
    name: 'Rep Machine',
    description: 'Log a set of 10 reps or more at any weight.',
    icon: '🔁',
    category: 'Strength',
    rarity: 'Common',
    getProgress: (w) => {
      const max = Math.max(0, ...w.flatMap(s => s.exercises.flatMap(e => e.sets.map(set => Number(set.reps) || 0))));
      return max >= 10 ? 1 : max / 10;
    },
    getHint: (w) => {
      const max = Math.max(0, ...w.flatMap(s => s.exercises.flatMap(e => e.sets.map(set => Number(set.reps) || 0))));
      return `Max reps: ${Math.min(max, 10)} / 10`;
    },
  },
  {
    id: 'heavy_sets',
    name: 'Iron Sets',
    description: 'Log 100 total completed sets.',
    icon: '⚙️',
    category: 'Strength',
    rarity: 'Rare',
    getProgress: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return Math.min(total / 100, 1);
    },
    getHint: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return `${total} / 100 completed sets`;
    },
  },
  {
    id: 'five_hundred_sets',
    name: 'Set Collector',
    description: 'Log 500 total completed sets.',
    icon: '🗂️',
    category: 'Strength',
    rarity: 'Epic',
    getProgress: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return Math.min(total / 500, 1);
    },
    getHint: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return `${total} / 500 completed sets`;
    },
  },

  // ══════ MILESTONE ══════
  {
    id: 'muscle_explorer',
    name: 'Muscle Explorer',
    description: 'Train all 6 major muscle groups at least once.',
    icon: '🗺️',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => {
      const required = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const hit = required.filter(r => uniqueMuscleGroups(w).has(r)).length;
      return hit / required.length;
    },
    getHint: (w) => {
      const required = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
      const hit = required.filter(r => uniqueMuscleGroups(w).has(r)).length;
      return `${hit} / 6 muscle groups`;
    },
  },
  {
    id: 'ten_exercises',
    name: 'Arsenal Builder',
    description: 'Perform 10 unique exercises.',
    icon: '📚',
    category: 'Milestone',
    rarity: 'Common',
    getProgress: (w) => Math.min(uniqueExercises(w).size / 10, 1),
    getHint: (w) => `${Math.min(uniqueExercises(w).size, 10)} / 10 exercises`,
  },
  {
    id: 'thirty_exercises',
    name: 'Exercise Scholar',
    description: 'Perform 30 different exercises.',
    icon: '🧠',
    category: 'Milestone',
    rarity: 'Epic',
    getProgress: (w) => Math.min(uniqueExercises(w).size / 30, 1),
    getHint: (w) => `${Math.min(uniqueExercises(w).size, 30)} / 30 exercises`,
  },
  {
    id: 'first_program',
    name: 'The Planner',
    description: 'Start your first training routine.',
    icon: '📋',
    category: 'Milestone',
    rarity: 'Common',
    getProgress: (w) => w.length > 0 ? 1 : 0,
    getHint: () => 'Log 1 workout to unlock',
  },
  {
    id: 'long_session',
    name: 'Marathon Session',
    description: 'Log a workout with 8 or more exercises.',
    icon: '⏱️',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => {
      const max = Math.max(0, ...w.map(s => s.exercises.filter(e => e.name.trim()).length));
      return Math.min(max / 8, 1);
    },
    getHint: (w) => {
      const max = Math.max(0, ...w.map(s => s.exercises.filter(e => e.name.trim()).length));
      return `Most exercises in a session: ${Math.min(max, 8)} / 8`;
    },
  },

  // ══════ SPECIAL ══════
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Return to training after a 14-day break.',
    icon: '🪖',
    category: 'Special',
    rarity: 'Epic',
    getProgress: (w) => {
      if (w.length < 2) return 0;
      const sorted = [...w].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      for (let i = 1; i < sorted.length; i++) {
        const diff = (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) / 86400000;
        if (diff >= 14) return 1;
      }
      return 0;
    },
    getHint: () => 'Return after a 14+ day break',
  },
  {
    id: 'full_body',
    name: 'All-Rounder',
    description: 'Complete a Full Body tagged workout.',
    icon: '🌐',
    category: 'Special',
    rarity: 'Common',
    getProgress: (w) => w.some(s => s.muscleGroups.includes('Full Body')) ? 1 : 0,
    getHint: () => 'Log a Full Body workout',
  },
  {
    id: 'same_day_twice',
    name: 'Double Session',
    description: 'Log 2 workouts on the same calendar day.',
    icon: '⚔️',
    category: 'Special',
    rarity: 'Legendary',
    getProgress: (w) => {
      const dates = w.map(s => s.date.slice(0, 10));
      return dates.length !== new Set(dates).size ? 1 : 0;
    },
    getHint: () => 'Train twice in one day',
  },
  {
    id: 'early_morning',
    name: 'Perfect Month',
    description: 'Log at least 20 workouts in a single calendar month.',
    icon: '🌅',
    category: 'Special',
    rarity: 'Legendary',
    getProgress: (w) => {
      const monthMap: Record<string, number> = {};
      w.forEach(s => {
        const key = s.date.slice(0, 7);
        monthMap[key] = (monthMap[key] || 0) + 1;
      });
      const best = Math.max(0, ...Object.values(monthMap));
      return Math.min(best / 20, 1);
    },
    getHint: (w) => {
      const monthMap: Record<string, number> = {};
      w.forEach(s => { const key = s.date.slice(0, 7); monthMap[key] = (monthMap[key] || 0) + 1; });
      const best = Math.max(0, ...Object.values(monthMap));
      return `Best month: ${Math.min(best, 20)} / 20 sessions`;
    },
  },

  // ══════ EXTRA CONSISTENCY ══════
  {
    id: 'streak_14',
    name: 'Two-Week Titan',
    description: 'Train 14 consecutive days without a rest.',
    icon: '🔱',
    category: 'Consistency',
    rarity: 'Legendary',
    getProgress: (w) => Math.min(longestStreakDays(w) / 14, 1),
    getHint: (w) => `${Math.min(longestStreakDays(w), 14)} / 14 day streak`,
  },
  {
    id: 'fifty_sessions',
    name: 'Half Century',
    description: 'Complete 50 total sessions.',
    icon: '5️⃣0️⃣',
    category: 'Consistency',
    rarity: 'Rare',
    getProgress: (w) => Math.min(w.length / 50, 1),
    getHint: (w) => `${w.length} / 50 sessions`,
  },
  {
    id: 'two_hundred_sessions',
    name: 'Bicentennial Beast',
    description: 'Complete 200 total sessions.',
    icon: '🎖️',
    category: 'Consistency',
    rarity: 'Legendary',
    getProgress: (w) => Math.min(w.length / 200, 1),
    getHint: (w) => `${w.length} / 200 sessions`,
  },
  {
    id: 'ten_weeks',
    name: 'Quarter Year Strong',
    description: 'Train across 10 different calendar weeks.',
    icon: '📆',
    category: 'Consistency',
    rarity: 'Epic',
    getProgress: (w) => {
      const weeks = new Set<string>();
      w.forEach(s => { const d = new Date(s.date); weeks.add(`${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`); });
      return Math.min(weeks.size / 10, 1);
    },
    getHint: (w) => {
      const weeks = new Set<string>();
      w.forEach(s => { const d = new Date(s.date); weeks.add(`${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 7) / 7)}`); });
      return `${Math.min(weeks.size, 10)} / 10 active weeks`;
    },
  },

  // ══════ EXTRA VOLUME ══════
  {
    id: 'volume_10k',
    name: 'Ten Thousand Strong',
    description: 'Accumulate 10,000 kg of lifetime volume.',
    icon: '🧱',
    category: 'Volume',
    rarity: 'Common',
    getProgress: (w) => Math.min(totalVolume(w) / 10000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 10,000 kg`,
  },
  {
    id: 'volume_50k',
    name: 'Freight Train',
    description: 'Accumulate 50,000 kg of lifetime volume.',
    icon: '🚂',
    category: 'Volume',
    rarity: 'Rare',
    getProgress: (w) => Math.min(totalVolume(w) / 50000, 1),
    getHint: (w) => `${Math.round(totalVolume(w)).toLocaleString()} / 50,000 kg`,
  },
  {
    id: 'session_2k',
    name: 'Power Session',
    description: 'Lift over 2,000 kg in a single session.',
    icon: '⚡',
    category: 'Volume',
    rarity: 'Rare',
    getProgress: (w) => {
      const max = Math.max(0, ...w.map(sessionVolume));
      return Math.min(max / 2000, 1);
    },
    getHint: (w) => {
      const max = Math.round(Math.max(0, ...w.map(sessionVolume)));
      return `Best session: ${max.toLocaleString()} / 2,000 kg`;
    },
  },

  // ══════ EXTRA STRENGTH ══════
  {
    id: 'twenty_kg',
    name: 'Off the Bar',
    description: 'Log any set with weight above 20 kg.',
    icon: '🟢',
    category: 'Strength',
    rarity: 'Common',
    getProgress: (w) => Math.min(maxWeight(w) / 20, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 20 kg`,
  },
  {
    id: 'seventy_kg',
    name: 'Plate & A Half',
    description: 'Log a set with 70 kg or more.',
    icon: '💪',
    category: 'Strength',
    rarity: 'Rare',
    getProgress: (w) => Math.min(maxWeight(w) / 70, 1),
    getHint: (w) => `Best lift: ${maxWeight(w)} kg / 70 kg`,
  },
  {
    id: 'reps_20',
    name: 'Endurance Beast',
    description: 'Complete a set of 20 reps or more.',
    icon: '♾️',
    category: 'Strength',
    rarity: 'Rare',
    getProgress: (w) => {
      const max = Math.max(0, ...w.flatMap(s => s.exercises.flatMap(e => e.sets.map(set => Number(set.reps) || 0))));
      return Math.min(max / 20, 1);
    },
    getHint: (w) => {
      const max = Math.max(0, ...w.flatMap(s => s.exercises.flatMap(e => e.sets.map(set => Number(set.reps) || 0))));
      return `Max reps logged: ${Math.min(max, 20)} / 20`;
    },
  },
  {
    id: 'thousand_sets',
    name: 'Thousand Iron Sets',
    description: 'Log 1,000 total completed sets.',
    icon: '🔩',
    category: 'Strength',
    rarity: 'Legendary',
    getProgress: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return Math.min(total / 1000, 1);
    },
    getHint: (w) => {
      const total = w.reduce((t, s) => t + s.exercises.reduce((et, e) => et + e.sets.filter(set => set.completed).length, 0), 0);
      return `${total} / 1,000 completed sets`;
    },
  },
  {
    id: 'dense_session',
    name: 'Dense Session',
    description: 'Log 20 or more sets in a single session.',
    icon: '🧊',
    category: 'Strength',
    rarity: 'Epic',
    getProgress: (w) => {
      const max = Math.max(0, ...w.map(s => s.exercises.reduce((t, e) => t + e.sets.length, 0)));
      return Math.min(max / 20, 1);
    },
    getHint: (w) => {
      const max = Math.max(0, ...w.map(s => s.exercises.reduce((t, e) => t + e.sets.length, 0)));
      return `Most sets in one session: ${Math.min(max, 20)} / 20`;
    },
  },

  // ══════ EXTRA MILESTONE ══════
  {
    id: 'twenty_exercises',
    name: 'Movement Library',
    description: 'Perform 20 unique exercises across your career.',
    icon: '🗂️',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => Math.min(uniqueExercises(w).size / 20, 1),
    getHint: (w) => `${Math.min(uniqueExercises(w).size, 20)} / 20 exercises`,
  },
  {
    id: 'fifty_exercises',
    name: 'Movement Master',
    description: 'Perform 50 unique exercises across your career.',
    icon: '🎓',
    category: 'Milestone',
    rarity: 'Legendary',
    getProgress: (w) => Math.min(uniqueExercises(w).size / 50, 1),
    getHint: (w) => `${uniqueExercises(w).size} / 50 exercises`,
  },
  {
    id: 'five_exercises',
    name: 'Starting Five',
    description: 'Perform 5 different exercises.',
    icon: '🖐️',
    category: 'Milestone',
    rarity: 'Common',
    getProgress: (w) => Math.min(uniqueExercises(w).size / 5, 1),
    getHint: (w) => `${Math.min(uniqueExercises(w).size, 5)} / 5 exercises`,
  },
  {
    id: 'leg_specialist',
    name: 'Leg Day Loyalist',
    description: 'Train Legs 5 times.',
    icon: '🦵',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Legs')).length;
      return Math.min(count / 5, 1);
    },
    getHint: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Legs')).length;
      return `${Math.min(count, 5)} / 5 leg sessions`;
    },
  },
  {
    id: 'chest_specialist',
    name: 'Chest Day Hero',
    description: 'Train Chest 5 times.',
    icon: '💥',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Chest')).length;
      return Math.min(count / 5, 1);
    },
    getHint: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Chest')).length;
      return `${Math.min(count, 5)} / 5 chest sessions`;
    },
  },
  {
    id: 'back_specialist',
    name: 'Back Builder',
    description: 'Train Back 5 times.',
    icon: '🪵',
    category: 'Milestone',
    rarity: 'Rare',
    getProgress: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Back')).length;
      return Math.min(count / 5, 1);
    },
    getHint: (w) => {
      const count = w.filter(s => s.muscleGroups.includes('Back')).length;
      return `${Math.min(count, 5)} / 5 back sessions`;
    },
  },

  // ══════ EXTRA SPECIAL ══════
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Log workouts on both Saturday and Sunday.',
    icon: '🏖️',
    category: 'Special',
    rarity: 'Common',
    getProgress: (w) => {
      const days = new Set(w.map(s => new Date(s.date).getDay()));
      const hasSat = days.has(6);
      const hasSun = days.has(0);
      return (Number(hasSat) + Number(hasSun)) / 2;
    },
    getHint: (w) => {
      const days = new Set(w.map(s => new Date(s.date).getDay()));
      const done = Number(days.has(6)) + Number(days.has(0));
      return `${done} / 2 weekend days logged`;
    },
  },
  {
    id: 'notes_taker',
    name: 'Notes Taker',
    description: 'Add notes to 10 exercises across your sessions.',
    icon: '📝',
    category: 'Special',
    rarity: 'Common',
    getProgress: (w) => {
      const count = w.reduce((t, s) => t + s.exercises.filter(e => e.notes && e.notes.trim().length > 0).length, 0);
      return Math.min(count / 10, 1);
    },
    getHint: (w) => {
      const count = w.reduce((t, s) => t + s.exercises.filter(e => e.notes && e.notes.trim().length > 0).length, 0);
      return `${Math.min(count, 10)} / 10 exercises with notes`;
    },
  },
];

export type ComputedAchievement = AchievementDef & { progress: number; unlocked: boolean };

export function computeAchievements(workouts: WorkoutSession[]): ComputedAchievement[] {
  return ACHIEVEMENTS.map(a => {
    const progress = a.getProgress(workouts);
    return { ...a, progress, unlocked: progress >= 1 };
  });
}

export const RARITY_COLORS: Record<string, string> = {
  Common: 'from-slate-500 to-slate-700',
  Rare: 'from-blue-500 to-blue-700',
  Epic: 'from-purple-500 to-purple-800',
  Legendary: 'from-yellow-400 to-orange-600',
};

export const RARITY_GLOW: Record<string, string> = {
  Common: '',
  Rare: 'shadow-[0_0_20px_rgba(59,130,246,0.45)]',
  Epic: 'shadow-[0_0_24px_rgba(168,85,247,0.55)]',
  Legendary: 'shadow-[0_0_32px_rgba(251,191,36,0.7)] ring-1 ring-yellow-400/30',
};

export const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  Consistency: 'text-green-400',
  Volume: 'text-blue-400',
  Strength: 'text-red-400',
  Milestone: 'text-purple-400',
  Special: 'text-amber-400',
};
