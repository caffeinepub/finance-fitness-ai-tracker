# Specification

## Summary
**Goal:** Add AI-based calorie burn tracking from workouts and real-time step counting via device motion/accelerometer permission to the FinFit fitness dashboard.

**Planned changes:**
- Add a `duration` (minutes) field to the WorkoutLogForm and store it in the backend workout log entry
- Implement client-side MET-based calorie burn estimation per workout using exercise type, duration, and user body weight from their fitness profile
- Display estimated calories burned per workout session and a daily/weekly total in the fitness section
- Add a "Calories Burned" stat card to the FitnessSection stats summary reflecting the sum of AI-estimated burns
- Add a step tracking feature that requests physical activity / accelerometer permission from the browser/device
- Count steps in real time using DeviceMotionEvent / Accelerometer API and display the live step count on the fitness dashboard
- Allow the user to save the tracked step count to their daily metrics in the backend
- Gracefully fall back to manual step entry with an explanatory message if permission is denied

**User-visible outcome:** Users can log workout duration and see AI-estimated calories burned per session and as a daily/weekly total on the fitness dashboard. The app also automatically tracks steps using the device's motion sensor (with user permission) and shows a live step count, with a save option to record it as daily metrics.
