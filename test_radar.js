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

const exercises = ['Barbell Squat', 'Barbell Bench Press', 'Pull-ups'];
const counts = {'Chest': 0, 'Back': 0, 'Legs': 0};

exercises.forEach(name => {
  let mg = 'Other';
  for (const [group, dict] of Object.entries(EXERCISE_DATABASE)) {
    if (dict.includes(name)) {
      mg = group;
      break;
    }
  }
  if (counts[mg] !== undefined) counts[mg]++;
});

console.log('Results:', counts);
