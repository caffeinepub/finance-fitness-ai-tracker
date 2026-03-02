import { Lightbulb, Target, Flame, TrendingUp, CheckCircle, Info, AlertCircle, Scale, UtensilsCrossed, Zap } from 'lucide-react';
import type { UserProfile, Workout, DailyMetrics } from '../backend';
import { FitnessGoal } from '../backend';
import { useGetMealLogs } from '../hooks/useQueries';
import { estimateCaloriesBurned, totalCaloriesBurned } from '../utils/calorieCalculator';

interface Props {
  userProfile: UserProfile | null;
  workouts: Workout[];
  dailyMetrics: DailyMetrics[];
}

function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function bmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-primary-accent' };
  if (bmi < 25) return { label: 'Normal weight', color: 'text-fitness-accent' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-finance-accent' };
  return { label: 'Obese', color: 'text-destructive' };
}

function generateFitnessSuggestions(
  goal: FitnessGoal,
  workouts: Workout[],
  dailyMetrics: DailyMetrics[],
  bodyWeight: number | null,
  height: number | null,
  goalWeight: number | null,
  todayMealCalories: number | null,
  totalBurnedToday: number,
  avgStepsOverride?: number | null
) {
  const isCut = goal === FitnessGoal.cut;

  const bmi = bodyWeight && height ? calcBMI(bodyWeight, height) : null;
  const weightDelta = bodyWeight && goalWeight ? goalWeight - bodyWeight : null;
  const needsToLose = weightDelta !== null && weightDelta < 0;
  const needsToGain = weightDelta !== null && weightDelta > 0;
  const atGoal = weightDelta !== null && Math.abs(weightDelta) < 0.5;

  let calorieTarget: number;
  if (bodyWeight && height) {
    const bmr = 10 * bodyWeight + 6.25 * height - 5 * 25 + 5;
    const tdee = bmr * 1.55;
    calorieTarget = isCut ? Math.round(tdee - 500) : Math.round(tdee + 300);
  } else {
    calorieTarget = isCut ? 1800 : 2800;
  }

  const stepTarget = isCut ? 10000 : 7000;
  const avgCalories = dailyMetrics.length > 0
    ? Math.round(dailyMetrics.reduce((s, m) => s + m.calories, 0) / dailyMetrics.length)
    : null;
  const avgSteps = avgStepsOverride !== undefined
    ? avgStepsOverride
    : dailyMetrics.length > 0
    ? Math.round(dailyMetrics.reduce((s, m) => s + Number(m.steps), 0) / dailyMetrics.length)
    : null;

  const split = isCut
    ? ['Push (Chest/Shoulders/Triceps)', 'Pull (Back/Biceps)', 'Legs', 'Rest', 'Push', 'Pull', 'Rest']
    : ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Legs', 'Rest'];

  const muscleCount: Record<string, number> = {};
  workouts.forEach(w => {
    muscleCount[w.muscleGroup] = (muscleCount[w.muscleGroup] || 0) + 1;
  });
  const leastTrained = Object.entries(muscleCount).sort((a, b) => a[1] - b[1])[0]?.[0];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthWorkouts = workouts.filter(w => w.date >= monthStart).length;
  const monthMetrics = dailyMetrics.filter(m => m.date >= monthStart).length;

  const suggestions: { text: string; type: 'good' | 'warn' | 'info' }[] = [];

  if (weightDelta !== null) {
    if (atGoal) {
      suggestions.push({ text: `You're at your goal weight! Focus on maintenance and body recomposition.`, type: 'good' });
    } else if (needsToLose) {
      suggestions.push({
        text: `You're ${Math.abs(weightDelta).toFixed(1)} kg above your goal. A 500 kcal daily deficit will get you there in ~${Math.ceil(Math.abs(weightDelta) / 0.5)} weeks.`,
        type: 'info',
      });
    } else if (needsToGain) {
      suggestions.push({
        text: `You're ${weightDelta.toFixed(1)} kg below your goal. A 300 kcal daily surplus with progressive overload will help you gain lean mass.`,
        type: 'info',
      });
    }
  }

  if (bmi !== null) {
    const { label } = bmiCategory(bmi);
    if (label === 'Underweight') {
      suggestions.push({ text: `BMI ${bmi.toFixed(1)} (${label}): Prioritize calorie-dense whole foods and strength training to build healthy mass.`, type: 'warn' });
    } else if (label === 'Normal weight') {
      suggestions.push({ text: `BMI ${bmi.toFixed(1)} (${label}): Great baseline! Focus on performance and body composition goals.`, type: 'good' });
    } else if (label === 'Overweight') {
      suggestions.push({ text: `BMI ${bmi.toFixed(1)} (${label}): Combine cardio with strength training and a moderate calorie deficit for best results.`, type: 'warn' });
    } else {
      suggestions.push({ text: `BMI ${bmi.toFixed(1)} (${label}): Consult a healthcare provider and start with low-impact cardio (walking, swimming).`, type: 'warn' });
    }
  }

  // Calorie burn suggestion
  if (totalBurnedToday > 0) {
    const netCalories = todayMealCalories !== null ? todayMealCalories - totalBurnedToday : null;
    if (netCalories !== null) {
      if (isCut && netCalories < calorieTarget) {
        suggestions.push({
          text: `Great burn! After ${totalBurnedToday} kcal burned from workouts, your net intake is ~${netCalories.toLocaleString()} kcal — on track for your cut target.`,
          type: 'good',
        });
      } else if (!isCut && netCalories > 0) {
        suggestions.push({
          text: `You burned ${totalBurnedToday} kcal in workouts today. Net intake: ~${netCalories.toLocaleString()} kcal — keep fueling your bulk!`,
          type: 'good',
        });
      }
    } else {
      suggestions.push({
        text: `You've burned an estimated ${totalBurnedToday} kcal from today's workouts. Log your meals to see your net calorie balance.`,
        type: 'info',
      });
    }
  }

  if (avgCalories !== null) {
    if (isCut && avgCalories > calorieTarget + 200) {
      suggestions.push({ text: `Reduce daily calories by ~${avgCalories - calorieTarget} kcal to hit your cut target of ${calorieTarget.toLocaleString()} kcal.`, type: 'warn' });
    } else if (!isCut && avgCalories < calorieTarget - 200) {
      suggestions.push({ text: `Increase daily calories by ~${calorieTarget - avgCalories} kcal to support muscle growth (target: ${calorieTarget.toLocaleString()} kcal).`, type: 'warn' });
    } else {
      suggestions.push({ text: 'Great calorie adherence! Keep maintaining your current intake.', type: 'good' });
    }
  } else {
    suggestions.push({ text: 'Start logging daily calories to get personalized nutrition advice.', type: 'info' });
  }

  if (todayMealCalories !== null && todayMealCalories > 0) {
    const diff = todayMealCalories - calorieTarget;
    if (isCut && diff > 300) {
      suggestions.push({
        text: `Today's meals total ${todayMealCalories.toLocaleString()} kcal — ${diff} kcal over your cut target. Consider lighter options for your next meal.`,
        type: 'warn',
      });
    } else if (isCut && diff >= -200 && diff <= 300) {
      suggestions.push({
        text: `Today's meals (${todayMealCalories.toLocaleString()} kcal) are well within your cut target of ${calorieTarget.toLocaleString()} kcal. Great discipline!`,
        type: 'good',
      });
    } else if (!isCut && diff < -400) {
      suggestions.push({
        text: `Today's meals total ${todayMealCalories.toLocaleString()} kcal — ${Math.abs(diff)} kcal short of your bulk target. Add a protein-rich snack.`,
        type: 'info',
      });
    } else if (!isCut && diff >= -400) {
      suggestions.push({
        text: `Today's meals (${todayMealCalories.toLocaleString()} kcal) are on track for your bulk target of ${calorieTarget.toLocaleString()} kcal. Keep it up!`,
        type: 'good',
      });
    }
  } else if (todayMealCalories === 0) {
    suggestions.push({ text: 'No meals logged today yet. Use "Log Meal" to track your nutrition.', type: 'info' });
  }

  if (avgSteps !== null && avgSteps < stepTarget) {
    suggestions.push({ text: `Aim for ${stepTarget.toLocaleString()} steps/day. You're averaging ${avgSteps.toLocaleString()} — add a 20-min walk.`, type: 'warn' });
  } else if (avgSteps !== null && avgSteps >= stepTarget) {
    suggestions.push({ text: `Excellent step count! You're hitting your ${stepTarget.toLocaleString()} daily target with an average of ${avgSteps.toLocaleString()} steps.`, type: 'good' });
  } else {
    suggestions.push({ text: 'Log your daily steps to get activity-based coaching.', type: 'info' });
  }

  if (leastTrained) {
    suggestions.push({ text: `Your ${leastTrained} is undertrained. Add 1 more session this week.`, type: 'warn' });
  } else if (workouts.length === 0) {
    suggestions.push({ text: 'Log your first workout to get personalized training suggestions.', type: 'info' });
  }

  if (monthWorkouts < 8 && monthWorkouts > 0) {
    suggestions.push({ text: `You've done ${monthWorkouts} workouts this month. Aim for 12+ for best results.`, type: 'warn' });
  } else if (monthWorkouts >= 12) {
    suggestions.push({ text: `Outstanding! ${monthWorkouts} workouts this month — you're crushing it!`, type: 'good' });
  }

  return { calorieTarget, stepTarget, split, suggestions, monthWorkouts, monthMetrics, avgCalories, avgSteps, bmi, weightDelta };
}

