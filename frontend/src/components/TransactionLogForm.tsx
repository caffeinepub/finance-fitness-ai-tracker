import { useState } from 'react';
import { useLogTransaction } from '../hooks/useQueries';
import { Variant_saving_other_investment_needs } from '../backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Props {
  currency: string;
  onSuccess: () => void;
}

const CATEGORIES = [
  { value: Variant_saving_other_investment_needs.needs, label: 'Needs', emoji: '🛒' },
  { value: Variant_saving_other_investment_needs.saving, label: 'Saving', emoji: '🏦' },
  { value: Variant_saving_other_investment_needs.investment, label: 'Investment', emoji: '📈' },
  { value: Variant_saving_other_investment_needs.other, label: 'Other', emoji: '📦' },
];

export default function TransactionLogForm({ currency, onSuccess }: Props) {
  const { mutateAsync: logTransaction, isPending } = useLogTransaction();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: Variant_saving_other_investment_needs.needs as Variant_saving_other_investment_needs,
    date: today,
  });

  const set = (key: string, value: string | Variant_saving_other_investment_needs) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await logTransaction({
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
      });
      toast.success('Transaction added!');
      onSuccess();
    } catch {
      toast.error('Failed to add transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</Label>
        <Input
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="e.g. Grocery shopping"
          className="rounded-xl h-10"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Amount ({currency})</Label>
        <Input
          type="number" min="0" step="0.01"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          placeholder="0.00"
          className="rounded-xl h-10"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</Label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('category', value)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                form.category === value
                  ? 'border-finance-accent bg-finance-accent/10'
                  : 'border-border bg-card hover:border-finance-accent/50'
              }`}
            >
              <span className="text-base">{emoji}</span>
              <p className="text-xs font-semibold text-foreground mt-0.5">{label}</p>
            </button>
          ))}
        </div>
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
        className="w-full h-11 bg-finance-accent hover:bg-finance-accent/90 text-white rounded-xl font-semibold"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding...
          </span>
        ) : 'Add Transaction'}
      </Button>
    </form>
  );
}
