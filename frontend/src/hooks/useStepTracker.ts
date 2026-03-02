import { useState, useEffect, useRef, useCallback } from 'react';

const PERMISSION_KEY = 'stepTrackingPermission';
const STEP_COUNT_KEY = 'stepTrackingCount';
const STEP_DATE_KEY = 'stepTrackingDate';

export type StepPermission = 'granted' | 'denied' | 'unsupported' | 'unknown';

interface UseStepTrackerOptions {
  onAutoSave?: (steps: number, date: string) => void;
}

interface UseStepTrackerReturn {
  steps: number;
  permission: StepPermission;
  isTracking: boolean;
  eventsReceived: boolean;
  requestPermission: () => Promise<StepPermission>;
  startTracking: () => void;
  stopTracking: () => void;
  resetSteps: () => void;
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Low-pass filter coefficient (0 = no smoothing, 1 = full smoothing)
const LOW_PASS_ALPHA = 0.8;

// Step detection parameters
const STEP_THRESHOLD = 10.5;      // Magnitude threshold above which a peak is a step
const STEP_COOLDOWN_MS = 250;     // Minimum ms between steps (~max 4 steps/sec)
const GRAVITY = 9.81;

export function useStepTracker(options?: UseStepTrackerOptions): UseStepTrackerReturn {
  const storedPermission = (localStorage.getItem(PERMISSION_KEY) as StepPermission) || 'unknown';
  const storedDate = localStorage.getItem(STEP_DATE_KEY);
  const today = getTodayString();
  const storedSteps = storedDate === today
    ? parseInt(localStorage.getItem(STEP_COUNT_KEY) || '0', 10)
    : 0;

  const [permission, setPermission] = useState<StepPermission>(storedPermission);
  const [steps, setSteps] = useState<number>(storedSteps);
  const [isTracking, setIsTracking] = useState(false);
  const [eventsReceived, setEventsReceived] = useState(false);

  const stepCountRef = useRef(storedSteps);
  const listenerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStepTimeRef = useRef(0);

  // Low-pass filtered magnitude
  const filteredMagRef = useRef<number | null>(null);
  // Track whether we're in a "peak" (above threshold) to avoid double-counting
  const inPeakRef = useRef(false);
  // Track peak magnitude during a peak window
  const peakMagRef = useRef(0);
  // Events received flag ref (for use inside closure)
  const eventsReceivedRef = useRef(false);

  const saveSteps = useCallback((count: number) => {
    const date = getTodayString();
    localStorage.setItem(STEP_COUNT_KEY, String(count));
    localStorage.setItem(STEP_DATE_KEY, date);
    options?.onAutoSave?.(count, date);
  }, [options]);

  const startTracking = useCallback(() => {
    if (isTracking) return;
    if (typeof DeviceMotionEvent === 'undefined') return;

    // Reset filter state
    filteredMagRef.current = null;
    inPeakRef.current = false;
    peakMagRef.current = 0;
    eventsReceivedRef.current = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      // Mark that we're actually receiving events
      if (!eventsReceivedRef.current) {
        eventsReceivedRef.current = true;
        setEventsReceived(true);
      }

      // Prefer linear acceleration (no gravity) if available and non-zero
      let ax = 0, ay = 0, az = 0;
      const linAccel = event.acceleration;
      const gravAccel = event.accelerationIncludingGravity;

      if (
        linAccel &&
        linAccel.x != null &&
        linAccel.y != null &&
        linAccel.z != null &&
        (Math.abs(linAccel.x) + Math.abs(linAccel.y) + Math.abs(linAccel.z)) > 0.01
      ) {
        // Use linear acceleration (gravity already removed by device)
        ax = linAccel.x!;
        ay = linAccel.y!;
        az = linAccel.z!;

        // Compute magnitude of linear acceleration
        const rawMag = Math.sqrt(ax * ax + ay * ay + az * az);

        // Apply low-pass filter
        if (filteredMagRef.current === null) {
          filteredMagRef.current = rawMag;
        } else {
          filteredMagRef.current =
            LOW_PASS_ALPHA * filteredMagRef.current + (1 - LOW_PASS_ALPHA) * rawMag;
        }

        const mag = filteredMagRef.current;
        const threshold = 2.5; // m/s² for linear accel (no gravity)

        detectStep(mag, threshold);
      } else if (
        gravAccel &&
        gravAccel.x != null &&
        gravAccel.y != null &&
        gravAccel.z != null
      ) {
        // Fall back to accelerationIncludingGravity
        ax = gravAccel.x!;
        ay = gravAccel.y!;
        az = gravAccel.z!;

        // Compute total magnitude (includes ~9.81 from gravity)
        const rawMag = Math.sqrt(ax * ax + ay * ay + az * az);

        // Apply low-pass filter
        if (filteredMagRef.current === null) {
          filteredMagRef.current = rawMag;
        } else {
          filteredMagRef.current =
            LOW_PASS_ALPHA * filteredMagRef.current + (1 - LOW_PASS_ALPHA) * rawMag;
        }

        const mag = filteredMagRef.current;
        // Threshold is GRAVITY + offset for steps
        detectStep(mag, STEP_THRESHOLD);
      }
    };

    function detectStep(mag: number, threshold: number) {
      const now = Date.now();

      if (mag > threshold) {
        // We're above threshold — entering or continuing a peak
        if (!inPeakRef.current) {
          inPeakRef.current = true;
          peakMagRef.current = mag;
        } else {
          peakMagRef.current = Math.max(peakMagRef.current, mag);
        }
      } else {
        // We've dropped below threshold — end of peak
        if (inPeakRef.current) {
          inPeakRef.current = false;
          // Count as a step if cooldown has passed
          if (now - lastStepTimeRef.current > STEP_COOLDOWN_MS) {
            lastStepTimeRef.current = now;
            stepCountRef.current += 1;
            setSteps(stepCountRef.current);
          }
          peakMagRef.current = 0;
        }
      }
    }

    listenerRef.current = handleMotion;
    window.addEventListener('devicemotion', handleMotion);
    setIsTracking(true);

    // Auto-save every 5 minutes
    autoSaveTimerRef.current = setInterval(() => {
      saveSteps(stepCountRef.current);
    }, 5 * 60 * 1000);
  }, [isTracking, saveSteps]);

