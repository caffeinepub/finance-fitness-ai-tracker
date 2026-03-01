import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import type { Transaction } from '../backend';
import { Variant_saving_other_investment_needs } from '../backend';

interface Props {
  transactions: Transaction[];
  currency: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  [Variant_saving_other_investment_needs.needs]: 'bg-destructive',
  [Variant_saving_other_investment_needs.saving]: 'bg-primary-accent',
  [Variant_saving_other_investment_needs.investment]: 'bg-fitness-accent',
  [Variant_saving_other_investment_needs.other]: 'bg-muted-foreground',
};

export default function FinanceCalendar({ transactions, currency }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const txByDate: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!txByDate[t.date]) txByDate[t.date] = [];
    txByDate[t.date].push(t);
  });

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const todayStr = today.toISOString().split('T')[0];
  const selectedTxs = selectedDate ? (txByDate[selectedDate] ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-foreground">{monthName}</span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = formatDate(day);
            const dayTxs = txByDate[dateStr] ?? [];
            const hasTx = dayTxs.length > 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-finance-accent text-white'
                    : isToday
                    ? 'bg-primary-accent/20 text-primary-accent'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {day}
                {hasTx && !isSelected && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {dayTxs.slice(0, 3).map((t, ti) => (
                      <span key={ti} className={`w-1 h-1 rounded-full ${CATEGORY_COLORS[t.category]}`} />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
          {[
            { label: 'Needs', color: 'bg-destructive' },
            { label: 'Saving', color: 'bg-primary-accent' },
            { label: 'Invest', color: 'bg-fitness-accent' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Detail */}
      {selectedDate && selectedTxs.length > 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border space-y-2">
          <p className="text-sm font-bold text-foreground">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {selectedTxs.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg bg-finance-accent/10 flex items-center justify-center`}>
                <TrendingUp className="w-4 h-4 text-finance-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{t.description}</p>
                <p className="text-xs text-muted-foreground capitalize">{t.category}</p>
              </div>
              <span className="text-sm font-bold text-finance-accent">{currency}{t.amount.toFixed(2)}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="text-xs text-muted-foreground font-semibold">Day Total</span>
            <span className="text-sm font-black text-foreground">
              {currency}{selectedTxs.reduce((s, t) => s + t.amount, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {selectedDate && selectedTxs.length === 0 && (
        <div className="bg-card rounded-2xl p-4 border border-border text-center text-muted-foreground text-sm">
          No transactions on this day.
        </div>
      )}
    </div>
  );
}
