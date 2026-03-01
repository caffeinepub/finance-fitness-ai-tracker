import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Variant_cut_bulk, type UserProfile } from '../backend';
import { toast } from 'sonner';

interface Props {
  userProfile: UserProfile | null;
}

export default function GoalSelector({ userProfile }: Props) {
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();
  const [optimisticGoal, setOptimisticGoal] = useState<Variant_cut_bulk | null>(null);

  const currentGoal = optimisticGoal ?? userProfile?.fitnessGoal ?? Variant_cut_bulk.bulk;

  const handleGoalChange = async (goal: Variant_cut_bulk) => {
    if (!userProfile || isPending) return;
    setOptimisticGoal(goal);
    try {
      await saveProfile({ ...userProfile, fitnessGoal: goal });
      toast.success(`Goal updated to ${goal === Variant_cut_bulk.cut ? 'Cut' : 'Bulk'}`);
    } catch {
      setOptimisticGoal(null);
      toast.error('Failed to update goal');
    }
  };

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {[
        { value: Variant_cut_bulk.cut, label: 'Cut' },
        { value: Variant_cut_bulk.bulk, label: 'Bulk' },
      ].map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleGoalChange(value)}
          disabled={isPending}
          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
            currentGoal === value
              ? 'bg-fitness-accent text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
