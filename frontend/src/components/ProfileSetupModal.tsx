import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Variant_cut_bulk } from '../backend';
import type { WorkoutSplit } from '../backend';

interface ProfileSetupModalProps {
  open: boolean;
}

type SplitOption = 'pushPullLegs' | 'upperLower' | 'fullBody' | 'broSplit' | 'custom' | 'none';

function optionToSplit(option: SplitOption, customText: string): WorkoutSplit | undefined {
  if (option === 'none') return undefined;
  if (option === 'custom') return { __kind__: 'custom', custom: customText };
  if (option === 'pushPullLegs') return { __kind__: 'pushPullLegs', pushPullLegs: null };
  if (option === 'upperLower') return { __kind__: 'upperLower', upperLower: null };
  if (option === 'fullBody') return { __kind__: 'fullBody', fullBody: null };
  if (option === 'broSplit') return { __kind__: 'broSplit', broSplit: null };
  return undefined;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [income, setIncome] = useState('');
  const [profession, setProfession] = useState('');
  const [bodyWeight, setBodyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [splitOption, setSplitOption] = useState<SplitOption>('none');
  const [customSplit, setCustomSplit] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const workoutSplit = optionToSplit(splitOption, customSplit);

    await saveProfile.mutateAsync({
      preferredCurrency: currency,
      fitnessGoal: Variant_cut_bulk.bulk,
      income: income ? parseFloat(income) : undefined,
      profession: profession || undefined,
      bodyWeight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      height: height ? parseFloat(height) : undefined,
      goalWeight: goalWeight ? parseFloat(goalWeight) : undefined,
      workoutSplit: workoutSplit,
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Welcome to FinFit! 🎉</DialogTitle>
          <DialogDescription>
            Let's set up your profile to personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Basic Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Basic Info</h3>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Your Name *</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency" className="text-sm font-medium">Preferred Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD (C$)</SelectItem>
                  <SelectItem value="AUD">AUD (A$)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Finance */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Finance <span className="text-muted-foreground font-normal">(optional)</span></h3>
            <div>
              <Label htmlFor="income" className="text-sm font-medium">Monthly Income</Label>
              <Input
                id="income"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 3000"
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="profession" className="text-sm font-medium">Profession</Label>
              <Input
                id="profession"
                placeholder="e.g. Software Engineer"
                value={profession}
                onChange={e => setProfession(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Fitness */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1">Fitness <span className="text-muted-foreground font-normal">(optional)</span></h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="70"
                  value={bodyWeight}
                  onChange={e => setBodyWeight(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="175"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Goal (kg)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="65"
                  value={goalWeight}
                  onChange={e => setGoalWeight(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Workout Split</Label>
              <Select value={splitOption} onValueChange={v => setSplitOption(v as SplitOption)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your split..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Not set</SelectItem>
                  <SelectItem value="pushPullLegs">Push / Pull / Legs (PPL)</SelectItem>
                  <SelectItem value="upperLower">Upper / Lower</SelectItem>
                  <SelectItem value="fullBody">Full Body</SelectItem>
                  <SelectItem value="broSplit">Bro Split</SelectItem>
                  <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {splitOption === 'custom' && (
              <div>
                <Label className="text-xs text-muted-foreground">Describe your split</Label>
                <Input
                  type="text"
                  placeholder="e.g. Chest/Back, Shoulders/Arms, Legs"
                  value={customSplit}
                  onChange={e => setCustomSplit(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Setting up…' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
