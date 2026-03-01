import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Variant_cut_bulk } from '../backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, TrendingUp, DollarSign, Briefcase, Weight, Ruler, Target } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD'];

export default function ProfileSetupModal({ onComplete }: Props) {
  const [goal, setGoal] = useState<Variant_cut_bulk>(Variant_cut_bulk.bulk);
  const [currency, setCurrency] = useState('USD');
  // Finance optional fields
  const [income, setIncome] = useState('');
  const [profession, setProfession] = useState('');
  // Fitness optional fields
  const [bodyWeight, setBodyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');

  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const parseOptionalPositive = (val: string): number | undefined => {
    if (val.trim() === '') return undefined;
    const n = parseFloat(val);
    return isNaN(n) || n <= 0 ? undefined : n;
  };

  const handleSubmit = async () => {
    const incomeVal = parseOptionalPositive(income);
    const professionVal = profession.trim() !== '' ? profession.trim() : undefined;
    const bodyWeightVal = parseOptionalPositive(bodyWeight);
    const heightVal = parseOptionalPositive(height);
    const goalWeightVal = parseOptionalPositive(goalWeight);

    await saveProfile({
      fitnessGoal: goal,
      preferredCurrency: currency,
      income: incomeVal,
      profession: professionVal,
      bodyWeight: bodyWeightVal,
      height: heightVal,
      goalWeight: goalWeightVal,
    });
    onComplete();
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-sm rounded-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <img src="/assets/generated/finfit-logo.dim_256x256.png" alt="FinFit" className="w-8 h-8 rounded-lg" />
            <DialogTitle className="text-xl font-black">Welcome to FinFit!</DialogTitle>
          </div>
          <DialogDescription>
            Set up your profile to personalize your experience. Finance and fitness fields are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Fitness Goal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-fitness-accent" />
              Fitness Goal
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: Variant_cut_bulk.cut, label: 'Cut', desc: 'Lose fat, lean out' },
                { value: Variant_cut_bulk.bulk, label: 'Bulk', desc: 'Build muscle, gain mass' },
              ].map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setGoal(value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    goal === value
                      ? 'border-fitness-accent bg-fitness-accent/10'
                      : 'border-border bg-card hover:border-fitness-accent/50'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-finance-accent" />
              Preferred Currency
            </p>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    currency === c
                      ? 'border-finance-accent bg-finance-accent/10 text-finance-accent'
                      : 'border-border bg-card text-muted-foreground hover:border-finance-accent/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Finance Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-finance-accent" />
              Finance Profile
              <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="setup-income" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-finance-accent" />
                  Monthly Income
                </Label>
                <Input
                  id="setup-income"
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
                <Label htmlFor="setup-profession" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-finance-accent" />
                  Profession
                </Label>
                <Input
                  id="setup-profession"
                  type="text"
                  placeholder="e.g. Engineer"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="h-9 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Fitness Body Metrics Section */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Weight className="w-4 h-4 text-fitness-accent" />
              Body Metrics
              <span className="text-xs font-normal text-muted-foreground ml-1">(optional)</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="setup-bodyweight" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Weight className="w-3 h-3 text-fitness-accent" />
                  Weight (kg)
                </Label>
                <Input
                  id="setup-bodyweight"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="75"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  className="h-9 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-height" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-primary-accent" />
                  Height (cm)
                </Label>
                <Input
                  id="setup-height"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="h-9 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="setup-goalweight" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Target className="w-3 h-3 text-finance-accent" />
                  Goal (kg)
                </Label>
                <Input
                  id="setup-goalweight"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="70"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  className="h-9 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full h-11 bg-primary-accent hover:bg-primary-accent/90 text-white rounded-xl font-semibold"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Get Started'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
