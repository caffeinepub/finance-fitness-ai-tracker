import { useState } from 'react';
import { Dumbbell, Activity, Calendar as CalendarIcon, Brain, Plus, UtensilsCrossed, Flame } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useGetWorkouts, useGetDailyMetrics } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import GoalSelector from '../components/GoalSelector';
import WorkoutLogForm from '../components/WorkoutLogForm';
import DailyMetricsForm from '../components/DailyMetricsForm';
import MealLogForm from '../components/MealLogForm';
import MealList from '../components/MealList';
import FitnessAISuggestions from '../components/FitnessAISuggestions';
import FitnessCalendar from '../components/FitnessCalendar';
import FitnessProfileForm from '../components/FitnessProfileForm';
import StepTrackerWidget from '../components/StepTrackerWidget';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { totalCaloriesBurned } from '../utils/calorieCalculator';

interface Props {
  userProfile: UserProfile | null;
}

export default function FitnessSection({ userProfile }: Props) {
  const { data: workouts = [] } = useGetWorkouts();
  const { data: dailyMetrics = [] } = useGetDailyMetrics();
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [prefillSteps, setPrefillSteps] = useState<number | undefined>(undefined);

  const today = new Date().toISOString().split('T')[0];
  const bodyWeight = userProfile?.bodyWeight ?? null;

  // Calories burned today from workouts (AI estimate)
  const todayWorkouts = workouts.filter(w => w.date === today);
  const caloriesBurnedToday = totalCaloriesBurned(todayWorkouts, bodyWeight);

  // Handle save steps from StepTrackerWidget
  const handleSaveSteps = (steps: number) => {
    setPrefillSteps(steps);
    setMetricsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Goal Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-fitness-accent" />
          Fitness
        </h2>
        <GoalSelector userProfile={userProfile} />
      </div>

      {/* Fitness Profile Form */}
      <FitnessProfileForm userProfile={userProfile} />

      {/* Step Tracker Widget */}
      <StepTrackerWidget onSaveSteps={handleSaveSteps} />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-xl font-black text-fitness-accent">{workouts.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Workouts</p>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-xl font-black text-primary-accent">
            {dailyMetrics.length > 0
              ? Math.round(
                  dailyMetrics.reduce((s, m) => s + Number(m.steps), 0) / dailyMetrics.length
                ).toLocaleString()
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Avg Steps</p>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-xl font-black text-finance-accent">
            {dailyMetrics.length > 0
              ? Math.round(dailyMetrics.reduce((s, m) => s + m.calories, 0) / dailyMetrics.length)
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Avg Cal</p>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="flex items-center justify-center gap-0.5 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-fitness-accent" />
          </div>
          <p className="text-xl font-black text-fitness-accent">
            {caloriesBurnedToday > 0 ? caloriesBurnedToday.toLocaleString() : '—'}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Cal Burned</p>
        </div>
      </div>

      {/* Log Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 bg-fitness-accent hover:bg-fitness-accent/90 text-white rounded-xl font-semibold gap-1.5 text-xs">
              <Plus className="w-4 h-4" />
              Workout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-fitness-accent" />
                Log Workout
              </DialogTitle>
            </DialogHeader>
            <WorkoutLogForm
              onSuccess={() => setWorkoutDialogOpen(false)}
              bodyWeightKg={bodyWeight}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={metricsDialogOpen} onOpenChange={(open) => {
          setMetricsDialogOpen(open);
          if (!open) setPrefillSteps(undefined);
        }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl font-semibold gap-1.5 border-2 text-xs">
              <Activity className="w-4 h-4 text-primary-accent" />
              Daily
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-accent" />
                Log Daily Metrics
              </DialogTitle>
            </DialogHeader>
            <DailyMetricsForm
              onSuccess={() => {
                setMetricsDialogOpen(false);
                setPrefillSteps(undefined);
              }}
              initialSteps={prefillSteps}
              initialDate={today}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-11 rounded-xl font-semibold gap-1.5 border-2 text-xs border-fitness-accent/40 text-fitness-accent hover:bg-fitness-accent/10">
              <UtensilsCrossed className="w-4 h-4" />
              Meal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-fitness-accent" />
                Log Meal
              </DialogTitle>
            </DialogHeader>
            <MealLogForm onSuccess={() => setMealDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs: AI / Meals / Calendar / History */}
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="w-full grid grid-cols-4 rounded-xl bg-muted h-10">
          <TabsTrigger value="ai" className="rounded-lg text-xs font-semibold gap-1">
            <Brain className="w-3.5 h-3.5" />
            AI
          </TabsTrigger>
          <TabsTrigger value="meals" className="rounded-lg text-xs font-semibold gap-1">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Meals
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg text-xs font-semibold gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs font-semibold gap-1">
            <Dumbbell className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          <FitnessAISuggestions
            userProfile={userProfile}
            workouts={workouts}
            dailyMetrics={dailyMetrics}
          />
        </TabsContent>

        <TabsContent value="meals" className="mt-4">
          <MealList date={today} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <FitnessCalendar workouts={workouts} dailyMetrics={dailyMetrics} />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <WorkoutHistory workouts={workouts} bodyWeightKg={bodyWeight} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkoutHistory({
  workouts,
  bodyWeightKg,
}: {
  workouts: import('../backend').Workout[];
  bodyWeightKg?: number | null;
}) {
  if (workouts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No workouts logged yet</p>
        <p className="text-sm mt-1">Tap "Workout" to get started</p>
      </div>
    );
  }

  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((w, i) => {
        const calories = w.duration > 0
          ? estimateCaloriesBurned(w.exercise, w.duration, bodyWeightKg, w.muscleGroup)
          : null;
        return (
          <div key={i} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fitness-accent/10 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-fitness-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{w.exercise}</p>
              <p className="text-xs text-muted-foreground">
                {w.muscleGroup} · {w.sets}×{w.reps} @ {w.weight}kg
                {w.duration > 0 && ` · ${w.duration}min`}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              {calories !== null && (
                <p className="text-xs font-bold text-fitness-accent">~{calories} kcal</p>
              )}
              <span className="text-xs text-muted-foreground">{w.date}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Need to import estimateCaloriesBurned for WorkoutHistory
import { estimateCaloriesBurned } from '../utils/calorieCalculator';
