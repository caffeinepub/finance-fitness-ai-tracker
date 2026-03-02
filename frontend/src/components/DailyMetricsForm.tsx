import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogDailyMetrics } from '../hooks/useQueries';
import { useStepTracker } from '../hooks/useStepTracker';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface DailyMetricsFormProps {
  onClose: () => void;
}

export default function DailyMetricsForm({ onClose }: DailyMetricsFormProps) {
  const logMetrics = useLogDailyMetrics();
  const { steps: trackedSteps } = useStepTracker();

  const today = new Date().toISOString().split('T')[0];
  const [calories, setCalories] = useState('');
  const [steps, setSteps] = useState('');
  const [date, setDate] = useState(today);

  // Pre-fill steps from tracker
  useEffect(() => {
    if (trackedSteps > 0) {
      setSteps(String(trackedSteps));
    }
  }, [trackedSteps]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calories || !steps) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await logMetrics.mutateAsync({
        calories: parseInt(calories),
        steps: BigInt(steps),
        date,
      });
      toast.success('Daily metrics logged!');
      onClose();
    } catch {
      toast.error('Failed to log metrics');
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm text-foreground">Log Daily Metrics</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="calories" className="text-xs text-muted-foreground">Calories Consumed</Label>
          <Input
            id="calories"
            type="number"
            min="0"
            placeholder="e.g. 2000"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            className="mt-1 h-9 text-sm"
            required
          />
        </div>

        <div>
          <Label htmlFor="steps" className="text-xs text-muted-foreground">
            Steps {trackedSteps > 0 && <span className="text-fitness-accent">(auto-filled from tracker)</span>}
          </Label>
          <Input
            id="steps"
            type="number"
            min="0"
            placeholder="e.g. 8000"
            value={steps}
            onChange={e => setSteps(e.target.value)}
            className="mt-1 h-9 text-sm"
            required
          />
        </div>

        <div>
          <Label htmlFor="date" className="text-xs text-muted-foreground">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="mt-1 h-9 text-sm"
            required
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            className="flex-1 bg-fitness-accent hover:bg-fitness-accent/90 text-white"
            disabled={logMetrics.isPending}
          >
            {logMetrics.isPending ? 'Saving…' : 'Log Metrics'}
          </Button>
        </div>
      </form>
    </div>
  );
}