export default function FitnessAISuggestions({ userProfile, workouts, dailyMetrics }: Props) {
  const goal = userProfile?.fitnessGoal ?? FitnessGoal.bulk;
  const isCut = goal === FitnessGoal.cut;
  const bodyWeight = userProfile?.bodyWeight ?? null;
  const height = userProfile?.height ?? null;
  const goalWeight = userProfile?.goalWeight ?? null;
  const hasMetrics = bodyWeight != null || height != null || goalWeight != null;

  const { data: allMealLogs = [] } = useGetMealLogs();
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = allMealLogs.filter(m => m.date === today);
  const todayMealCalories = allMealLogs.length > 0
    ? todayMeals.reduce((sum, m) => sum + m.estimatedCalories, 0)
    : null;

  // AI calorie burn: today's workouts
  const todayWorkouts = workouts.filter(w => w.date === today);
  const totalBurnedToday = totalCaloriesBurned(todayWorkouts, bodyWeight);

  // Per-workout calorie breakdown
  const workoutCalories = todayWorkouts.map(w => ({
    exercise: w.exercise,
    duration: w.duration,
    calories: estimateCaloriesBurned(w.exercise, w.duration, bodyWeight, w.muscleGroup),
  }));

  const avgSteps = dailyMetrics.length > 0
    ? Math.round(dailyMetrics.reduce((s, m) => s + Number(m.steps), 0) / dailyMetrics.length)
    : null;

  const { calorieTarget, stepTarget, split, suggestions, monthWorkouts, avgCalories, bmi, weightDelta } =
    generateFitnessSuggestions(goal, workouts, dailyMetrics, bodyWeight, height, goalWeight, todayMealCalories, totalBurnedToday, avgSteps);

  const bmiInfo = bmi !== null ? bmiCategory(bmi) : null;

  return (
    <div className="space-y-4">
      {/* Profile prompt */}
      {!hasMetrics && (
        <div className="bg-fitness-accent/5 border border-fitness-accent/30 rounded-2xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-fitness-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Personalize your plan:</span> Enter your body weight, height, and goal weight in the Body Metrics section above to get BMI analysis and tailored calorie targets.
          </p>
        </div>
      )}

      {/* Body Metrics Summary */}
      {hasMetrics && (
        <div className="grid grid-cols-3 gap-2">
          {bodyWeight != null && (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Scale className="w-4 h-4 text-fitness-accent mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{bodyWeight}</p>
              <p className="text-xs text-muted-foreground">kg now</p>
            </div>
          )}
          {goalWeight != null && (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Target className="w-4 h-4 text-finance-accent mx-auto mb-1" />
              <p className="text-lg font-black text-foreground">{goalWeight}</p>
              <p className="text-xs text-muted-foreground">kg goal</p>
            </div>
          )}
          {bmi !== null && bmiInfo && (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <p className={`text-lg font-black ${bmiInfo.color}`}>{bmi.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">BMI</p>
              <p className={`text-xs font-semibold ${bmiInfo.color}`}>{bmiInfo.label}</p>
            </div>
          )}
        </div>
      )}

      {/* Weight delta badge */}
      {weightDelta !== null && !isNaN(weightDelta) && (
        <div className={`rounded-xl px-3 py-2 flex items-center gap-2 border ${
          Math.abs(weightDelta) < 0.5
            ? 'bg-fitness-accent/10 border-fitness-accent/30'
            : weightDelta < 0
            ? 'bg-primary-accent/10 border-primary-accent/30'
            : 'bg-finance-accent/10 border-finance-accent/30'
        }`}>
          <TrendingUp className={`w-4 h-4 flex-shrink-0 ${
            Math.abs(weightDelta) < 0.5 ? 'text-fitness-accent' : weightDelta < 0 ? 'text-primary-accent' : 'text-finance-accent'
          }`} />
          <p className="text-sm font-semibold text-foreground">
            {Math.abs(weightDelta) < 0.5
              ? 'You\'re at your goal weight! 🎉'
              : weightDelta < 0
              ? `${Math.abs(weightDelta).toFixed(1)} kg to lose to reach goal`
              : `${weightDelta.toFixed(1)} kg to gain to reach goal`}
          </p>
        </div>
      )}

      {/* Goal Banner */}
      <div className={`rounded-2xl p-4 border-2 ${isCut ? 'border-primary-accent/40 bg-primary-accent/5' : 'border-fitness-accent/40 bg-fitness-accent/5'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Target className={`w-4 h-4 ${isCut ? 'text-primary-accent' : 'text-fitness-accent'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Goal</span>
        </div>
        <p className={`text-2xl font-black ${isCut ? 'text-primary-accent' : 'text-fitness-accent'}`}>
          {isCut ? '🔥 Cut Phase' : '💪 Bulk Phase'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isCut ? 'Focus on calorie deficit + cardio to shed fat.' : 'Calorie surplus + heavy lifting to build mass.'}
        </p>
      </div>

      {/* AI Calorie Burn Card */}
      {(totalBurnedToday > 0 || todayWorkouts.length > 0) && (
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-fitness-accent" />
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">AI Calorie Burn — Today</span>
          </div>
          {todayWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No workouts logged today yet.</p>
          ) : (
            <>
              <div className="space-y-2 mb-3">
                {workoutCalories.map((wc, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏋️</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{wc.exercise}</p>
                        <p className="text-xs text-muted-foreground">{wc.duration} min</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-fitness-accent">
                      {wc.calories > 0 ? `~${wc.calories} kcal` : '—'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total Burned Today</span>
                <span className="text-lg font-black text-fitness-accent">~{totalBurnedToday.toLocaleString()} kcal</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Daily Targets */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="w-4 h-4 text-primary-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cal Target</span>
          </div>
          <p className="text-xl font-black text-foreground">{calorieTarget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">kcal/day</p>
          {avgCalories !== null && (
            <p className={`text-xs font-semibold mt-1 ${
              isCut
                ? avgCalories <= calorieTarget ? 'text-fitness-accent' : 'text-destructive'
                : avgCalories >= calorieTarget ? 'text-fitness-accent' : 'text-finance-accent'
            }`}>
              Avg: {avgCalories.toLocaleString()} kcal
            </p>
          )}
        </div>

        <div className="bg-card rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-fitness-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Step Target</span>
          </div>
          <p className="text-xl font-black text-foreground">{stepTarget.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">steps/day</p>
          {avgSteps !== null && (
            <p className={`text-xs font-semibold mt-1 ${avgSteps >= stepTarget ? 'text-fitness-accent' : 'text-finance-accent'}`}>
              Avg: {avgSteps.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Meal Calorie Progress */}
      {todayMealCalories !== null && todayMealCalories > 0 && (
        <div className="bg-card rounded-2xl p-3 border border-border">
          <div className="flex items-center gap-1.5 mb-2">
            <UtensilsCrossed className="w-4 h-4 text-finance-accent" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Today's Meals</span>
            <span className="ml-auto text-sm font-black text-foreground">{todayMealCalories.toLocaleString()} kcal</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isCut
                  ? todayMealCalories <= calorieTarget ? 'bg-fitness-accent' : 'bg-destructive'
                  : todayMealCalories >= calorieTarget ? 'bg-fitness-accent' : 'bg-finance-accent'
              }`}
              style={{ width: `${Math.min(100, (todayMealCalories / calorieTarget) * 100).toFixed(1)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Target: {calorieTarget.toLocaleString()} kcal ({isCut ? 'cut' : 'bulk'})
          </p>
        </div>
      )}

      {/* Weekly Split */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary-accent" />
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Suggested Weekly Split</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {split.map((day, i) => (
            <div key={i} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</p>
              <div className={`rounded-lg p-1 ${day === 'Rest' ? 'bg-muted' : 'bg-fitness-accent/10'}`}>
                <p className={`text-xs font-semibold leading-tight ${day === 'Rest' ? 'text-muted-foreground' : 'text-fitness-accent'}`}>
                  {day.split(' ')[0].replace('(', '').replace(')', '')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary-accent" />
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">AI Coaching Tips</span>
        </div>
        {suggestions.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl p-3 flex items-start gap-2 border ${
              s.type === 'good'
                ? 'bg-fitness-accent/5 border-fitness-accent/20'
                : s.type === 'warn'
                ? 'bg-finance-accent/5 border-finance-accent/20'
                : 'bg-muted border-border'
            }`}
          >
            {s.type === 'good' ? (
              <CheckCircle className="w-4 h-4 text-fitness-accent mt-0.5 flex-shrink-0" />
            ) : s.type === 'warn' ? (
              <AlertCircle className="w-4 h-4 text-finance-accent mt-0.5 flex-shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            )}
            <p className="text-sm text-foreground">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Monthly Stats */}
      {monthWorkouts > 0 && (
        <div className="bg-card rounded-2xl p-3 border border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-fitness-accent" />
            <span className="text-sm font-semibold text-foreground">This Month</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-black text-fitness-accent">{monthWorkouts}</p>
              <p className="text-xs text-muted-foreground">workouts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
