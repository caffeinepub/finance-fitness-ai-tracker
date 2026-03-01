import { Lightbulb, PiggyBank, TrendingUp, ShoppingCart, CheckCircle, AlertCircle, Info } from 'lucide-react';
import type { Transaction, UserProfile } from '../backend';
import { Variant_saving_other_investment_needs } from '../backend';

interface Props {
  transactions: Transaction[];
  currency: string;
  userProfile?: UserProfile | null;
}

function generateFinanceSuggestions(
  transactions: Transaction[],
  income: number | null,
  profession: string | null
) {
  const total = transactions.reduce((s, t) => s + t.amount, 0);

  const byCategory = {
    needs: transactions.filter(t => t.category === Variant_saving_other_investment_needs.needs).reduce((s, t) => s + t.amount, 0),
    saving: transactions.filter(t => t.category === Variant_saving_other_investment_needs.saving).reduce((s, t) => s + t.amount, 0),
    investment: transactions.filter(t => t.category === Variant_saving_other_investment_needs.investment).reduce((s, t) => s + t.amount, 0),
    other: transactions.filter(t => t.category === Variant_saving_other_investment_needs.other).reduce((s, t) => s + t.amount, 0),
  };

  const pct = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;

  // 50/30/20 rule targets
  const targets = { needs: 50, saving: 20, investment: 20, other: 10 };
  const actual = {
    needs: pct(byCategory.needs),
    saving: pct(byCategory.saving),
    investment: pct(byCategory.investment),
    other: pct(byCategory.other),
  };

  // Income-based budget targets
  const incomeTargets = income
    ? {
        needs: income * 0.5,
        saving: income * 0.2,
        investment: income * 0.2,
        other: income * 0.1,
      }
    : null;

  const suggestions: { text: string; type: 'good' | 'warn' | 'info' }[] = [];

  // Profession-specific tips
  if (profession) {
    const p = profession.toLowerCase();
    if (p.includes('freelan') || p.includes('self-employ') || p.includes('contractor')) {
      suggestions.push({ text: `As a ${profession}, set aside 25–30% of income for taxes and build a 6-month emergency fund.`, type: 'info' });
    } else if (p.includes('doctor') || p.includes('physician') || p.includes('surgeon')) {
      suggestions.push({ text: `As a ${profession}, consider maxing out tax-advantaged retirement accounts (401k, IRA) and explore malpractice insurance costs.`, type: 'info' });
    } else if (p.includes('engineer') || p.includes('developer') || p.includes('software')) {
      suggestions.push({ text: `As a ${profession}, leverage employer stock options and 401k matching — these can significantly boost your net worth.`, type: 'info' });
    } else if (p.includes('teacher') || p.includes('educator') || p.includes('professor')) {
      suggestions.push({ text: `As a ${profession}, explore 403(b) plans and public service loan forgiveness programs if applicable.`, type: 'info' });
    } else {
      suggestions.push({ text: `As a ${profession}, review your employer benefits package — many people leave free money on the table.`, type: 'info' });
    }
  }

  if (total === 0) {
    suggestions.push({ text: 'Add your first transaction to get personalized financial advice.', type: 'warn' });
  } else {
    if (actual.saving < targets.saving) {
      const extra = incomeTargets
        ? `Target: save ${incomeTargets.saving.toFixed(0)} / month.`
        : `Try to save ${Math.round((targets.saving - actual.saving) / 100 * total)} more.`;
      suggestions.push({ text: `Savings at ${actual.saving}% — target is 20%. ${extra}`, type: 'warn' });
    } else {
      suggestions.push({ text: `Great savings rate at ${actual.saving}%! You're above the 20% target.`, type: 'good' });
    }

    if (actual.investment < targets.investment) {
      const extra = incomeTargets
        ? `Aim to invest ${incomeTargets.investment.toFixed(0)} / month.`
        : 'Consider allocating more to grow wealth long-term.';
      suggestions.push({ text: `Investment at ${actual.investment}% — ${extra}`, type: 'warn' });
    } else {
      suggestions.push({ text: `Strong investment allocation at ${actual.investment}%. Keep compounding!`, type: 'good' });
    }

    if (actual.needs > targets.needs) {
      const extra = incomeTargets
        ? `Your needs budget should be ≤ ${incomeTargets.needs.toFixed(0)} / month.`
        : 'Review recurring expenses.';
      suggestions.push({ text: `Needs spending at ${actual.needs}% — above the 50% guideline. ${extra}`, type: 'warn' });
    } else {
      suggestions.push({ text: `Needs spending is well-controlled at ${actual.needs}%.`, type: 'good' });
    }

    if (income) {
      const savingsRate = (byCategory.saving / income) * 100;
      if (savingsRate >= 20) {
        suggestions.push({ text: `You're saving ${savingsRate.toFixed(1)}% of your income — excellent financial discipline!`, type: 'good' });
      }
    }
  }

  // Monthly data
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthTransactions = transactions.filter(t => t.date >= monthStart);
  const monthTotal = monthTransactions.reduce((s, t) => s + t.amount, 0);

  return { total, byCategory, actual, targets, suggestions, monthTotal, monthTransactions, incomeTargets };
}

