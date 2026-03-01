import { useState, useEffect } from 'react';
import { useLogDailyMetrics } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Props {
  onSuccess: () => void;
  initialSteps?: number;
  initialDate?: string;
}

export default function DailyMetricsForm({ onSuccess, initialSteps, initialDate }: Props) {
  const { mutateAsync: logMetrics, isPending } = useLogDailyMetrics();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    calories: '',
    steps: initialSteps !== undefined ? String(initialSteps) : '',
    date: initialDate ?? today,
  });

  // Sync when initialSteps prop changes (e.g. from StepTrackerWidget)
  useEffect(() => {
    if (initialSteps !== undefined) {
      setForm(f => ({ ...f, steps: String(initialSteps) }));
    }
  }, [initialSteps]);

  useEffect(() => {
    if (initialDate) {
      setForm(f => ({ ...f, date: initialDate }));
    }
  }, [initialDate]);

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.calories || !form.steps) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await logMetrics({
        calories: parseInt(form.calories),
        steps: BigInt(Math.max(0, parseInt(form.steps) || 0)),
        date: form.date,
      });
      toast.success('Daily metrics logged!');
      onSuccess();
    } catch {
      toast.error('Failed to log metrics');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Calories Consumed</Label>
        <Input
          type="number" min="0" max="10000"
          value={form.calories}
          onChange={e => set('calories', e.target.value)}
          placeholder="2000"
          className="rounded-xl h-10"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Steps Taken</Label>
        <Input
          type="number" min="0" max="100000"
          value={form.steps}
          onChange={e => set('steps', e.target.value)}
          placeholder="8000"
          className="rounded-xl h-10"
        />
        {initialSteps !== undefined && initialSteps > 0 && (
          <p className="text-xs text-primary-accent mt-1 font-medium">
            ✓ Pre-filled from step tracker ({initialSteps.toLocaleString()} steps)
          </p>
        )}
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Date</Label>
        <Input
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          className="rounded-xl h-10"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-primary-accent hover:bg-primary-accent/90 text-white rounded-xl font-semibold"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging...
          </span>
        ) : 'Log Metrics'}
      </Button>
    </form>
  );
}
