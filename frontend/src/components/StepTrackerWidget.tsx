import React, { useState, useEffect } from 'react';
import { Footprints, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useStepTracker } from '../hooks/useStepTracker';
import { Button } from '@/components/ui/button';

interface StepTrackerWidgetProps {
  onStepsUpdate?: (steps: number, date: string) => void;
}

export default function StepTrackerWidget({ onStepsUpdate }: StepTrackerWidgetProps) {
  const {
    steps,
    permission,
    isTracking,
    eventsReceived,
    requestPermission,
    startTracking,
  } = useStepTracker({ onAutoSave: onStepsUpdate });

  const [isRequesting, setIsRequesting] = useState(false);
  // Show "no signal" warning if tracking but no events after 5 seconds
  const [showNoSignal, setShowNoSignal] = useState(false);

  useEffect(() => {
    if (!isTracking) {
      setShowNoSignal(false);
      return;
    }
    if (eventsReceived) {
      setShowNoSignal(false);
      return;
    }
    // Give 5 seconds for events to arrive before showing warning
    const timer = setTimeout(() => {
      if (!eventsReceived) {
        setShowNoSignal(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isTracking, eventsReceived]);

  const goal = 10000;
  const progress = Math.min((steps / goal) * 100, 100);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const perm = await requestPermission();
      if (perm === 'granted') {
        startTracking();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  if (permission === 'unsupported') {
    return (
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-1">
          <Footprints className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Step Tracking</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Step tracking is not supported on this device.
        </p>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-foreground">Step Tracking</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Motion permission is required for step tracking. Please enable it in your browser or device settings, then tap below.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs border-fitness-accent/30 text-fitness-accent hover:bg-fitness-accent/10"
          onClick={handleRequestPermission}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Requesting…
            </span>
          ) : (
            'Try Again'
          )}
        </Button>
      </div>
    );
  }

  if (permission === 'unknown') {
    return (
      <div className="bg-card rounded-2xl p-4 border border-border">
        <div className="flex items-center gap-2 mb-2">
          <Footprints className="w-4 h-4 text-fitness-accent" />
          <span className="text-sm font-semibold text-foreground">Step Tracking</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Enable live step tracking to count your steps automatically throughout the day.
        </p>
        <Button
          size="sm"
          className="w-full text-xs bg-fitness-accent text-white hover:bg-fitness-accent/90"
          onClick={handleRequestPermission}
          disabled={isRequesting}
        >
          {isRequesting ? (
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Enabling…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Footprints className="w-3 h-3" />
              Enable Step Tracking
            </span>
          )}
        </Button>
      </div>
    );
  }

  // permission === 'granted'
  return (
    <div className="bg-card rounded-2xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-fitness-accent" />
          <span className="text-sm font-semibold text-foreground">Steps Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          {isTracking && eventsReceived && (
            <>
              <div className="w-2 h-2 rounded-full bg-fitness-accent animate-pulse" />
              <span className="text-xs text-fitness-accent">Live</span>
            </>
          )}
          {isTracking && !eventsReceived && showNoSignal && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              No signal
            </span>
          )}
          {!isTracking && permission === 'granted' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs text-fitness-accent hover:bg-fitness-accent/10"
              onClick={startTracking}
            >
              Start
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-bold text-foreground">{steps.toLocaleString()}</span>
        <span className="text-sm text-muted-foreground mb-1">/ {goal.toLocaleString()} goal</span>
      </div>

      <div className="w-full bg-muted rounded-full h-2 mb-2">
        <div
          className="bg-fitness-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{Math.round(progress)}% of daily goal</span>
        </div>
        {isTracking && showNoSignal && (
          <p className="text-xs text-muted-foreground">
            Move your device to detect steps
          </p>
        )}
      </div>
    </div>
  );
}
