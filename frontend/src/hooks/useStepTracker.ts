import { useState, useEffect, useRef, useCallback } from 'react';

export type StepPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface StepTrackerState {
  steps: number;
  permissionStatus: StepPermissionStatus;
  isTracking: boolean;
  errorMessage: string | null;
  requestPermission: () => Promise<void>;
  startTracking: () => void;
  stopTracking: () => void;
  resetSteps: () => void;
}

// Step detection constants
const STEP_THRESHOLD = 1.2; // Net acceleration threshold above gravity (m/s²)
const STEP_COOLDOWN_MS = 300; // Minimum ms between detected steps

export function useStepTracker(): StepTrackerState {
  const [steps, setSteps] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<StepPermissionStatus>('prompt');
  const [isTracking, setIsTracking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lastStepTime = useRef<number>(0);
  const isTrackingRef = useRef(false);
  const peakDetected = useRef<boolean>(false);

  // Check if DeviceMotionEvent is supported
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermissionStatus('unsupported');
      setErrorMessage('Your device does not support motion tracking.');
    }
  }, []);

  // Step detection algorithm using peak detection on acceleration magnitude
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isTrackingRef.current) return;

    const acc = event.accelerationIncludingGravity;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // Calculate magnitude of acceleration vector (m/s²)
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    // Net acceleration above gravity (9.81 m/s²)
    const netAccel = Math.abs(magnitude - 9.81);

    const now = Date.now();

    // Peak detection: step counted when crossing threshold going up
    if (netAccel > STEP_THRESHOLD) {
      if (!peakDetected.current) {
        peakDetected.current = true;
        if (now - lastStepTime.current > STEP_COOLDOWN_MS) {
          lastStepTime.current = now;
          setSteps(prev => prev + 1);
        }
      }
    } else {
      peakDetected.current = false;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermissionStatus('unsupported');
      setErrorMessage('Motion tracking is not supported on this device or browser.');
      return;
    }

    try {
      // iOS 13+ requires explicit permission request
      const DeviceMotionEventTyped = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceMotionEventTyped.requestPermission === 'function') {
        const result = await DeviceMotionEventTyped.requestPermission();
        if (result === 'granted') {
          setPermissionStatus('granted');
          setErrorMessage(null);
        } else {
          setPermissionStatus('denied');
          setErrorMessage(
            'Motion permission denied. Please enable it in your device settings to use automatic step tracking.'
          );
        }
      } else {
        // Android / desktop — permission is implicit
        setPermissionStatus('granted');
        setErrorMessage(null);
      }
    } catch {
      setPermissionStatus('denied');
      setErrorMessage('Could not request motion permission. Automatic step tracking is unavailable.');
    }
  }, []);

  const startTracking = useCallback(() => {
    if (permissionStatus !== 'granted') return;
    isTrackingRef.current = true;
    setIsTracking(true);
    window.addEventListener('devicemotion', handleMotion);
  }, [permissionStatus, handleMotion]);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    setIsTracking(false);
    window.removeEventListener('devicemotion', handleMotion);
  }, [handleMotion]);

  const resetSteps = useCallback(() => {
    setSteps(0);
    lastStepTime.current = 0;
    peakDetected.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isTrackingRef.current = false;
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [handleMotion]);

  return {
    steps,
    permissionStatus,
    isTracking,
    errorMessage,
    requestPermission,
    startTracking,
    stopTracking,
    resetSteps,
  };
}
