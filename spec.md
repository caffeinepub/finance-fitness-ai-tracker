# Specification

## Summary
**Goal:** Replace the automatic step counter widget in the Fitness section with a manual step entry input, and display an AI-estimated calorie burn based on the entered steps.

**Planned changes:**
- Remove the DeviceMotion-based StepTrackerWidget and useStepTracker hook from the Fitness section UI.
- Add a numeric "Steps" input field where the step tracker widget previously appeared.
- Display a real-time calorie burn estimate below/next to the step input (approx. 0.04–0.05 kcal per step, factoring in the user's body weight from their fitness profile if available, defaulting to 70 kg otherwise).
- Wire the manual step input value into the existing DailyMetricsForm so it is saved via the logDailyMetrics mutation on form submission.
- Load previously saved step counts back into the manual input field when existing data is present.

**User-visible outcome:** Users can manually type their step count in the Fitness section and immediately see an estimated calories burned figure. The step count is saved with their daily metrics as before, with no device motion prompts.
