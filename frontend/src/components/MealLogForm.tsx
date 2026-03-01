import { useState } from 'react';
import { useLogMeal } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

// ─── Calorie Estimation Heuristic ────────────────────────────────────────────

interface FoodEntry {
  keywords: string[];
  caloriesPer100g: number;
}

const FOOD_DATABASE: FoodEntry[] = [
  { keywords: ['chicken breast', 'chicken fillet'], caloriesPer100g: 165 },
  { keywords: ['chicken thigh', 'chicken leg'], caloriesPer100g: 209 },
  { keywords: ['chicken', 'poultry'], caloriesPer100g: 185 },
  { keywords: ['salmon', 'tuna', 'fish fillet'], caloriesPer100g: 208 },
  { keywords: ['fish', 'seafood', 'shrimp', 'prawn'], caloriesPer100g: 120 },
  { keywords: ['beef steak', 'steak'], caloriesPer100g: 271 },
  { keywords: ['ground beef', 'minced beef', 'beef mince'], caloriesPer100g: 250 },
  { keywords: ['beef', 'pork', 'lamb', 'meat'], caloriesPer100g: 250 },
  { keywords: ['white rice', 'jasmine rice', 'basmati rice'], caloriesPer100g: 130 },
  { keywords: ['brown rice'], caloriesPer100g: 112 },
  { keywords: ['rice'], caloriesPer100g: 130 },
  { keywords: ['pasta', 'spaghetti', 'noodles', 'macaroni'], caloriesPer100g: 158 },
  { keywords: ['bread', 'toast', 'baguette', 'roll'], caloriesPer100g: 265 },
  { keywords: ['potato', 'potatoes', 'fries', 'chips'], caloriesPer100g: 77 },
  { keywords: ['sweet potato'], caloriesPer100g: 86 },
  { keywords: ['oats', 'oatmeal', 'porridge'], caloriesPer100g: 389 },
  { keywords: ['egg', 'eggs', 'omelette', 'scrambled'], caloriesPer100g: 155 },
  { keywords: ['cheese', 'cheddar', 'mozzarella'], caloriesPer100g: 402 },
  { keywords: ['milk', 'dairy'], caloriesPer100g: 61 },
  { keywords: ['yogurt', 'yoghurt'], caloriesPer100g: 59 },
  { keywords: ['avocado'], caloriesPer100g: 160 },
  { keywords: ['banana'], caloriesPer100g: 89 },
  { keywords: ['apple', 'pear', 'orange', 'fruit'], caloriesPer100g: 52 },
  { keywords: ['salad', 'lettuce', 'spinach', 'greens'], caloriesPer100g: 20 },
  { keywords: ['broccoli', 'cauliflower', 'vegetables', 'veggies'], caloriesPer100g: 34 },
  { keywords: ['burger', 'hamburger', 'cheeseburger'], caloriesPer100g: 295 },
  { keywords: ['pizza'], caloriesPer100g: 266 },
  { keywords: ['sandwich', 'wrap', 'sub'], caloriesPer100g: 220 },
  { keywords: ['soup', 'stew'], caloriesPer100g: 60 },
  { keywords: ['nuts', 'almonds', 'peanuts', 'cashews', 'walnuts'], caloriesPer100g: 580 },
  { keywords: ['peanut butter', 'almond butter'], caloriesPer100g: 588 },
  { keywords: ['olive oil', 'oil', 'butter'], caloriesPer100g: 884 },
  { keywords: ['chocolate', 'brownie', 'cake', 'cookie', 'dessert'], caloriesPer100g: 500 },
  { keywords: ['protein shake', 'protein powder', 'whey'], caloriesPer100g: 380 },
  { keywords: ['coffee', 'tea'], caloriesPer100g: 5 },
  { keywords: ['juice', 'smoothie'], caloriesPer100g: 45 },
  { keywords: ['soda', 'cola', 'soft drink'], caloriesPer100g: 42 },
];

// Serving size presets (in grams)
const SERVING_PRESETS: Record<string, number> = {
  'small': 100,
  'medium': 150,
  'large': 250,
  'extra large': 350,
  'xl': 350,
  'half': 75,
  'double': 300,
  'cup': 240,
  'bowl': 300,
  'plate': 400,
  'slice': 80,
  'piece': 100,
  'handful': 30,
  'tablespoon': 15,
  'tbsp': 15,
  'teaspoon': 5,
  'tsp': 5,
};

