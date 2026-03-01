import { useState, useEffect } from 'react';
import { Weight, Ruler, Target, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateFitnessProfile } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { toast } from 'sonner';

interface Props {
  userProfile: UserProfile | null;
}

export default function FitnessProfileForm({ userProfile }: Props) {
  const [bodyWeight, setBodyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const { mutateAsync: updateFitnessProfile, isPending } = useUpdateFitnessProfile();

  useEffect(() => {
    if (userProfile) {
      setBodyWeight(userProfile.bodyWeight != null ? String(userProfile.bodyWeight) : '');
      setHeight(userProfile.height != null ? String(userProfile.height) : '');
      setGoalWeight(userProfile.goalWeight != null ? String(userProfile.goalWeight) : '');
    }
  }, [userProfile]);

  const parsePositive = (val: string): number | null => {
    if (val.trim() === '') return null;
    const n = parseFloat(val);
    return isNaN(n) || n <= 0 ? NaN : n;
  };

  const handleSave = async () => {
    const bw = parsePositive(bodyWeight);
    const h = parsePositive(height);
    const gw = parsePositive(goalWeight);

    if (bw !== null && isNaN(bw as number)) { toast.error('Body weight must be a positive number.'); return; }
    if (h !== null && isNaN(h as number)) { toast.error('Height must be a positive number.'); return; }
    if (gw !== null && isNaN(gw as number)) { toast.error('Goal weight must be a positive number.'); return; }

    try {
      await updateFitnessProfile({
        bodyWeight: bw as number | null,
        height: h as number | null,
        goalWeight: gw as number | null,
      });
      toast.success('Fitness profile saved!');
    } catch {
      toast.error('Failed to save fitness profile.');
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Weight className="w-3.5 h-3.5 text-fitness-accent" />
        Your Body Metrics
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="bodyWeight" className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Weight className="w-3 h-3 text-fitness-accent" />
            Weight (kg)
          </Label>
          <Input
            id="bodyWeight"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 75"
            value={bodyWeight}
            onChange={(e) => setBodyWeight(e.target.value)}
            className="h-9 rounded-xl text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="height" className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Ruler className="w-3 h-3 text-primary-accent" />
            Height (cm)
          </Label>
          <Input
            id="height"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="h-9 rounded-xl text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goalWeight" className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Target className="w-3 h-3 text-finance-accent" />
            Goal (kg)
          </Label>
          <Input
            id="goalWeight"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 70"
            value={goalWeight}
            onChange={(e) => setGoalWeight(e.target.value)}
            className="h-9 rounded-xl text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        size="sm"
        className="w-full h-9 bg-fitness-accent hover:bg-fitness-accent/90 text-white rounded-xl font-semibold gap-2"
      >
        {isPending ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            Save Body Metrics
          </>
        )}
      </Button>
    </div>
  );
}
