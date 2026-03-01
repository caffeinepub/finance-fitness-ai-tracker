import { TrendingUp, TrendingDown, Bookmark, Package } from 'lucide-react';
import type { Transaction } from '../backend';
import { Variant_saving_other_investment_needs } from '../backend';

interface Props {
  transactions: Transaction[];
  currency: string;
}

const CATEGORY_CONFIG = {
  [Variant_saving_other_investment_needs.needs]: { label: 'Needs', icon: TrendingDown, color: 'text-destructive', bg: 'bg-destructive/10' },
  [Variant_saving_other_investment_needs.saving]: { label: 'Saving', icon: Bookmark, color: 'text-primary-accent', bg: 'bg-primary-accent/10' },
  [Variant_saving_other_investment_needs.investment]: { label: 'Investment', icon: TrendingUp, color: 'text-fitness-accent', bg: 'bg-fitness-accent/10' },
  [Variant_saving_other_investment_needs.other]: { label: 'Other', icon: Package, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export default function TransactionList({ transactions, currency }: Props) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No transactions yet</p>
        <p className="text-sm mt-1">Tap "Add Transaction" to get started</p>
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2">
      {sorted.map((t, i) => {
        const config = CATEGORY_CONFIG[t.category];
        const Icon = config.icon;
        return (
          <div key={i} className="bg-card rounded-xl p-3 border border-border flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{t.description}</p>
              <p className="text-xs text-muted-foreground">{config.label} · {t.date}</p>
            </div>
            <span className={`text-sm font-bold flex-shrink-0 ${config.color}`}>
              {currency}{t.amount.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
