/**
 * Estimates calories burned from steps using a weight-adjusted MET-based heuristic.
 * Approximately 0.04 kcal/step at 70 kg, scaled linearly with body weight.
 */
export function calculateStepCalories(steps: number, bodyWeightKg?: number): number {
  if (steps <= 0) return 0;
  const weight = bodyWeightKg && bodyWeightKg > 0 ? bodyWeightKg : 70;
  // ~0.04 kcal per step per 70 kg body weight
  const kcalPerStep = (0.04 * weight) / 70;
  return Math.round(steps * kcalPerStep);
}
