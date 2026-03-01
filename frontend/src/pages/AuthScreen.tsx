import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Dumbbell, TrendingUp, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left: Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/generated/auth-hero-bg.dim_1200x800.png')" }}
        />
        <div className="absolute inset-0 bg-background/70" />

        <div className="relative z-10 text-center max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img
              src="/assets/generated/finfit-logo.dim_256x256.png"
              alt="FinFit Logo"
              className="w-16 h-16 rounded-2xl shadow-lg"
            />
            <h1 className="text-5xl font-black tracking-tight text-foreground">
              Fin<span className="text-primary-accent">Fit</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Your all-in-one <span className="text-fitness-accent font-semibold">fitness</span> &amp;{' '}
            <span className="text-finance-accent font-semibold">finance</span> tracker with built-in AI coaching.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { icon: Dumbbell, label: 'Workout Tracking', color: 'text-fitness-accent' },
              { icon: TrendingUp, label: 'Finance Planning', color: 'text-finance-accent' },
              { icon: Zap, label: 'AI Suggestions', color: 'text-primary-accent' },
              { icon: Shield, label: 'Secure & Private', color: 'text-muted-foreground' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 bg-card/60 backdrop-blur rounded-xl p-3 border border-border">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth Panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:w-[420px] bg-card border-l border-border">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/assets/generated/finfit-logo.dim_256x256.png"
              alt="FinFit"
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-2xl font-black text-foreground">FinFit</span>
          </div>

          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">
            Sign in or create an account to start tracking your fitness and finances.
          </p>

          <div className="space-y-3">
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold bg-primary-accent hover:bg-primary-accent/90 text-white rounded-xl"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                'Log In'
              )}
            </Button>

            <Button
              onClick={login}
              disabled={isLoggingIn}
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-xl border-2"
            >
              Sign Up
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Secured by Internet Identity — no passwords required.
          </p>
        </div>
      </div>
    </div>
  );
}
