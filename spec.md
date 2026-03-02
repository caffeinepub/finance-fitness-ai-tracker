# Specification

## Summary
**Goal:** Add full PWA support so the app installs and launches from the Android home screen, and fix the live step counter to work correctly in Chrome on Android.

**Planned changes:**
- Create a `manifest.json` with app name, icons, `start_url`, `display: standalone`, `theme_color`, and `background_color`, and link it in `index.html`
- Register a service worker that caches the app shell (HTML, JS, CSS) for standalone home screen launch without interfering with Internet Identity auth or ICP canister calls
- Fix the `useStepTracker` hook and `StepTrackerWidget` component to correctly request `DeviceMotion` permission in Chrome on Android and count steps in real time
- Show a clear message to the user if motion permission is denied
- Ensure live step count updates visibly in the `StepTrackerWidget` UI and persists to localStorage as before

**User-visible outcome:** Users can add FinFit Tracker to their Android home screen and launch it in standalone mode; the live step counter accurately detects and displays steps in real time when walking with an Android Chrome device.