export default function FinanceAISuggestions({ transactions, currency, userProfile }: Props) {
  const income = userProfile?.income ?? null;
  const profession = userProfile?.profession ?? null;
  const hasProfile = income != null || profession != null;

  const { total, byCategory, actual, targets, suggestions, monthTotal, incomeTargets } =
    generateFinanceSuggestions(transactions, income, profession);

  const categories = [
    {
      key: 'needs',
      label: 'Needs',
      icon: ShoppingCart,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      amount: byCategory.needs,
      actual: actual.needs,
      target: targets.needs,
      incomeTarget: incomeTargets?.needs,
    },
    {
      key: 'saving',
      label: 'Saving',
      icon: PiggyBank,
      color: 'text-primary-accent',
      bg: 'bg-primary-accent/10',
      amount: byCategory.saving,
      actual: actual.saving,
      target: targets.saving,
      incomeTarget: incomeTargets?.saving,
    },
    {
      key: 'investment',
      label: 'Invest',
      icon: TrendingUp,
      color: 'text-fitness-accent',
      bg: 'bg-fitness-accent/10',
      amount: byCategory.investment,
      actual: actual.investment,
      target: targets.investment,
      incomeTarget: incomeTargets?.investment,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Profile prompt */}
      {!hasProfile && (
        <div className="bg-finance-accent/5 border border-finance-accent/30 rounded-2xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-finance-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Personalize your advice:</span> Enter your income and profession in the Finance Profile above to get tailored budget targets and career-specific tips.
          </p>
        </div>
      )}

      {/* Income summary */}
      {income != null && (
        <div className="bg-finance-accent/5 border border-finance-accent/30 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Income</p>
            <p className="text-xl font-black text-finance-accent">{currency}{income.toLocaleString()}</p>
          </div>
          {profession && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Profession</p>
              <p className="text-sm font-semibold text-foreground">{profession}</p>
            </div>
          )}
        </div>
      )}

      {/* Monthly Summary */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">This Month</p>
        <p className="text-3xl font-black text-foreground">{currency}{monthTotal.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">
          Total tracked spending
          {income != null && (
            <span className={`ml-2 font-semibold ${monthTotal <= income ? 'text-fitness-accent' : 'text-destructive'}`}>
              ({((monthTotal / income) * 100).toFixed(0)}% of income)
            </span>
          )}
        </p>
      </div>

      {/* Allocation Breakdown */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Expense Allocation (50/30/20 Rule)
        </p>
        <div className="space-y-3">
          {categories.map(({ key, label, icon: Icon, color, bg, amount, actual: act, target, incomeTarget }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${color}`}>{act}%</span>
                  <span className="text-xs text-muted-foreground ml-1">/ {target}% target</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${act <= target ? 'bg-fitness-accent' : 'bg-destructive'}`}
                  style={{ width: `${Math.min(act, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-muted-foreground">{currency}{amount.toFixed(2)}</p>
                {incomeTarget != null && (
                  <p className="text-xs text-muted-foreground">Budget: {currency}{incomeTarget.toFixed(0)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-finance-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Financial Insights</p>
        </div>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              {s.type === 'good' ? (
                <CheckCircle className="w-4 h-4 text-fitness-accent mt-0.5 flex-shrink-0" />
              ) : s.type === 'info' ? (
                <Info className="w-4 h-4 text-finance-accent mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-primary-accent mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm text-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
