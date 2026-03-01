import { useState } from 'react';
import { TrendingUp, Plus, Brain, Calendar as CalendarIcon, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useGetTransactions } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import CurrencySelector from '../components/CurrencySelector';
import TransactionLogForm from '../components/TransactionLogForm';
import FinanceAISuggestions from '../components/FinanceAISuggestions';
import FinanceCalendar from '../components/FinanceCalendar';
import TransactionList from '../components/TransactionList';
import FinanceProfileForm from '../components/FinanceProfileForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Variant_saving_other_investment_needs } from '../backend';

interface Props {
  userProfile: UserProfile | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$',
};

export default function FinanceSection({ userProfile }: Props) {
  const { data: transactions = [] } = useGetTransactions();
  const [txDialogOpen, setTxDialogOpen] = useState(false);

  const currency = userProfile?.preferredCurrency ?? 'USD';
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const totalSavings = transactions
    .filter(t => t.category === Variant_saving_other_investment_needs.saving)
    .reduce((s, t) => s + t.amount, 0);

  const totalInvestment = transactions
    .filter(t => t.category === Variant_saving_other_investment_needs.investment)
    .reduce((s, t) => s + t.amount, 0);

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-finance-accent" />
          Finance
        </h2>
        <CurrencySelector userProfile={userProfile} />
      </div>

      {/* Finance Profile Form */}
      <FinanceProfileForm userProfile={userProfile} />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-lg font-black text-finance-accent">{symbol}{totalSpend.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Total</p>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-lg font-black text-primary-accent">{symbol}{totalSavings.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Savings</p>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <p className="text-lg font-black text-fitness-accent">{symbol}{totalInvestment.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Invested</p>
        </div>
      </div>

      {/* Add Transaction */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-11 bg-finance-accent hover:bg-finance-accent/90 text-white rounded-xl font-semibold gap-2">
            <Plus className="w-4 h-4" />
            Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-finance-accent" />
              Add Transaction
            </DialogTitle>
          </DialogHeader>
          <TransactionLogForm
            currency={symbol}
            onSuccess={() => setTxDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl bg-muted h-10">
          <TabsTrigger value="ai" className="rounded-lg text-xs font-semibold gap-1">
            <Brain className="w-3.5 h-3.5" />
            AI Advisor
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg text-xs font-semibold gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg text-xs font-semibold gap-1">
            <List className="w-3.5 h-3.5" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          <FinanceAISuggestions
            transactions={transactions}
            currency={symbol}
            userProfile={userProfile}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <FinanceCalendar transactions={transactions} currency={symbol} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <TransactionList transactions={transactions} currency={symbol} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
