import { useState } from 'react';
import { useUpdateFitnessGoal } from '../hooks/useQueries';
import { FitnessGoal, type UserProfile } from '../backend';
import { toast } from 'sonner';

interface Props {
  userProfile: UserProfile | null;
}

export default function GoalSelector({ userProfile }: Props) {
  const { mutateAsync: updateGoal, isPending } = useUpdateFitnessGoal();
  const [optimisticGoal, setOptimisticGoal] = useState<FitnessGoal | null>(null);

  const currentGoal = optimisticGoal ?? userProfile?.fitnessGoal ?? FitnessGoal.bulk;

  const handleGoalChange = async (goal: FitnessGoal) => {
    if (isPending || goal === currentGoal) return;
    const previousGoal = optimisticGoal ?? userProfile?.fitnessGoal ?? FitnessGoal.bulk;
    setOptimisticGoal(goal);
    try {
      await updateGoal(goal);
      toast.success(`Goal updated to ${goal === FitnessGoal.cut ? 'Cut' : 'Bulk'}`);
    } catch {
      setOptimisticGoal(previousGoal);
      toast.error('Failed to update goal. Please try again.');
    }
  };

  return (
    <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
      {[
        { value: FitnessGoal.cut, label: 'Cut' },
        { value: FitnessGoal.bulk, label: 'Bulk' },
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
