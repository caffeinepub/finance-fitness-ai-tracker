import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Utensils, CalendarDays, Sparkles, X, Footprints, Flame } from 'lucide-react';
import WorkoutLogForm from '../components/WorkoutLogForm';
import DailyMetricsForm from '../components/DailyMetricsForm';
import MealLogForm from '../components/MealLogForm';
import FitnessCalendar from '../components/FitnessCalendar';
import FitnessAISuggestions from '../components/FitnessAISuggestions';
import FitnessProfileForm from '../components/FitnessProfileForm';
import GoalSelector from '../components/GoalSelector';
import MealList from '../components/MealList';
import { useGetWorkouts, useGetDailyMetrics } from '../hooks/useQueries';
import { calculateStepCalories } from '../utils/stepCalorieCalculator';
import type { UserProfile } from '../backend';

interface FitnessSectionProps {
  userProfile: UserProfile | null;
}

export default function FitnessSection({ userProfile }: FitnessSectionProps) {
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [manualSteps, setManualSteps] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const { data: workouts = [] } = useGetWorkouts();
  const { data: dailyMetrics = [] } = useGetDailyMetrics();

  const todayWorkouts = workouts.filter(w => w.date === today);
  const todayMetrics = dailyMetrics.find(m => m.date === today);
  const bodyWeightKg = userProfile?.bodyWeight ?? undefined;

  // Calorie estimate from manual step input
  const stepCount = parseInt(manualSteps) || 0;
  const estimatedCalories = calculateStepCalories(stepCount, bodyWeightKg);

  // Pre-fill step input from today's saved metrics when available
  const savedSteps = todayMetrics ? Number(todayMetrics.steps) : 0;
  const displaySteps = manualSteps !== '' ? manualSteps : (savedSteps > 0 ? String(savedSteps) : '');
  const displayStepCount = parseInt(displaySteps) || 0;
  const displayCalories = calculateStepCalories(displayStepCount, bodyWeightKg);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-2xl font-bold text-fitness-accent">{todayWorkouts.length}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Workouts Today</div>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-2xl font-bold text-fitness-accent">
            {todayMetrics?.calories ?? 0}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Calories</div>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-2xl font-bold text-fitness-accent">
            {todayMetrics ? Number(todayMetrics.steps).toLocaleString() : '0'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">Steps</div>
        </div>
      </div>

      {/* Goal Selector */}
      <GoalSelector userProfile={userProfile} />

      {/* Manual Step Counter with AI Calorie Estimate */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Footprints className="w-4 h-4 text-fitness-accent" />
          <h3 className="font-semibold text-sm text-foreground">Step Counter</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="manual-steps" className="text-xs text-muted-foreground">
              Enter your steps for today
            </Label>
            <Input
              id="manual-steps"
              type="number"
              min="0"
              placeholder="e.g. 8000"
              value={displaySteps}
              onChange={e => setManualSteps(e.target.value)}
              className="mt-1 h-10 text-sm"
            />
          </div>

          {displayStepCount > 0 && (
            <div className="flex items-center gap-2 bg-fitness-accent/10 rounded-xl px-3 py-2.5">
              <Flame className="w-4 h-4 text-fitness-accent flex-shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground">Estimated calories burned: </span>
                <span className="text-sm font-semibold text-fitness-accent">
                  {displayCalories} kcal
                </span>
                {bodyWeightKg && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (based on {bodyWeightKg} kg)
                  </span>
                )}
              </div>
            </div>
          )}

          {!bodyWeightKg && displayStepCount > 0 && (
            <p className="text-xs text-muted-foreground">
              💡 Add your body weight in Fitness Profile for a more accurate estimate.
            </p>
          )}
        </div>
      </div>

      {/* Fitness Profile */}
      <FitnessProfileForm userProfile={userProfile} />

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 border-fitness-accent/30 text-fitness-accent hover:bg-fitness-accent/10"
          onClick={() => { setShowWorkoutForm(v => !v); setShowMetricsForm(false); setShowMealForm(false); }}
        >
          {showWorkoutForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          Workout
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 border-fitness-accent/30 text-fitness-accent hover:bg-fitness-accent/10"
          onClick={() => { setShowMetricsForm(v => !v); setShowWorkoutForm(false); setShowMealForm(false); }}
        >
          {showMetricsForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          Metrics
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 border-fitness-accent/30 text-fitness-accent hover:bg-fitness-accent/10"
          onClick={() => { setShowMealForm(v => !v); setShowWorkoutForm(false); setShowMetricsForm(false); }}
        >
          {showMealForm ? <X className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
          Meal
        </Button>
      </div>

      {/* Inline Forms */}
      {showWorkoutForm && (
        <WorkoutLogForm
          onSuccess={() => setShowWorkoutForm(false)}
          bodyWeightKg={bodyWeightKg ?? null}
        />
      )}
      {showMetricsForm && (
        <DailyMetricsForm
          onClose={() => setShowMetricsForm(false)}
          initialSteps={manualSteps !== '' ? parseInt(manualSteps) || 0 : savedSteps || undefined}
        />
      )}
      {showMealForm && (
        <MealLogForm onSuccess={() => setShowMealForm(false)} />
      )}

      {/* Tabs: AI, Meals, Calendar */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Coach
          </TabsTrigger>
          <TabsTrigger value="meals" className="flex items-center gap-1.5 text-xs">
            <Utensils className="w-3.5 h-3.5" />
            Meals
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1.5 text-xs">
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-3">
          <FitnessAISuggestions
            userProfile={userProfile}
            workouts={workouts}
            dailyMetrics={dailyMetrics}
          />
        </TabsContent>

        <TabsContent value="meals" className="mt-3">
          <MealList date={today} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-3">
          <FitnessCalendar workouts={workouts} dailyMetrics={dailyMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
