import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateFitnessProfile } from '../hooks/useQueries';
import type { UserProfile, WorkoutSplit } from '../backend';
import { toast } from 'sonner';
import { Dumbbell } from 'lucide-react';

interface FitnessProfileFormProps {
  userProfile: UserProfile | null | undefined;
}

type SplitOption = 'pushPullLegs' | 'upperLower' | 'fullBody' | 'broSplit' | 'custom' | 'none';

function splitToOption(split: WorkoutSplit | undefined | null): SplitOption {
  if (!split) return 'none';
  return split.__kind__ as SplitOption;
}

function optionToSplit(option: SplitOption, customText: string): WorkoutSplit | null {
  if (option === 'none') return null;
  if (option === 'custom') return { __kind__: 'custom', custom: customText };
  if (option === 'pushPullLegs') return { __kind__: 'pushPullLegs', pushPullLegs: null };
  if (option === 'upperLower') return { __kind__: 'upperLower', upperLower: null };
  if (option === 'fullBody') return { __kind__: 'fullBody', fullBody: null };
  if (option === 'broSplit') return { __kind__: 'broSplit', broSplit: null };
  return null;
}

function splitLabel(split: WorkoutSplit | undefined | null): string {
  if (!split) return '—';
  switch (split.__kind__) {
    case 'pushPullLegs': return 'Push / Pull / Legs';
    case 'upperLower': return 'Upper / Lower';
    case 'fullBody': return 'Full Body';
    case 'broSplit': return 'Bro Split';
    case 'custom': return split.custom || 'Custom';
    default: return '—';
  }
}

export default function FitnessProfileForm({ userProfile }: FitnessProfileFormProps) {
  const updateFitness = useUpdateFitnessProfile();

  const [bodyWeight, setBodyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [splitOption, setSplitOption] = useState<SplitOption>('none');
  const [customSplit, setCustomSplit] = useState('');

  useEffect(() => {
    if (userProfile) {
      setBodyWeight(userProfile.bodyWeight != null ? String(userProfile.bodyWeight) : '');
      setHeight(userProfile.height != null ? String(userProfile.height) : '');
      setGoalWeight(userProfile.goalWeight != null ? String(userProfile.goalWeight) : '');
      const opt = splitToOption(userProfile.workoutSplit);
      setSplitOption(opt);
      if (opt === 'custom' && userProfile.workoutSplit?.__kind__ === 'custom') {
        setCustomSplit((userProfile.workoutSplit as any).custom || '');
      }
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bw = bodyWeight ? parseFloat(bodyWeight) : null;
    const h = height ? parseFloat(height) : null;
    const gw = goalWeight ? parseFloat(goalWeight) : null;

    if ((bw !== null && bw <= 0) || (h !== null && h <= 0) || (gw !== null && gw <= 0)) {
      toast.error('All values must be positive numbers');
      return;
    }

    const split = optionToSplit(splitOption, customSplit);

    try {
      await updateFitness.mutateAsync({ bodyWeight: bw, height: h, goalWeight: gw, workoutSplit: split });
      toast.success('Fitness profile updated!');
    } catch {
      toast.error('Failed to update fitness profile');
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="w-4 h-4 text-fitness-accent" />
        <h3 className="font-semibold text-sm text-foreground">Fitness Profile</h3>
      </div>

      {userProfile?.workoutSplit && (
        <div className="mb-3 text-xs text-muted-foreground">
          Current split: <span className="text-fitness-accent font-medium">{splitLabel(userProfile.workoutSplit)}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="70"
              value={bodyWeight}
              onChange={e => setBodyWeight(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Height (cm)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="175"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Goal (kg)</Label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="65"
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Workout Split</Label>
          <Select value={splitOption} onValueChange={v => setSplitOption(v as SplitOption)}>
            <SelectTrigger className="h-8 text-sm mt-1">
              <SelectValue placeholder="Select split..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None / Not set</SelectItem>
              <SelectItem value="pushPullLegs">Push / Pull / Legs (PPL)</SelectItem>
              <SelectItem value="upperLower">Upper / Lower</SelectItem>
              <SelectItem value="fullBody">Full Body</SelectItem>
              <SelectItem value="broSplit">Bro Split</SelectItem>
              <SelectItem value="custom">Custom…</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {splitOption === 'custom' && (
          <div>
            <Label className="text-xs text-muted-foreground">Describe your split</Label>
            <Input
              type="text"
              placeholder="e.g. Chest/Back, Shoulders/Arms, Legs"
              value={customSplit}
              onChange={e => setCustomSplit(e.target.value)}
              className="h-8 text-sm mt-1"
            />
          </div>
        )}

        <Button
          type="submit"
          size="sm"
          className="w-full bg-fitness-accent hover:bg-fitness-accent/90 text-white"
          disabled={updateFitness.isPending}
        >
          {updateFitness.isPending ? 'Saving…' : 'Save Fitness Profile'}
        </Button>
      </form>
    </div>
  );
}
