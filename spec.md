# Specification

## Summary
**Goal:** Make the FinFit app fully installable and mobile-friendly as a Progressive Web App (PWA).

**Planned changes:**
- Update `manifest.json` with `display: standalone`, correct `start_url`/`scope`, 192x192 and 512x512 maskable icons, and `orientation: portrait`
- Update the service worker to pre-cache app shell assets, handle offline navigation gracefully, bump cache version, and activate immediately via `skipWaiting`/`clients.claim()`
- Make the app layout fully responsive and mobile-friendly: touch-friendly bottom nav (44px tap targets), input font-size ≥ 16px to prevent iOS zoom, no horizontal overflow on 320px+ screens
- Guard service worker registration in `App.tsx` to only run on HTTPS or localhost, with graceful error handling
- Add Apple PWA meta tags to `index.html` (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon`)

**User-visible outcome:** Users can install FinFit to their home screen on Android and iOS, use it in standalone app mode, and the app remains usable offline with a properly cached app shell.
