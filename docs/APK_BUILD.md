# Dassah's Prism: source and simple Android APK path

## Source code

The project source is maintained here:

<https://github.com/JGitu-creator/dassahs-mindbridge>

Clone it with:

```bash
git clone https://github.com/JGitu-creator/dassahs-mindbridge.git
cd dassahs-mindbridge
npm install
npm run dev
```

Open <http://localhost:3000>.

Copy `.env.example` to `.env.local` and add the required values locally. **Never put API keys, Supabase service-role keys, or payment secrets in the APK or in a public repository.**

## Fastest option: install it like an app

On Android Chrome:

1. Open <https://dassahs-mindbridge.vercel.app/>.
2. Open the three-dot menu.
3. Choose **Add to Home screen** or **Install app**.
4. Launch Prism from the new icon.

This is the safest first release because the Next.js API routes, Google sign-in, Supabase session, AI routing, and Lemon Squeezy preparation remain on the server.

## Build a simple APK wrapper with Capacitor

This creates a small Android shell around the already deployed app. It does not move API keys into the phone.

### Requirements

- Node.js 20+
- Android Studio
- Android SDK and an emulator or USB-connected phone
- Java 17+

### Commands

From a clean copy of the repository:

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Dassah's Prism" "com.dassah.prism" --web-dir=public
npx cap add android
```

Create or edit `capacitor.config.ts` so the wrapper points to the live app:

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dassah.prism',
  appName: "Dassah's Prism",
  webDir: 'public',
  server: {
    url: 'https://dassahs-mindbridge.vercel.app',
    cleartext: false,
  },
};

export default config;
```

Then sync and open Android Studio:

```bash
npx cap sync android
npx cap open android
```

In Android Studio choose **Build → Generate App Bundles or APKs → Generate APKs**. For a private test build, choose the debug APK. For Google Play, create a signed release build and keep the signing key backed up securely.

## Important limitation

This remote-wrapper method needs internet access because Prism's AI and server APIs run on Vercel/Supabase. A fully offline APK would require a separate mobile architecture and local AI/data plan; it is not the right first step for this product.
