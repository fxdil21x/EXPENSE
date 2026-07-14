# Expense Tracker

A professional, mobile-first, multi-user expense tracker built with React, Vite, and Firebase.

## Features

- Google sign-in for every user (Firebase Authentication)
- New accounts require admin approval before they can use the app
- Daily expense entries grouped by date, under categories ("heads") each user manages themselves
- A dedicated **Insights** tab with monthly totals, month-over-month change, category breakdown, and a 6-month trend
- An **Admin** tab to approve, reject, or revoke access for other users
- All data lives in Firestore, scoped per user

## One-time Firebase setup

1. In the [Firebase console](https://console.firebase.google.com/), open your project.
2. **Authentication → Sign-in method** → enable the **Google** provider.
3. **Authentication → Settings → Authorized domains** → add `localhost` (already there by default) and your production domain when you deploy.
4. **Firestore Database** → create a database (production mode is fine — the rules below lock it down).
5. **Firestore Database → Rules** → paste the contents of [`firestore.rules`](./firestore.rules) and publish.
6. **Project settings → General → Your apps → Web app** → copy the config values into `.env` (see below).

## Environment variables

Copy `.env.example` to `.env` and fill in your Firebase web app config:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAILS=you@example.com
```

`VITE_ADMIN_EMAILS` is a comma-separated list of Google account emails that are automatically
approved as admins on their first sign-in. **This must match the `isAdminEmail` list at the top
of `firestore.rules`** — the client list only drives the UI, the rules list is what's actually
enforced, so update both together if you add another admin.

## Run locally

```bash
npm install
npm run dev
```

Open the app in your browser at the address shown by Vite, and sign in with a Google account
listed in `VITE_ADMIN_EMAILS` to get instant admin access. Any other account will land on a
"waiting for approval" screen until an admin approves it from the **Admin** tab.

## Build

```bash
npm run build
```
