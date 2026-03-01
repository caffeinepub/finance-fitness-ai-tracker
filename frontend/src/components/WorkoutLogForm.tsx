import { useState } from 'react';
import { useLogWorkout } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { estimateCaloriesBurned } from '../utils/calorieCalculator';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Legs', 'Glutes', 'Core', 'Calves', 'Full Body',
];

interface Props {
  onSuccess: () => void;
  bodyWeightKg?: number | null;
}

export default function WorkoutLogForm({ onSuccess, bodyWeightKg }: Props) {
  const { mutateAsync: logWorkout, isPending } = useLogWorkout();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    muscleGroup: '',
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    date: today,
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  // Live AI calorie preview
  const previewCalories =
    form.exercise && form.duration && parseInt(form.duration) > 0
      ? estimateCaloriesBurned(form.exercise, parseInt(form.duration), bodyWeightKg, form.muscleGroup)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.muscleGroup || !form.exercise || !form.sets || !form.reps || !form.weight) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await logWorkout({
        muscleGroup: form.muscleGroup,
        exercise: form.exercise,
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        weight: parseFloat(form.weight),
        duration: form.duration ? parseInt(form.duration) : 0,
        date: form.date,
      });
      toast.success('Workout logged!');
      onSuccess();
    } catch {
      toast.error('Failed to log workout');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Muscle Group</Label>
          <Select value={form.muscleGroup} onValueChange={(v) => set('muscleGroup', v)}>
            <SelectTrigger className="rounded-xl h-10">
              <SelectValue placeholder="Select muscle" />
            </SelectTrigger>
            <SelectContent>
              {MUSCLE_GROUPS.map(g => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Exercise Name</Label>
          <Input
            value={form.exercise}
            onChange={e => set('exercise', e.target.value)}
            placeholder="e.g. Bench Press"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Sets</Label>
          <Input
            type="number" min="1" max="20"
            value={form.sets}
            onChange={e => set('sets', e.target.value)}
            placeholder="4"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Reps</Label>
          <Input
            type="number" min="1" max="100"
            value={form.reps}
            onChange={e => set('reps', e.target.value)}
            placeholder="10"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Weight (kg)</Label>
          <Input
            type="number" min="0" step="0.5"
            value={form.weight}
            onChange={e => set('weight', e.target.value)}
            placeholder="60"
            className="rounded-xl h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Duration (min)</Label>
          <Input
            type="number" min="1" max="300"
            value={form.duration}
            onChange={e => set('duration', e.target.value)}
            placeholder="45"
            className="rounded-xl h-10"
          />
        </div>

        <div className="col-span-2">
          <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="rounded-xl h-10"
          />
        </div>
      </div>

      {/* AI Calorie Burn Preview */}
      {previewCalories !== null && (
        <div className="bg-fitness-accent/10 border border-fitness-accent/30 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <p className="text-sm font-semibold text-fitness-accent">
            AI Estimate: ~{previewCalories.toLocaleString()} kcal burned
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-fitness-accent hover:bg-fitness-accent/90 text-white rounded-xl font-semibold"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging...
          </span>
        ) : 'Log Workout'}
      </Button>
    </form>
  );
}
