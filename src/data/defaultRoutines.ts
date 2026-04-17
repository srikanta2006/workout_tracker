// src/data/defaultRoutines.ts

export type DefaultExercise = {
    name: string;
    sets: number;
    reps: number;
    rest_seconds: number;
    notes?: string;
};

export type DefaultDayTemplate = {
    name: string;
    focus: string;
    exercises: DefaultExercise[];
};

export type DefaultRoutine = {
    name: string;
    description: string;
    goal: 'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'general_fitness';
    days_per_week: number;
    days: DefaultDayTemplate[];
};

// ─── DEFAULT DAY TEMPLATES ───────────────────────────────────────────────────

export const DEFAULT_DAY_TEMPLATES: DefaultDayTemplate[] = [
    {
        name: 'Push Day',
        focus: 'Chest, Shoulders, Triceps',
        exercises: [
            { name: 'Bench Press', sets: 4, reps: 8, rest_seconds: 90 },
            { name: 'Overhead Press', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Incline Dumbbell Press', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Lateral Raises', sets: 3, reps: 15, rest_seconds: 45 },
            { name: 'Tricep Pushdowns', sets: 3, reps: 12, rest_seconds: 45 },
        ],
    },
    {
        name: 'Pull Day',
        focus: 'Back, Biceps',
        exercises: [
            { name: 'Deadlift', sets: 4, reps: 5, rest_seconds: 120 },
            { name: 'Pull-Ups', sets: 3, reps: 8, rest_seconds: 90 },
            { name: 'Barbell Row', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Face Pulls', sets: 3, reps: 15, rest_seconds: 45 },
            { name: 'Barbell Curls', sets: 3, reps: 12, rest_seconds: 45 },
        ],
    },
    {
        name: 'Leg Day',
        focus: 'Quads, Hamstrings, Glutes, Calves',
        exercises: [
            { name: 'Squat', sets: 4, reps: 8, rest_seconds: 120 },
            { name: 'Romanian Deadlift', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Leg Press', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Leg Curl', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Calf Raises', sets: 4, reps: 20, rest_seconds: 30 },
        ],
    },
    {
        name: 'Upper Body',
        focus: 'Chest, Back, Shoulders, Arms',
        exercises: [
            { name: 'Bench Press', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Barbell Row', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Overhead Press', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Pull-Ups', sets: 3, reps: 8, rest_seconds: 90 },
            { name: 'Hammer Curls', sets: 2, reps: 12, rest_seconds: 45 },
            { name: 'Skull Crushers', sets: 2, reps: 12, rest_seconds: 45 },
        ],
    },
    {
        name: 'Lower Body',
        focus: 'Quads, Hamstrings, Glutes',
        exercises: [
            { name: 'Squat', sets: 4, reps: 8, rest_seconds: 120 },
            { name: 'Hip Thrust', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Walking Lunges', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Leg Curl', sets: 3, reps: 12, rest_seconds: 60 },
            { name: 'Seated Calf Raises', sets: 3, reps: 20, rest_seconds: 30 },
        ],
    },
    {
        name: 'Full Body',
        focus: 'Total Body Compound Movements',
        exercises: [
            { name: 'Squat', sets: 3, reps: 8, rest_seconds: 90 },
            { name: 'Bench Press', sets: 3, reps: 8, rest_seconds: 90 },
            { name: 'Deadlift', sets: 3, reps: 5, rest_seconds: 120 },
            { name: 'Overhead Press', sets: 3, reps: 10, rest_seconds: 90 },
            { name: 'Pull-Ups', sets: 3, reps: 8, rest_seconds: 90 },
        ],
    },
    {
        name: 'Cardio & Core',
        focus: 'Conditioning and Core Strength',
        exercises: [
            { name: 'Treadmill Run', sets: 1, reps: 20, rest_seconds: 0, notes: '20 minutes moderate pace' },
            { name: 'Plank', sets: 3, reps: 1, rest_seconds: 60, notes: '60 seconds hold' },
            { name: 'Russian Twists', sets: 3, reps: 20, rest_seconds: 30 },
            { name: 'Hanging Leg Raises', sets: 3, reps: 12, rest_seconds: 45 },
            { name: 'Mountain Climbers', sets: 3, reps: 20, rest_seconds: 30 },
        ],
    },
    {
        name: 'Rest / Active Recovery',
        focus: 'Mobility and Light Movement',
        exercises: [
            { name: 'Foam Rolling', sets: 1, reps: 1, rest_seconds: 0, notes: '10 minutes full body' },
            { name: 'Hip Flexor Stretch', sets: 2, reps: 1, rest_seconds: 30, notes: '60 sec each side' },
            { name: 'Cat-Cow Stretch', sets: 2, reps: 10, rest_seconds: 30 },
            { name: 'Light Walking', sets: 1, reps: 1, rest_seconds: 0, notes: '20–30 minutes' },
        ],
    },
];

// ─── DEFAULT ROUTINES ─────────────────────────────────────────────────────────

export const DEFAULT_ROUTINES: DefaultRoutine[] = [
    {
        name: 'PPL – Push Pull Legs (6 Day)',
        description: 'Classic 6-day split targeting each muscle group twice per week. Great for intermediate lifters focused on hypertrophy.',
        goal: 'hypertrophy',
        days_per_week: 6,
        days: [
            { ...DEFAULT_DAY_TEMPLATES[0], name: 'Day 1 – Push' },
            { ...DEFAULT_DAY_TEMPLATES[1], name: 'Day 2 – Pull' },
            { ...DEFAULT_DAY_TEMPLATES[2], name: 'Day 3 – Legs' },
            { ...DEFAULT_DAY_TEMPLATES[0], name: 'Day 4 – Push' },
            { ...DEFAULT_DAY_TEMPLATES[1], name: 'Day 5 – Pull' },
            { ...DEFAULT_DAY_TEMPLATES[2], name: 'Day 6 – Legs' },
        ],
    },
    {
        name: 'Upper/Lower Split (4 Day)',
        description: 'A balanced 4-day routine alternating upper and lower body sessions. Good for strength and size.',
        goal: 'strength',
        days_per_week: 4,
        days: [
            { ...DEFAULT_DAY_TEMPLATES[3], name: 'Day 1 – Upper' },
            { ...DEFAULT_DAY_TEMPLATES[4], name: 'Day 2 – Lower' },
            { ...DEFAULT_DAY_TEMPLATES[3], name: 'Day 3 – Upper' },
            { ...DEFAULT_DAY_TEMPLATES[4], name: 'Day 4 – Lower' },
        ],
    },
    {
        name: 'Full Body Beginner (3 Day)',
        description: 'Three full-body sessions per week built around compound lifts. Perfect for beginners building a base.',
        goal: 'general_fitness',
        days_per_week: 3,
        days: [
            { ...DEFAULT_DAY_TEMPLATES[5], name: 'Day 1 – Full Body' },
            { ...DEFAULT_DAY_TEMPLATES[5], name: 'Day 2 – Full Body' },
            { ...DEFAULT_DAY_TEMPLATES[5], name: 'Day 3 – Full Body' },
        ],
    },
    {
        name: 'Bro Split (5 Day)',
        description: 'One muscle group per day. High volume per muscle, great for dedicated gym-goers chasing hypertrophy.',
        goal: 'hypertrophy',
        days_per_week: 5,
        days: [
            {
                name: 'Day 1 – Chest',
                focus: 'Chest',
                exercises: [
                    { name: 'Flat Bench Press', sets: 4, reps: 10, rest_seconds: 90 },
                    { name: 'Incline Bench Press', sets: 3, reps: 12, rest_seconds: 75 },
                    { name: 'Cable Fly', sets: 3, reps: 15, rest_seconds: 60 },
                    { name: 'Dips', sets: 3, reps: 12, rest_seconds: 60 },
                    { name: 'Push-Ups', sets: 2, reps: 20, rest_seconds: 30 },
                ],
            },
            {
                name: 'Day 2 – Back',
                focus: 'Back',
                exercises: [
                    { name: 'Deadlift', sets: 4, reps: 5, rest_seconds: 120 },
                    { name: 'Pull-Ups', sets: 4, reps: 8, rest_seconds: 90 },
                    { name: 'Seated Cable Row', sets: 3, reps: 12, rest_seconds: 60 },
                    { name: 'Lat Pulldown', sets: 3, reps: 12, rest_seconds: 60 },
                    { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, rest_seconds: 60 },
                ],
            },
            {
                name: 'Day 3 – Shoulders',
                focus: 'Shoulders',
                exercises: [
                    { name: 'Overhead Press', sets: 4, reps: 8, rest_seconds: 90 },
                    { name: 'Lateral Raises', sets: 4, reps: 15, rest_seconds: 45 },
                    { name: 'Front Raises', sets: 3, reps: 12, rest_seconds: 45 },
                    { name: 'Rear Delt Fly', sets: 3, reps: 15, rest_seconds: 45 },
                    { name: 'Shrugs', sets: 3, reps: 15, rest_seconds: 45 },
                ],
            },
            { ...DEFAULT_DAY_TEMPLATES[2], name: 'Day 4 – Legs' },
            {
                name: 'Day 5 – Arms',
                focus: 'Biceps & Triceps',
                exercises: [
                    { name: 'Barbell Curls', sets: 4, reps: 10, rest_seconds: 60 },
                    { name: 'Hammer Curls', sets: 3, reps: 12, rest_seconds: 45 },
                    { name: 'Skull Crushers', sets: 4, reps: 10, rest_seconds: 60 },
                    { name: 'Tricep Pushdowns', sets: 3, reps: 12, rest_seconds: 45 },
                    { name: 'Concentration Curls', sets: 2, reps: 15, rest_seconds: 30 },
                    { name: 'Diamond Push-Ups', sets: 2, reps: 15, rest_seconds: 30 },
                ],
            },
        ],
    },
    {
        name: 'Fat Loss Circuit (3 Day)',
        description: 'High-rep, lower-rest workouts combining strength and cardio. Designed to burn calories and maintain muscle.',
        goal: 'fat_loss',
        days_per_week: 3,
        days: [
            {
                name: 'Day 1 – Circuit A',
                focus: 'Full Body + Cardio',
                exercises: [
                    { name: 'Goblet Squat', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Push-Ups', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Dumbbell Row', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Jump Rope', sets: 3, reps: 1, rest_seconds: 30, notes: '60 seconds' },
                    { name: 'Plank', sets: 3, reps: 1, rest_seconds: 30, notes: '45 seconds' },
                ],
            },
            {
                name: 'Day 2 – Circuit B',
                focus: 'Lower Body + Core',
                exercises: [
                    { name: 'Bodyweight Squat', sets: 4, reps: 20, rest_seconds: 30 },
                    { name: 'Hip Thrust', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Reverse Lunges', sets: 3, reps: 12, rest_seconds: 30 },
                    { name: 'Mountain Climbers', sets: 3, reps: 20, rest_seconds: 30 },
                    { name: 'Bicycle Crunches', sets: 3, reps: 20, rest_seconds: 30 },
                ],
            },
            {
                name: 'Day 3 – Circuit C',
                focus: 'Upper Body + Cardio',
                exercises: [
                    { name: 'Dumbbell Press', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Bent-Over Row', sets: 4, reps: 15, rest_seconds: 30 },
                    { name: 'Lateral Raises', sets: 3, reps: 15, rest_seconds: 30 },
                    { name: 'Burpees', sets: 3, reps: 10, rest_seconds: 45 },
                    { name: 'Battle Ropes', sets: 3, reps: 1, rest_seconds: 45, notes: '30 seconds' },
                ],
            },
        ],
    },
];