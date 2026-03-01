import { useState } from 'react';
import { Dumbbell, TrendingUp, LogOut, User } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import FitnessSection from './FitnessSection';
import FinanceSection from './FinanceSection';
import { Button } from '@/components/ui/button';

type Section = 'fitness' | 'finance';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>('fitness');
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const principal = identity?.getPrincipal().toString() ?? '';
  const shortPrincipal = principal ? `${principal.slice(0, 5)}...${principal.slice(-3)}` : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/finfit-logo.dim_256x256.png"
              alt="FinFit"
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-black text-foreground">
              Fin<span className="text-primary-accent">Fit</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                {shortPrincipal}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-24 pt-4">
        {activeSection === 'fitness' ? (
          <FitnessSection userProfile={userProfile ?? null} />
        ) : (
          <FinanceSection userProfile={userProfile ?? null} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveSection('fitness')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeSection === 'fitness'
                ? 'text-fitness-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-xs font-semibold">Fitness</span>
            {activeSection === 'fitness' && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-fitness-accent rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('finance')}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeSection === 'finance'
                ? 'text-finance-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-semibold">Finance</span>
            {activeSection === 'finance' && (
              <span className="absolute bottom-0 w-12 h-0.5 bg-finance-accent rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
