import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Footprints, Flame, X } from 'lucide-react';
import type { Workout, DailyMetrics } from '../backend';

interface FitnessCalendarProps {
  workouts: Workout[];
  dailyMetrics: DailyMetrics[];
}

export default function FitnessCalendar({ workouts, dailyMetrics }: FitnessCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const getDateString = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const workoutsByDate = workouts.reduce<Record<string, Workout[]>>((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {});

  const metricsByDate = dailyMetrics.reduce<Record<string, DailyMetrics>>((acc, m) => {
    acc[m.date] = m;
    return acc;
  }, {});

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const selectedWorkouts = selectedDate ? (workoutsByDate[selectedDate] ?? []) : [];
  const selectedMetrics = selectedDate ? metricsByDate[selectedDate] : undefined;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <span className="font-semibold text-sm text-foreground">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = getDateString(day);
          const hasWorkout = !!workoutsByDate[dateStr]?.length;
          const hasMetrics = !!metricsByDate[dateStr];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <button
              key={day}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={`aspect-square flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors relative
                ${isSelected ? 'bg-fitness-accent text-white' : isToday ? 'bg-fitness-accent/10 text-fitness-accent' : 'hover:bg-muted text-foreground'}
              `}
            >
              <span>{day}</span>
              <div className="flex gap-0.5">
                {hasWorkout && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-fitness-accent'}`} />
                )}
                {hasMetrics && (
                  <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-amber-400'}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-fitness-accent" />
          <span className="text-xs text-muted-foreground">Workout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs text-muted-foreground">Metrics</span>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDate && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-foreground">{formatDate(selectedDate)}</h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {selectedWorkouts.length === 0 && !selectedMetrics && (
            <p className="text-xs text-muted-foreground text-center py-2">No data logged for this day.</p>
          )}

          {/* Metrics */}
          {selectedMetrics && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-medium text-foreground">Daily Metrics</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card rounded-xl p-2.5 border border-border text-center">
                  <div className="text-lg font-bold text-orange-400">{selectedMetrics.calories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
                <div className="bg-card rounded-xl p-2.5 border border-border text-center">
                  <div className="text-lg font-bold text-fitness-accent">{Number(selectedMetrics.steps).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Steps</div>
                </div>
              </div>
            </div>
          )}

          {/* Workouts */}
          {selectedWorkouts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Dumbbell className="w-3.5 h-3.5 text-fitness-accent" />
                <span className="text-xs font-medium text-foreground">
                  {selectedWorkouts.length} Workout{selectedWorkouts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="space-y-2">
                {selectedWorkouts.map((w, idx) => (
                  <div key={idx} className="bg-card rounded-xl p-3 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">{w.exercise}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{w.muscleGroup}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{w.sets} sets × {w.reps} reps</span>
                      {w.weight > 0 && <span>@ {w.weight} kg</span>}
                      {w.duration > 0 && <span>{w.duration} min</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
