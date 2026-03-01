import { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Activity } from 'lucide-react';
import type { Workout, DailyMetrics } from '../backend';

interface Props {
  workouts: Workout[];
  dailyMetrics: DailyMetrics[];
}

export default function FitnessCalendar({ workouts, dailyMetrics }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build sets of dates with data
  const workoutDates = new Set(workouts.map(w => w.date));
  const metricDates = new Set(dailyMetrics.map(m => m.date));

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = today.toISOString().split('T')[0];

  // Selected date data
  const selectedWorkouts = selectedDate ? workouts.filter(w => w.date === selectedDate) : [];
  const selectedMetrics = selectedDate ? dailyMetrics.filter(m => m.date === selectedDate) : [];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-foreground">{monthName}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const hasWorkout = workoutDates.has(dateStr);
            const hasMetrics = metricDates.has(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-fitness-accent text-white'
                    : isToday
                    ? 'bg-primary-accent/20 text-primary-accent'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {day}
                {(hasWorkout || hasMetrics) && !isSelected && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {hasWorkout && <span className="w-1 h-1 rounded-full bg-fitness-accent" />}
                    {hasMetrics && <span className="w-1 h-1 rounded-full bg-primary-accent" />}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-fitness-accent" />
            <span className="text-xs text-muted-foreground">Workout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary-accent" />
            <span className="text-xs text-muted-foreground">Metrics</span>
          </div>
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && (selectedWorkouts.length > 0 || selectedMetrics.length > 0) && (
        <div className="bg-card rounded-2xl p-4 border border-border space-y-3">
          <p className="text-sm font-bold text-foreground">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {selectedWorkouts.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-fitness-accent/10 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-fitness-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{w.exercise}</p>
                <p className="text-xs text-muted-foreground">{w.muscleGroup} · {w.sets}×{w.reps} @ {w.weight}kg</p>
              </div>
            </div>
          ))}

          {selectedMetrics.map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-accent/10 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{m.calories} kcal · {m.steps.toLocaleString()} steps</p>
                <p className="text-xs text-muted-foreground">Daily metrics</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDate && selectedWorkouts.length === 0 && selectedMetrics.length === 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border text-center text-muted-foreground text-sm">
          No data logged for this day.
        </div>
      )}
    </div>
  );
}
