import { Footprints, Play, Square, RotateCcw, Save, AlertTriangle, Smartphone, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStepTracker } from '../hooks/useStepTracker';

interface Props {
  onSaveSteps: (steps: number) => void;
}

export default function StepTrackerWidget({ onSaveSteps }: Props) {
  const {
    steps,
    permissionStatus,
    isTracking,
    errorMessage,
    requestPermission,
    startTracking,
    stopTracking,
    resetSteps,
  } = useStepTracker();

  if (permissionStatus === 'unsupported') {
    return (
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="w-5 h-5 text-primary-accent" />
          <h3 className="font-bold text-sm text-foreground">Step Tracker</h3>
        </div>
        <div className="flex items-start gap-2 bg-muted/50 rounded-xl p-3">
          <WifiOff className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Automatic step tracking is not supported on this device or browser. Use the{' '}
            <strong>Daily</strong> button below to log steps manually.
          </p>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="w-5 h-5 text-primary-accent" />
          <h3 className="font-bold text-sm text-foreground">Step Tracker</h3>
        </div>
        <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-destructive mb-0.5">Permission Denied</p>
            <p className="text-xs text-muted-foreground">
              {errorMessage ??
                'Motion access was denied. Enable it in your device settings, then reload the page. You can still log steps manually using the Daily button.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'prompt') {
    return (
      <div className="bg-card rounded-2xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Footprints className="w-5 h-5 text-primary-accent" />
          <h3 className="font-bold text-sm text-foreground">Step Tracker</h3>
        </div>
        <div className="flex items-start gap-2 bg-primary-accent/5 border border-primary-accent/20 rounded-xl p-3 mb-3">
          <Smartphone className="w-4 h-4 text-primary-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Enable <strong>physical activity permission</strong> to automatically count your steps
            using your device's motion sensor in real time.
          </p>
        </div>
        <Button
          onClick={requestPermission}
          className="w-full h-10 bg-primary-accent hover:bg-primary-accent/90 text-white rounded-xl font-semibold text-sm gap-2"
        >
          <Footprints className="w-4 h-4" />
          Enable Step Tracking
        </Button>
      </div>
    );
  }

  // permissionStatus === 'granted'
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-5 h-5 text-primary-accent" />
          <h3 className="font-bold text-sm text-foreground">Step Tracker</h3>
        </div>
        {isTracking && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-fitness-accent">
            <span className="w-2 h-2 rounded-full bg-fitness-accent animate-pulse" />
            Live
          </span>
        )}
      </div>

      {/* Step Count Display */}
      <div className="text-center py-3 mb-3">
        <p className="text-5xl font-black text-primary-accent tabular-nums">
          {steps.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">steps detected</p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        {!isTracking ? (
          <Button
            onClick={startTracking}
            className="col-span-1 h-9 bg-fitness-accent hover:bg-fitness-accent/90 text-white rounded-xl text-xs font-semibold gap-1"
          >
            <Play className="w-3.5 h-3.5" />
            Start
          </Button>
        ) : (
          <Button
            onClick={stopTracking}
            variant="outline"
            className="col-span-1 h-9 rounded-xl text-xs font-semibold gap-1 border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Square className="w-3.5 h-3.5" />
            Stop
          </Button>
        )}

        <Button
          onClick={resetSteps}
          variant="outline"
          disabled={isTracking}
          className="col-span-1 h-9 rounded-xl text-xs font-semibold gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>

        <Button
          onClick={() => onSaveSteps(steps)}
          disabled={steps === 0}
          className="col-span-1 h-9 bg-primary-accent hover:bg-primary-accent/90 text-white rounded-xl text-xs font-semibold gap-1 disabled:opacity-40"
        >
          <Save className="w-3.5 h-3.5" />
          Save
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-2">
        Tap <strong>Save</strong> to log these steps to your daily metrics
      </p>
    </div>
  );
}
