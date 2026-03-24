const EXERCISE_DATABASE = {
  'Chest': [
    'Barbell Bench Press', 'Dumbbell Bench Press', 'Incline Barbell Bench Press', 'Incline Dumbbell Press',
    'Decline Bench Press', 'Push-ups', 'Weighted Push-ups', 'Dumbbell Flyes', 'Incline Dumbbell Flyes',
    'Cable Crossovers (High to Low)', 'Cable Crossovers (Low to High)', 'Pec Deck Machine',
    'Chest Dip', 'Machine Chest Press', 'Smith Machine Bench Press', 'Svend Press'
  ].sort(),
  
  'Back': [
    'Pull-ups', 'Weighted Pull-ups', 'Chin-ups', 'Lat Pulldowns (Wide Grip)', 'Lat Pulldowns (Close Grip)',
    'Barbell Row', 'Pendlay Row', 'Dumbbell Row', 'T-Bar Row', 'Seated Cable Row',
    'Deadlift', 'Rack Pulls', 'Face Pulls', 'Straight Arm Pulldown', 'Meadows Row',
    'Machine Row', 'Good Mornings', 'Hyperextensions', 'Single Arm Cable Row'
  ].sort(),
  
  'Legs': [
    'Barbell Squat', 'Front Squat', 'Goblet Squat', 'Zercher Squat', 'Bulgarian Split Squat',
    'Leg Press', 'Hack Squat', 'Lunges (Dumbbell)', 'Walking Lunges', 'Reverse Lunges',
    'Leg Extension', 'Seated Leg Curl', 'Lying Leg Curl', 'Romanian Deadlift (RDL)',
    'Stiff-Legged Deadlift', 'Standing Calf Raises', 'Seated Calf Raises', 'Glute Bridge',
    'Barbell Hip Thrust', 'Cable Pull-Throughs', 'Sissy Squat'
  ].sort(),
};

const muscleGroupCounts = {
  'Chest': 0, 'Back': 0, 'Legs': 0, 'Shoulders': 0, 'Arms': 0, 'Core': 0
};

const recentWorkouts = [
  // Week 1
  { id: "dw-1", exercises: [{ id: "we-1", name: "Barbell Squat", sets: [1, 2] }] },
  { id: "dw-2", exercises: [{ id: "we-2", name: "Barbell Bench Press", sets: [1, 2] }] },
  { id: "dw-3", exercises: [{ id: "we-3", name: "Pull-ups", sets: [1] }] },
];

recentWorkouts.forEach(w => {
  w.exercises.forEach(ex => {
    let mg = 'Other';
    for (const [group, exercises] of Object.entries(EXERCISE_DATABASE)) {
      if (exercises.includes(ex.name)) {
        mg = group;
        break;
      }
    }
    if (muscleGroupCounts[mg] !== undefined) {
      muscleGroupCounts[mg] += ex.sets.length; 
    }
  });
});

console.log(muscleGroupCounts);
