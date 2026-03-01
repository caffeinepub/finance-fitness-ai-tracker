import { useSaveCallerUserProfile } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

interface Props {
  userProfile: UserProfile | null;
}

export default function CurrencySelector({ userProfile }: Props) {
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleChange = async (currency: string) => {
    if (!userProfile || isPending) return;
    try {
      await saveProfile({ ...userProfile, preferredCurrency: currency });
      toast.success(`Currency set to ${currency}`);
    } catch {
      toast.error('Failed to update currency');
    }
  };

  return (
    <Select
      value={userProfile?.preferredCurrency ?? 'USD'}
      onValueChange={handleChange}
      disabled={isPending || !userProfile}
    >
      <SelectTrigger className="w-24 h-8 rounded-xl text-xs font-bold border-2">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map(c => (
          <SelectItem key={c} value={c} className="text-xs font-semibold">{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
