import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Utensils, CalendarDays, Sparkles, X } from 'lucide-react';
import WorkoutLogForm from '../components/WorkoutLogForm';
import DailyMetricsForm from '../components/DailyMetricsForm';
import MealLogForm from '../components/MealLogForm';
import FitnessCalendar from '../components/FitnessCalendar';
import FitnessAISuggestions from '../components/FitnessAISuggestions';
import FitnessProfileForm from '../components/FitnessProfileForm';
import GoalSelector from '../components/GoalSelector';
import StepTrackerWidget from '../components/StepTrackerWidget';
import MealList from '../components/MealList';
import { useGetWorkouts, useGetDailyMetrics, useLogDailyMetrics } from '../hooks/useQueries';
import type { UserProfile } from '../backend';

interface FitnessSectionProps {
  userProfile: UserProfile | null;
}

export default function FitnessSection({ userProfile }: FitnessSectionProps) {
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const today = new Date().toISOString().split('T')[0];

  const { data: workouts = [] } = useGetWorkouts();
  const { data: dailyMetrics = [] } = useGetDailyMetrics();
  const logDailyMetrics = useLogDailyMetrics();

  // Auto-save steps to backend
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleStepsUpdate = (steps: number, date: string) => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      try {
        // Find existing calories for today to avoid overwriting
        const todayMetrics = dailyMetrics.find(m => m.date === date);
        await logDailyMetrics.mutateAsync({
          date,
          calories: todayMetrics?.calories ?? 0,
          steps: BigInt(steps),
        });
      } catch {
        // Silent fail for background save
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, []);

  const todayWorkouts = workouts.filter(w => w.date === today);
  const todayMetrics = dailyMetrics.find(m => m.date === today);
  const bodyWeightKg = userProfile?.bodyWeight ?? null;

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

      {/* Step Tracker */}
      <StepTrackerWidget onStepsUpdate={handleStepsUpdate} />

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
          bodyWeightKg={bodyWeightKg}
        />
      )}
      {showMetricsForm && (
        <DailyMetricsForm onClose={() => setShowMetricsForm(false)} />
      )}
      {showMealForm && (
        <MealLogForm onSuccess={() => setShowMealForm(false)} />
      )}

      {/* Tabs: AI, Meals, Calendar (history removed — now in calendar) */}
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
