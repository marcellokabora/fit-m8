# FIT-M8 → Google Play Store Deployment Plan

Tracks progress step by step. Check items off as they're completed. Package name and other
open decisions are called out where they block a step.

## Open decisions (resolve before the step that needs them)

- **Android package name**: `app.fit_m8.twa` (Bubblewrap sanitized the hyphen to an
  underscore automatically). Permanent, already used in the live `assetlinks.json`.
- **Category**: Social / Dating (confirmed) — pulls in stricter Play UGC/dating policies
  (age handling, reporting/blocking). App already has `src/lib/firebase/reports.ts`; confirm
  the report/block UI is reachable from chat/profile before Phase D.
- **Local tooling notes** (this machine): Bubblewrap's self-downloaded JDK
  (`~/.bubblewrap/jdk`) was 32-bit and couldn't build — replaced with a 64-bit Temurin 17
  install copied to `C:\jdk-17-temurin` (no spaces in path — Bubblewrap doesn't quote the
  java.exe path when shelling out to apksigner) and pointed at via `~/.bubblewrap/config.json`
  `jdkPath`. Keystore lives at `android.keystore` in the repo root (gitignored) with a backup
  in `~/keystores/fit-m8/` and Google Drive.

## Phase A — Android project via Bubblewrap

[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) is Google's official CLI for
**Trusted Web Activities (TWA)**: a thin native Android wrapper that launches the PWA
full-screen (no browser chrome), backed by Chrome. No app logic gets rewritten.

- [x] A1/A2. JDK + Android SDK + `@bubblewrap/cli` installed (see tooling notes above).
- [x] A3. `bubblewrap init` completed — package `app.fit_m8.twa`, keystore created and
      backed up.
- [x] A4. `bubblewrap build` completed — `app-release-bundle.aab` and
      `app-release-signed.apk` are in the repo root (gitignored, not committed).

(Alternative if you'd rather avoid the CLI/Android SDK locally: https://www.pwabuilder.com/ →
enter the site URL → "Package for Stores" → Android → download a ready-made TWA project/AAB.)

## Phase B — Digital Asset Links verification (needs A4's fingerprint)

Android only removes the browser UI (address bar) if it can verify you control the domain.
This repo already has the plumbing in place (`static/.well-known/assetlinks.json`
placeholder + `firebase.json` hosting `ignore` exception for the dotfile-prefixed folder).

- [x] B1. `static/.well-known/assetlinks.json` filled in: `package_name: app.fit_m8.twa`,
      `sha256_cert_fingerprints: [DC:13:F7:6E:53:7A:64:5D:67:52:07:54:C6:7A:A1:C4:FA:5D:46:98:C0:E9:6D:EB:B3:EE:70:2F:08:51:0E:55]`.
