import { UtensilsCrossed, Flame } from 'lucide-react';
import { useGetMealLogs } from '../hooks/useQueries';

interface Props {
  date: string;
}

export default function MealList({ date }: Props) {
  const { data: allMeals = [], isLoading } = useGetMealLogs();

  const meals = allMeals.filter(m => m.date === date);
  const totalCalories = meals.reduce((sum, m) => sum + m.estimatedCalories, 0);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-xl p-3 border border-border animate-pulse h-16" />
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No meals logged for this day</p>
        <p className="text-sm mt-1">Tap "Log Meal" to add one</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {meals.map((meal, i) => (
        <div key={i} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fitness-accent/10 flex items-center justify-center flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5 text-fitness-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{meal.mealName}</p>
            <p className="text-xs text-muted-foreground">{meal.portionSize}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Flame className="w-3.5 h-3.5 text-primary-accent" />
            <span className="text-sm font-bold text-foreground">{meal.estimatedCalories}</span>
            <span className="text-xs text-muted-foreground">kcal</span>
          </div>
        </div>
      ))}

      {/* Daily total */}
      <div className="bg-primary-accent/10 border border-primary-accent/30 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-primary-accent" />
          <span className="text-sm font-bold text-foreground">Daily Total</span>
        </div>
        <span className="text-lg font-black text-primary-accent">{totalCalories.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}
