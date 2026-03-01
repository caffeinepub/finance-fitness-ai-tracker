/**
 * MET-based calorie burn calculator.
 * Formula: Calories = MET × body weight (kg) × duration (hours)
 */

// MET lookup table: maps exercise keywords to MET values
const MET_TABLE: { keywords: string[]; met: number }[] = [
  // Cardio / Running
  { keywords: ['run', 'running', 'jog', 'jogging', 'sprint', 'sprinting'], met: 9.8 },
  { keywords: ['walk', 'walking', 'treadmill'], met: 3.5 },
  { keywords: ['cycling', 'cycle', 'bike', 'biking', 'stationary bike'], met: 7.5 },
  { keywords: ['swim', 'swimming'], met: 8.0 },
  { keywords: ['jump rope', 'skipping', 'jump'], met: 11.0 },
  { keywords: ['hiit', 'circuit', 'crossfit'], met: 10.0 },
  { keywords: ['elliptical', 'stair', 'stairs', 'step'], met: 6.0 },
  { keywords: ['rowing', 'row'], met: 7.0 },
  // Strength / Resistance
  { keywords: ['bench press', 'chest press', 'push up', 'pushup', 'push-up', 'fly', 'flye', 'dip'], met: 5.0 },
  { keywords: ['squat', 'leg press', 'lunge', 'leg extension', 'leg curl', 'hack squat'], met: 5.5 },
  { keywords: ['deadlift', 'romanian deadlift', 'rdl', 'sumo'], met: 6.0 },
  { keywords: ['pull up', 'pullup', 'pull-up', 'chin up', 'chinup', 'lat pulldown', 'back'], met: 5.0 },
  { keywords: ['shoulder press', 'overhead press', 'ohp', 'lateral raise', 'front raise', 'shoulder'], met: 4.5 },
  { keywords: ['curl', 'bicep', 'hammer curl', 'preacher'], met: 4.0 },
  { keywords: ['tricep', 'skull crusher', 'extension', 'pushdown'], met: 4.0 },
  { keywords: ['calf raise', 'calf'], met: 3.5 },
  { keywords: ['plank', 'crunch', 'sit up', 'situp', 'ab', 'core', 'russian twist'], met: 3.8 },
  { keywords: ['glute', 'hip thrust', 'bridge', 'kickback'], met: 4.5 },
  // Muscle group fallbacks
  { keywords: ['chest'], met: 5.0 },
  { keywords: ['legs', 'leg'], met: 5.5 },
  { keywords: ['shoulders'], met: 4.5 },
  { keywords: ['biceps', 'bicep'], met: 4.0 },
  { keywords: ['triceps', 'tricep'], met: 4.0 },
  { keywords: ['calves'], met: 3.5 },
  { keywords: ['glutes'], met: 4.5 },
  { keywords: ['full body'], met: 6.0 },
  // Generic weight training fallback
  { keywords: ['weight', 'lift', 'strength', 'resistance', 'barbell', 'dumbbell', 'cable', 'machine'], met: 4.5 },
];

const DEFAULT_MET = 4.5; // Generic resistance training
const DEFAULT_BODY_WEIGHT_KG = 70;

/**
 * Look up MET value for a given exercise name and/or muscle group.
 */
function getMET(exercise: string, muscleGroup?: string): number {
  const searchText = `${exercise} ${muscleGroup ?? ''}`.toLowerCase();

  for (const entry of MET_TABLE) {
    if (entry.keywords.some(kw => searchText.includes(kw))) {
      return entry.met;
    }
  }

  return DEFAULT_MET;
}

/**
 * Estimate calories burned for a single workout session.
 * @param exercise - Exercise name (e.g. "Bench Press")
 * @param durationMinutes - Duration in minutes
 * @param bodyWeightKg - User's body weight in kg (defaults to 70kg)
 * @param muscleGroup - Optional muscle group for better MET lookup
 * @returns Estimated calories burned (rounded to nearest integer)
 */
export function estimateCaloriesBurned(
  exercise: string,
  durationMinutes: number,
  bodyWeightKg?: number | null,
  muscleGroup?: string
): number {
  if (!durationMinutes || durationMinutes <= 0) return 0;

  const met = getMET(exercise, muscleGroup);
  const weight = bodyWeightKg && bodyWeightKg > 0 ? bodyWeightKg : DEFAULT_BODY_WEIGHT_KG;
  const durationHours = durationMinutes / 60;

  return Math.round(met * weight * durationHours);
}

/**
 * Calculate total calories burned from an array of workouts.
 * @param workouts - Array of workout objects with exercise, duration, muscleGroup
 * @param bodyWeightKg - User's body weight in kg
 * @returns Total estimated calories burned
 */
export function totalCaloriesBurned(
  workouts: { exercise: string; duration: number; muscleGroup: string }[],
  bodyWeightKg?: number | null
): number {
  return workouts.reduce((total, w) => {
    return total + estimateCaloriesBurned(w.exercise, w.duration, bodyWeightKg, w.muscleGroup);
  }, 0);
}
