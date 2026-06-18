# ActivityPool Social

A cross-platform mobile app for discovering and joining local activities, built with React Native and Firebase. Originally developed as a school assignment, then redesigned with a production-oriented UI, a proper component/design-token system, and security hardening across authentication and data access.

<p>
  <img alt="Platform" src="https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey">
  <img alt="Built with Expo" src="https://img.shields.io/badge/built%20with-Expo-000020">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6">
  <img alt="Firebase" src="https://img.shields.io/badge/backend-Firebase-FFCA28">
</p>

---

## What it does

Users sign up, create activities (sports, food, games, etc.) with a date, time, location, and optional participant cap, and others can discover and join them in real time. Hosts manage their own activities; everyone can browse what's happening nearby on a map.

## Tech stack

| Layer         | Choice                                            | Why                                                                                                              |
| ------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| App framework | React Native + Expo (TypeScript)                  | Single codebase for iOS/Android, fast iteration via Expo Go during development                                   |
| Navigation    | React Navigation (bottom tabs + native stack)     | Standard, well-supported pattern for multi-screen mobile apps                                                    |
| UI            | React Native Paper + custom design tokens         | Material-style accessible components, themed to a custom palette instead of defaults                             |
| Backend       | Firebase (Auth, Firestore)                        | Real-time data sync without running a custom backend; generous free tier for a portfolio project                 |
| Maps          | react-native-maps + Google Places API             | Native map rendering with custom category-coded markers; location autocomplete on activity creation              |
| State         | React hooks + Context (no external state library) | App is small enough that Context for auth + local component state is sufficient; avoids unnecessary dependencies |

## Architecture

```
App.tsx                     — navigation root (auth stack vs. tab stack)
src/
  screens/                  — one file per screen, no shared business logic between them
  components/               — reusable UI: ActivityCard, ActionButton, EmptyState, MapActivityMarker
  hooks/useAuth.tsx          — auth context: login, register, logout, profile updates, password change
  services/
    firebase.ts              — Firebase app/auth/firestore initialisation, AsyncStorage-backed auth persistence
  theme.ts                   — design tokens: colors, spacing, radius, font scale, shadows
  types/activity.ts          — shared TypeScript types (Activity, ActivityCategory, UserProfile)
  utils.ts                   — formatting, validation, debounce helpers, and activity category metadata
```

**Navigation structure:**

- **Auth stack** (logged out): Login → Register
- **Main tabs** (logged in): Home (dashboard) → Discover (browse/join, with filters) → Add (create activity) → Map → Profile

Home and Discover were deliberately split: Home is a lightweight dashboard (stats, quick actions, a 3-item upcoming preview), while Discover owns the full filterable, joinable activity list. Putting everything on one screen made the original version feel cluttered and made "browse to join" a buried feature rather than a clear destination.

## Key design decisions

**Real-time data over polling.** Activity lists and profile data use Firestore's `onSnapshot` listeners rather than manual refresh/fetch cycles, so joining or leaving an activity reflects instantly across the app without a pull-to-refresh.

**Design tokens instead of inline styling.** Colors, spacing, radius, typography, and shadows live in `theme.ts` as named constants (`COLORS.primary`, `SPACING.md`, etc.) rather than scattered hex codes and magic numbers. This is the same pattern used in production design systems and makes a future re-theme a one-file change.

**Component extraction over duplication.** `ActivityCard`, `ActionButton`, and `EmptyState` are shared across Home, Discover, and (partially) Map, instead of each screen reimplementing its own card/button markup.

**Debounced search.** Location autocomplete waits 350ms after the user stops typing before calling the Places API, reducing unnecessary network calls and avoiding rate-limit issues.

## Security measures

This was a specific focus area, since the original assignment version had no input validation, no Firestore rules beyond defaults, and hardcoded API keys in source.

- **Firestore Security Rules** scope reads/writes per-collection: any authenticated user can read activities, but only the host can delete their own activity, and only a user can write to their own `users/{uid}` profile document.
- **Re-authentication before password change.** Firebase requires the user to re-supply their current password (`reauthenticateWithCredential`) before `updatePassword` is allowed, preventing a hijacked session from silently changing credentials.
- **Input validation and sanitisation** on email format, password strength (length, uppercase, digit), and free-text fields (trimmed, whitespace-collapsed) before they're written to Firestore.
- **Secrets kept out of source control.** API keys (Google Places/Maps, Firebase) are loaded from a git-ignored `.env` file via `app.config.js`, surfaced to the app through `expo-constants`. The Firebase client config is safe to ship as a fallback (it's restricted by Firestore/Storage rules, not secrecy), but third-party keys are never hardcoded.
- **Auth persistence via AsyncStorage**, so sessions survive app restarts without storing credentials directly — only Firebase's own session token is persisted.

## Known limitations

- **Location autocomplete and the interactive map are feature-complete but currently inactive** because they depend on the Google Places/Maps APIs, which require a billing-enabled Google Cloud project even within the free usage tier. The integration code is fully implemented and tested against the API; billing simply hasn't been enabled for this side project.
- **No automated tests yet.** Given more time, the priority would be unit tests for the validation utilities and an integration test for the join/leave activity flow, since that's the core user action.
- **No push notifications**, despite `expo-notifications` being installed — flagged as a natural next feature (e.g. notify participants when an activity they joined is updated or cancelled).
- **Profile photo upload is not yet implemented.** Profiles currently display an initials-based avatar derived from the user's name/email. Firebase Storage and per-user upload security rules are scoped out as a natural next step but aren't wired into the UI yet.

## Running locally

```bash
npm install
cp .env.example .env   # fill in your own Firebase + Google Maps/Places keys
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) to run on a physical device, or press `a` / `i` in the terminal for an emulator.

### Required environment variables

See `.env.example` for the full list. Configuration is loaded in `app.config.js` via `process.env` (using the `dotenv` package) and exposed to app code through `expo-constants` (`Constants.expoConfig.extra`), rather than relying on Metro's `EXPO_PUBLIC_*` build-time inlining — this keeps native config (`ios.config.googleMapsApiKey`, `android.config.googleMaps.apiKey`) and JS-side config (Firebase, Places) consistent in one place.

Location autocomplete additionally requires billing to be enabled on the associated Google Cloud project (see Known Limitations).

## Future implementations planned

- Profile photo upload via Firebase Storage (camera/gallery picker, with per-user upload security rules)
- Push notifications for activity updates
- Automated tests (Jest + React Native Testing Library) for the validation utils and join/leave flow
- Pagination/infinite scroll on Discover once activity volume grows past what a single snapshot listener comfortably handles
