# Fit-M8 🏃⚡

**Match people for sports activities — Tinder-style.**

Fit-M8 is a mobile-first Progressive Web App built with SvelteKit, TailwindCSS, and Firebase. Find your perfect 1v1 or 2v2 partner for jogging, padel, tennis, beach volleyball, and more.

## Tech Stack

| Layer    | Choice                                  |
| -------- | --------------------------------------- |
| Frontend | SvelteKit + Svelte 5 (Runes)            |
| Styling  | TailwindCSS v4 with brand tokens        |
| Database | Firestore (NoSQL, real-time)            |
| Auth     | Firebase Auth (Google, Facebook, Email) |
| Storage  | Firebase Storage                        |
| Hosting  | Firebase Hosting (static adapter)       |
| PWA      | vite-plugin-pwa + Workbox               |

## Brand Colors

| Token       | Hex       | Usage                  |
| ----------- | --------- | ---------------------- |
| `primary`   | `#0066FF` | Buttons, active states |
| `secondary` | `#FF5A36` | CTA, highlights        |
| `bg`        | `#F5F7FA` | App background         |
| `surface`   | `#FFFFFF` | Cards                  |
| `text`      | `#0D0D0D` | Body text              |
| `muted`     | `#6B7280` | Subtext                |
| `error`     | `#FF3B30` | Errors                 |
| `success`   | `#34C759` | Success states         |

## Setup

1. Clone and install:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Firebase project values:

   ```bash
   cp .env.example .env
   ```

   Get these from [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps.

3. Enable these Firebase services:
   - **Authentication** → Enable Google, Facebook, Email/Password providers
   - **Firestore Database** → Create in production mode, then deploy rules
   - **Storage** → Enable for profile photos

4. Deploy Firestore security rules:

   ```bash
   firebase deploy --only firestore:rules
   ```

5. Run locally:
   ```bash
   npm run dev
   ```

## Firestore Data Model

```
/users/{uid}                    — profile, activities, city, age
/swipes/{uid}/sent/{targetId}   — like/pass records
/matches/{matchId}              — confirmed matches (1v1 or 2v2)
/chats/{matchId}/messages       — real-time chat
```

## App Routes

| Route             | Description                           |
| ----------------- | ------------------------------------- |
| `/`               | Landing / splash                      |
| `/auth`           | Login & register (social + email)     |
| `/onboarding`     | Profile wizard (4 steps)              |
| `/discover`       | Swipe cards + activity/format filters |
| `/matches`        | Real-time matches list                |
| `/chat/[matchId]` | Real-time chat per match              |
| `/profile`        | View & edit profile1                  |

## Deploy

```bash
npm run build
firebase deploy
```
