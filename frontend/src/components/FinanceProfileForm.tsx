import { useState, useEffect } from 'react';
import { DollarSign, Briefcase, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateFinanceProfile } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { toast } from 'sonner';

interface Props {
  userProfile: UserProfile | null;
}

export default function FinanceProfileForm({ userProfile }: Props) {
  const [income, setIncome] = useState('');
  const [profession, setProfession] = useState('');
  const { mutateAsync: updateFinanceProfile, isPending } = useUpdateFinanceProfile();

  useEffect(() => {
    if (userProfile) {
      setIncome(userProfile.income != null ? String(userProfile.income) : '');
      setProfession(userProfile.profession ?? '');
    }
  }, [userProfile]);

  const handleSave = async () => {
    const incomeVal = income.trim() !== '' ? parseFloat(income) : null;
    if (incomeVal !== null && (isNaN(incomeVal) || incomeVal <= 0)) {
      toast.error('Income must be a positive number.');
      return;
    }
    const professionVal = profession.trim() !== '' ? profession.trim() : null;
    try {
      await updateFinanceProfile({ income: incomeVal, profession: professionVal });
      toast.success('Finance profile saved!');
    } catch {
      toast.error('Failed to save finance profile.');
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 border border-border space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5 text-finance-accent" />
        Your Finance Profile
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="income" className="text-xs font-semibold text-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-finance-accent" />
            Monthly Income
          </Label>
          <Input
            id="income"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 5000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="h-9 rounded-xl text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profession" className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-finance-accent" />
            Profession
          </Label>
          <Input
            id="profession"
            type="text"
            placeholder="e.g. Engineer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="h-9 rounded-xl text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending}
        size="sm"
        className="w-full h-9 bg-finance-accent hover:bg-finance-accent/90 text-white rounded-xl font-semibold gap-2"
      >
        {isPending ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-3.5 h-3.5" />
            Save Finance Profile
          </>
        )}
      </Button>
    </div>
  );
}
