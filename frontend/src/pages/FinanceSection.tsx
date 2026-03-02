import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, List, Sparkles, X } from 'lucide-react';
import TransactionLogForm from '../components/TransactionLogForm';
import TransactionList from '../components/TransactionList';
import FinanceAISuggestions from '../components/FinanceAISuggestions';
import FinanceProfileForm from '../components/FinanceProfileForm';
import CurrencySelector from '../components/CurrencySelector';
import { useGetTransactions } from '../hooks/useQueries';
import type { UserProfile } from '../backend';
import { Variant_saving_other_investment_needs } from '../backend';

interface FinanceSectionProps {
  userProfile: UserProfile | null;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹',
};

export default function FinanceSection({ userProfile }: FinanceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { data: transactions = [] } = useGetTransactions();

  const currency = userProfile?.preferredCurrency ?? 'USD';
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const totalSavings = transactions
    .filter(t => t.category === Variant_saving_other_investment_needs.saving)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestment = transactions
    .filter(t => t.category === Variant_saving_other_investment_needs.investment)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-lg font-bold text-finance-accent">{symbol}{totalSpend.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Total</div>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-lg font-bold text-primary-accent">{symbol}{totalSavings.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Savings</div>
        </div>
        <div className="bg-card rounded-2xl p-3 border border-border text-center">
          <div className="text-lg font-bold text-fitness-accent">{symbol}{totalInvestment.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Invested</div>
        </div>
      </div>

      {/* Finance Profile */}
      <FinanceProfileForm userProfile={userProfile} />

      {/* Currency Selector */}
      <CurrencySelector userProfile={userProfile} />

      {/* Add Transaction Button */}
      <Button
        onClick={() => setShowForm(v => !v)}
        className="w-full bg-finance-accent hover:bg-finance-accent/90 text-white flex items-center gap-2"
      >
        {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {showForm ? 'Cancel' : 'Add Transaction'}
      </Button>

      {showForm && (
        <TransactionLogForm
          currency={symbol}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Tabs: List and AI (calendar removed) */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="list" className="flex items-center gap-1.5 text-xs">
            <List className="w-3.5 h-3.5" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Advisor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-3">
          <TransactionList transactions={transactions} currency={symbol} />
        </TabsContent>

        <TabsContent value="ai" className="mt-3">
          <FinanceAISuggestions
            transactions={transactions}
            currency={symbol}
            userProfile={userProfile}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
