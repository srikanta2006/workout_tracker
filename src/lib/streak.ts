import { format, subDays, startOfDay, parseISO, isAfter } from 'date-fns';
import type { WorkoutSession, ActiveProgramState, Program } from '../types';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  restDays: string[]; // Dates of scheduled rest days
}

export function calculateStreak(
  workouts: WorkoutSession[],
  activeProgram: ActiveProgramState | null,
  programs: Program[]
): StreakStats {
  const today = startOfDay(new Date());
  
  // Map of dates with workouts
  const workoutDates = new Set(workouts.map(w => w.date.slice(0, 10)));
  
  // Find the active program definition
  const program = activeProgram ? programs.find(p => p.id === activeProgram.programId) : null;
  const programStartDate = activeProgram ? parseISO(activeProgram.startDate) : null;

  // Helper to check if a date is a scheduled rest day
  const isScheduledRestDay = (date: Date): boolean => {
    if (!program || !programStartDate) return false;
    
    // Check if within program duration
    const diffDays = Math.floor((date.getTime() - programStartDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= program.lengthInDays) return false;

    // Day numbering in Program usually starts from 1
    const dayNumber = diffDays + 1;
    const scheduleItem = program.schedule.find(s => s.dayNumber === dayNumber);
    
    return scheduleItem?.routineId === null;
  };

  // Current Streak Calculation
  let currentStreak = 0;
  let cursor = today;
  
  // Check today first. If no workout today, check if it's a rest day. 
  // If neither, the streak might still be active if yesterday was a workout/rest day.
  const todayKey = format(today, 'yyyy-MM-dd');
  const isWorkoutToday = workoutDates.has(todayKey);
  const isRestDayToday = isScheduledRestDay(today);

  // If today is not a workout day AND not a rest day, 
  // we check yesterday to see if the streak ended *then* or if it's still alive.
  if (!isWorkoutToday && !isRestDayToday) {
    cursor = subDays(today, 1);
  }

  while (true) {
    const key = format(cursor, 'yyyy-MM-dd');
    const isWorkout = workoutDates.has(key);
    const isRest = isScheduledRestDay(cursor);

    if (isWorkout || isRest) {
      if (isWorkout) currentStreak++; 
      // Note: We don't increment streak count for rest days themselves in the "count", 
      // or do we? The user said "streak should be counted". 
      // Usually, rest days MAINTAIN the streak but don't necessarily increment the "workout" count?
      // "streak should be counted with vol-0" suggest it SHOULD increment the day count.
      else currentStreak++; 
      
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
    
    // Safety break
    if (currentStreak > 1000) break;
  }

  // Longest Streak Calculation
  // We need to build a combined set of all "active" days (workouts + rest days)
  const allActiveDates: string[] = [];
  
  // Start from the earliest workout
  if (workouts.length === 0 && !activeProgram) {
    return { currentStreak: 0, longestStreak: 0, restDays: [] };
  }

  const startCursor = workouts.length > 0 
    ? startOfDay(parseISO(workouts[workouts.length - 1].date))
    : programStartDate!;
    
  let lCursor = startCursor;
  const restDayDates: string[] = [];

  while (!isAfter(lCursor, today)) {
    const key = format(lCursor, 'yyyy-MM-dd');
    if (workoutDates.has(key) || isScheduledRestDay(lCursor)) {
      allActiveDates.push(key);
      if (!workoutDates.has(key) && isScheduledRestDay(lCursor)) {
        restDayDates.push(key);
      }
    }
    lCursor = new Date(lCursor.getTime() + 86400000);
  }

  let longestStreak = 0;
  let running = 0;
  const uniqueSorted = [...new Set(allActiveDates)].sort();

  for (let i = 0; i < uniqueSorted.length; i++) {
    if (i === 0) {
      running = 1;
    } else {
      const prev = parseISO(uniqueSorted[i - 1]);
      const curr = parseISO(uniqueSorted[i]);
      const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      
      if (diff === 1) {
        running++;
      } else {
        running = 1;
      }
    }
    longestStreak = Math.max(longestStreak, running);
  }

  return {
    currentStreak,
    longestStreak,
    restDays: restDayDates
  };
}
