# SelfTrainer development

## Start the website and Expo

From this folder, run:

```powershell
npm run dev
```

This starts the website at `http://localhost:3001` and the Expo Metro server at an available port. Keep this terminal open. Expo displaying `Waiting on ...` means Metro is ready; it does not mean the app has opened on a device yet.

The Expo app now includes sign-in and registration, a study dashboard, searchable materials with document upload and editing, AI summaries, flashcard review, quizzes and scored attempts, subject organization, study plans, and session logging. Mobile sign-in uses an encrypted bearer token stored with Expo SecureStore.

To open the app, start an Android emulator with Expo Go installed and press `a` in the terminal, or open Expo Go on a phone and scan the Expo QR code. The phone and computer need to be on the same Wi-Fi network. Expo uses LAN mode; its port is selected automatically so a stale Metro process on the old port does not block startup.

If the combined terminal does not show Expo's interactive controls, use two PowerShell terminals:

```powershell
# Terminal 1: website
npm run dev:web
```

```powershell
# Terminal 2: interactive Expo CLI
npm run dev:mobile
```

Then use Expo's `a` shortcut or scan the QR code. Stop both terminals with `Ctrl+C` before starting another copy of the same server.

## Backend address for mobile

The mobile app reads the development computer's LAN host from the Expo connection and uses it for API requests, so a physical iPhone does not try to reach its own `localhost`. Keep the phone and computer on the same Wi-Fi network. Windows Firewall must allow the development server through that network profile.

To override the detected address, create `selftrainer-mobile/.env.local`:

```env
EXPO_PUBLIC_API_BASE_URL=http://<computer-wifi-ipv4>:3001
```

Replace the placeholder with the IPv4 address shown by `ipconfig`, then restart Expo.

## Mobile checks

From `selftrainer-mobile`, run `npm run lint`, `npx tsc --noEmit`, and `npx expo export --platform android --no-bytecode`. For the API smoke test, start the website and run `npm run test:mobile-api` from `selftrainer`; the script creates a temporary user and removes it afterward.