- [x] B2. Built and deployed to Firebase Hosting.
- [x] B3. Confirmed live and correct at `https://fit-m8.app/.well-known/assetlinks.json`.
      (Run it through Google's tester before the final Play submission too:
      https://developers.google.com/digital-asset-links/tools/generator)

## Phase C — Google Play Developer account (can start any time, in parallel with A/B)

- [ ] C1. Create account at https://play.google.com/console/ ($25 one-time fee).
- [ ] C2. Complete identity verification (can take days — start early; likely the real
      critical-path bottleneck, not the technical packaging).

## Phase D — Store listing content (needs C1; can prep in parallel with A/B)

- [ ] D1. Store listing text: title, short description (≤80 chars), full
      description, contact email, Privacy Policy URL (`https://fit-m8.app/privacy`),
      category = Social (confirm Dating sub-classification if Play prompts it).

  **Draft copy** (edit to taste, then paste into Play Console):
  - **Title** (≤30 chars): `FIT-M8: Sports Partner Finder`
  - **Short description** (≤80 chars):
    `Swipe to find workout buddies, sports partners, and coaches near you.`
  - **Full description** (≤4000 chars):

    ```
    FIT-M8 helps you find people to play, train, and move with — not just people to date.

    Whether you're looking for a running partner, a padel duo, a gym buddy, or a coach to
    train with, FIT-M8 matches you with people nearby who share your sport and your goals.

    HOW IT WORKS
    - Choose your sports from dozens of activities: football, padel, tennis, swimming,
      climbing, yoga, boxing, dance, and many more.
    - Set what you're looking for: a training partner, a friend to play with, or a coach.
    - Swipe through nearby profiles and match with people who share your interests.
    - Chat with your matches and plan your next session.

    FEATURES
    - Location-based matching so you meet people who can actually train with you.
    - Skill level and format filters (solo, group, casual, competitive).
    - Real-time chat with your matches.
    - Multiple languages supported (English, Spanish, Portuguese).
    - Report and block tools to keep the community safe.

    PREMIUM
    - Add more sports to your profile.
    - Message matches directly.
    - Trainer events and calendar features (coming soon).

    FIT-M8 is built for anyone who wants to stay active with the right people — training
    partners, teammates, or new friends who share your passion for sport.

    Read our Privacy Policy: https://fit-m8.app/privacy
    ```

- [ ] D2. Graphics: - App icon 512×512 → reuse `static/icons/icon-512.png`. - Feature graphic 1024×500 → **new asset needed**, not covered by
      `scripts/generate-icons.cjs`. - Phone screenshots (2–8, real captures, portrait, min 320px side) → capture from a
      live/staging build (discover, matches, chat, profile screens).
- [ ] D3. Questionnaires: Content rating, Data Safety, Target audience, Ads declaration,
      Dating/social declarations if prompted.

  **Draft Data Safety answers** (based on `/privacy` and the codebase — verify each
  category against Play Console's current definitions before submitting, this isn't legal
  advice):

  | Data type                          | Collected?     | Shared with 3rd parties? | Purpose                                  |
  | ---------------------------------- | -------------- | ------------------------ | ---------------------------------------- |
  | Name                               | Yes (required) | No                       | Account management, App functionality    |
  | Email address                      | Yes (required) | No                       | Account management                       |
  | Approximate location               | Yes (required) | No                       | App functionality (matching/distance)    |
  | Photos                             | Yes (required) | No                       | App functionality (profile display)      |
  | In-app messages                    | Yes (required) | No                       | App functionality (chat between matches) |
  | App interactions (swipes/matches)  | Yes            | No                       | App functionality, Analytics             |
  | Device/other IDs (FCM push token)  | Yes            | No                       | App functionality (notifications)        |
  | Crash logs & diagnostics           | Yes            | **Yes — with Google**    | Analytics (Firebase Crashlytics)         |
  | App interactions / usage analytics | Yes            | **Yes — with Google**    | Analytics (Firebase Analytics)           |

  Notes:
  - "Required" = app doesn't work without it (matches `/privacy` §1). App activity/device ID
    rows are collected but not strictly required for basic account creation.
  - Firebase Analytics and Crashlytics send data to Google's servers, which Play Console's
    Data Safety form generally wants declared as "shared with a third party" (Google) even
    though it's a processor under your control — check the in-console guidance for the
    current wording, this area of policy changes over time.
  - Data safety says "Is data encrypted in transit?" → Yes (HTTPS/Firebase). "Can users
    request data deletion?" → Yes (Profile → Delete account, per `/privacy` §5).
  - Account deletion: point to the in-app flow (`/privacy` §5) when Play asks for a data
    deletion mechanism/URL.

  **Content rating questionnaire (IARC)** — answer honestly per-question, but expect these
  themes to apply and push the rating to Teen/Mature (16+/18+) in most territories:
  - Users can communicate with each other (chat) → Yes.
  - User-generated content (profile photos, bio text) → Yes.
  - App shares the user's location with other users (approximate distance) → Yes.
  - App facilitates meeting/dating other users → Yes (this is the main driver of a higher
    rating for match-making apps).
  - Digital purchases (Premium) → Yes.
  - Violence/sexual content/gambling/drugs → No (not app content itself), but note some
    territories still rate "dating"-category apps 18+ regardless, independent of these
    answers — the app already enforces a minimum age of 18 in `/privacy` §7, so an 18+/Mature
    outcome is expected and fine.

- [ ] D4. App content → App access: provide reviewers a test account or documented login
      instructions (app requires auth).

  **App access draft**: mark "All functionality is available without special access" as
  **No** (login required), then provide either:
  - A pre-created test account (email/password) with a completed onboarding profile, so the
    reviewer lands on Discover with visible profiles — the repo's `npm run seed`
    (`scripts/seed.cjs`) already populates fake profiles in Firestore, so a fresh test
    account should have people to swipe on/match with immediately.
  - Or written instructions: "Sign up with any email via the in-app registration form (Auth
    → Sign up), complete the short onboarding (pick sports, location, photo), then land on
    Discover." Only needed if you don't want to hand over a specific test account's
    credentials directly in the console.

## Phase E — Release (needs A–D complete)

- [ ] E1. Upload the `.aab` to Internal testing (no review required, fastest feedback).
- [ ] E2. Check current Play policy for new accounts — typically requires a **Closed
      testing** track with a minimum number of opted-in testers over a continuous period
      before Production unlocks. Confirm the exact current requirement in Console.
- [ ] E3. Promote release to Production once requirements are met.

## Phase F — Ongoing maintenance

- Normal app updates ship via `npm run build && firebase deploy --only hosting` — no new
  Play release needed (TWA shell loads the live site; SW auto-updates).
- New Android build/Play release only needed for: manifest name/icon/theme changes,
  signing key rotation, or a store-visible `versionCode` bump.
- Keep the Bubblewrap project directory + keystore backed up outside this repo (never
  commit the keystore).

## Verification checklist

- [ ] `assetlinks.json` returns valid JSON with real values; Digital Asset Links tester
      confirms a match against the signed `.aab`.
- [ ] Installed TWA opens full-screen with no browser address bar.
- [ ] Play Console pre-launch report shows no crashes/critical issues.
- [ ] Reviewer test account can log in; report/block flow is reachable.

## SEO improvements made alongside this work (not Play Store specific)

- `og:*` / `twitter:*` meta tags added in `+layout.svelte`, pointing at a generated
  `static/og-image.png` (1200×630 brand card) for rich link previews on social/search.
- `theme-color` and manifest `background_color`/`theme_color` now match the actual brand
  palette (`#1a1006` / `#f97316`) instead of the old unused dark-blue placeholder.
