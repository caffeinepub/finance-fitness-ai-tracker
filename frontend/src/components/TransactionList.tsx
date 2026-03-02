import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Briefcase, HelpCircle } from 'lucide-react';
import type { Transaction, Variant_saving_other_investment_needs } from '../backend';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  needs: {
    icon: <TrendingDown className="w-4 h-4" />,
    color: 'text-red-400',
    label: 'Needs',
  },
  saving: {
    icon: <PiggyBank className="w-4 h-4" />,
    color: 'text-blue-400',
    label: 'Saving',
  },
  investment: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-green-500',
    label: 'Investment',
  },
  other: {
    icon: <HelpCircle className="w-4 h-4" />,
    color: 'text-muted-foreground',
    label: 'Other',
  },
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TransactionList({ transactions, currency }: TransactionListProps) {
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹',
  };
  const symbol = symbols[currency] ?? currency + ' ';

  const formatAmount = (amount: number) =>
    `${amount >= 0 ? '+' : '-'}${symbol}${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sorted = [...transactions].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No transactions yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add your first transaction above.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {sorted.map((t, idx) => {
          const cat = t.category as string;
          const config = categoryConfig[cat] ?? categoryConfig.other;
          const isPositive = t.amount >= 0;

          return (
            <div key={idx} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
              {/* Category Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${config.color}`}>
                {config.icon}
              </div>

              {/* Description + Date + Category */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{t.description}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{formatDate(t.date)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
              </div>

              {/* Amount */}
              <div className={`flex-shrink-0 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-400'}`}>
                {formatAmount(t.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