function parseGrams(portionSize: string): number {
  const lower = portionSize.toLowerCase().trim();

  // Direct gram/kg match: "200g", "0.5kg", "200 grams"
  const gramMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/);
  if (gramMatch) return parseFloat(gramMatch[1]);

  const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?)\b/);
  if (kgMatch) return parseFloat(kgMatch[1]) * 1000;

  // ml match (approximate 1ml ≈ 1g for liquids)
  const mlMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliters?|liters?|l)\b/);
  if (mlMatch) {
    const val = parseFloat(mlMatch[1]);
    return lower.includes('l') && !lower.includes('ml') ? val * 1000 : val;
  }

  // Serving count: "2 servings", "1 serving"
  const servingMatch = lower.match(/(\d+(?:\.\d+)?)\s*servings?/);
  if (servingMatch) return parseFloat(servingMatch[1]) * 150;

  // Number + preset keyword: "1 cup", "2 slices"
  for (const [keyword, grams] of Object.entries(SERVING_PRESETS)) {
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*${keyword}s?\\b`);
    const match = lower.match(regex);
    if (match) return parseFloat(match[1]) * grams;
  }

  // Just a number (assume grams)
  const numMatch = lower.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) return parseFloat(numMatch[1]);

  // Preset keyword alone: "medium", "large"
  for (const [keyword, grams] of Object.entries(SERVING_PRESETS)) {
    if (lower.includes(keyword)) return grams;
  }

  // Default: 150g
  return 150;
}

function findFoodCalories(mealName: string): number {
  const lower = mealName.toLowerCase();

  // Try multi-word keywords first (longer matches take priority)
  const sorted = [...FOOD_DATABASE].sort(
    (a, b) => Math.max(...b.keywords.map(k => k.length)) - Math.max(...a.keywords.map(k => k.length))
  );

  for (const entry of sorted) {
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        return entry.caloriesPer100g;
      }
    }
  }

  // Default: generic mixed meal
  return 150;
}

export function estimateCalories(mealName: string, portionSize: string): number {
  const grams = parseGrams(portionSize);
  const calsPer100g = findFoodCalories(mealName);
  return Math.round((grams / 100) * calsPer100g);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MealLogForm({ onSuccess }: Props) {
  const { mutateAsync: logMeal, isPending } = useLogMeal();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({ mealName: '', portionSize: '', date: today });
  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const estimatedCals =
    form.mealName && form.portionSize
      ? estimateCalories(form.mealName, form.portionSize)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mealName.trim() || !form.portionSize.trim()) {
      toast.error('Please fill in meal name and portion size');
      return;
    }
    const calories = estimateCalories(form.mealName, form.portionSize);
    try {
      await logMeal({
        mealName: form.mealName.trim(),
        portionSize: form.portionSize.trim(),
        estimatedCalories: calories,
        date: form.date,
      });
      toast.success(`Meal logged! ~${calories} kcal estimated`);
      onSuccess();
    } catch {
      toast.error('Failed to log meal');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Meal Name</Label>
        <Input
          type="text"
          value={form.mealName}
          onChange={e => set('mealName', e.target.value)}
          placeholder="e.g. Chicken breast, Rice, Salad"
          className="rounded-xl h-10"
        />
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground mb-1 block">Portion / Serving Size</Label>
        <Input
          type="text"
          value={form.portionSize}
          onChange={e => set('portionSize', e.target.value)}
          placeholder="e.g. 200g, 1 cup, 1 serving"
          className="rounded-xl h-10"
        />
      </div>

      {/* Live calorie estimate */}
      {estimatedCals !== null && (
        <div className="flex items-center gap-2 bg-fitness-accent/10 border border-fitness-accent/30 rounded-xl px-3 py-2">
          <Sparkles className="w-4 h-4 text-fitness-accent flex-shrink-0" />
          <p className="text-sm font-semibold text-foreground">
            AI Estimate: <span className="text-fitness-accent">{estimatedCals} kcal</span>
          </p>
        </div>
      )}

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
        className="w-full h-11 bg-fitness-accent hover:bg-fitness-accent/90 text-white rounded-xl font-semibold"
      >
        {isPending ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Logging...
          </span>
        ) : 'Log Meal'}
      </Button>
    </form>
  );
}