  const stopTracking = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener('devicemotion', listenerRef.current);
      listenerRef.current = null;
    }
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    saveSteps(stepCountRef.current);
    setIsTracking(false);
    setEventsReceived(false);
    eventsReceivedRef.current = false;
  }, [saveSteps]);

  const resetSteps = useCallback(() => {
    stepCountRef.current = 0;
    setSteps(0);
    localStorage.setItem(STEP_COUNT_KEY, '0');
    localStorage.setItem(STEP_DATE_KEY, getTodayString());
  }, []);

  const requestPermission = useCallback(async (): Promise<StepPermission> => {
    if (typeof DeviceMotionEvent === 'undefined') {
      const perm: StepPermission = 'unsupported';
      setPermission(perm);
      localStorage.setItem(PERMISSION_KEY, perm);
      return perm;
    }

    // iOS 13+ requires explicit permission
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        const perm: StepPermission = result === 'granted' ? 'granted' : 'denied';
        setPermission(perm);
        localStorage.setItem(PERMISSION_KEY, perm);
        return perm;
      } catch {
        const perm: StepPermission = 'denied';
        setPermission(perm);
        localStorage.setItem(PERMISSION_KEY, perm);
        return perm;
      }
    }

    // Android / desktop — permission is implicit
    const perm: StepPermission = 'granted';
    setPermission(perm);
    localStorage.setItem(PERMISSION_KEY, perm);
    return perm;
  }, []);

  // Auto-start tracking if permission was previously granted
  useEffect(() => {
    if (permission === 'granted' && !isTracking) {
      // Reset steps if it's a new day
      const savedDate = localStorage.getItem(STEP_DATE_KEY);
      if (savedDate !== getTodayString()) {
        stepCountRef.current = 0;
        setSteps(0);
      }
      startTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission]);

  // Save steps on unmount
  useEffect(() => {
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('devicemotion', listenerRef.current);
      }
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      saveSteps(stepCountRef.current);
    };
  }, [saveSteps]);

  return {
    steps,
    permission,
    isTracking,
    eventsReceived,
    requestPermission,
    startTracking,
    stopTracking,
    resetSteps,
  };
}
