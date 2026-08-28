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
- [ ] D3. Questionnaires: Content rating, Data Safety (declare account/profile info,
      location, photos, presence, chat messages — consistent with `/privacy`), Target
      audience, Ads declaration, Dating/social declarations if prompted.
- [ ] D4. App content → App access: provide reviewers a test account or documented login
      instructions (app requires auth).

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
