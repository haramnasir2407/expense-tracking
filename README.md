# Expense Tracking App

A personal finance mobile application built with Expo and React Native, featuring secure authentication, rich expense tracking, analytics, and budgeting.

## Features

- **Secure Authentication**: Email/password login powered by Supabase Auth
- **Biometric Login**: Face ID / Touch ID / fingerprint support where available
- **Email Verification**: Confirm user accounts via email before full access
- **Password Reset**: Complete forgot/reset password flows with strength meter
- **Session Persistence**: Stay logged in across app restarts
- **Expense Tracking**:
  - Add, edit, and delete expenses
  - Attach receipt images to expenses
  - Group expenses by day with friendly labels (Today, Yesterday, etc.)
- **Budgets**:
  - Create and edit monthly category budgets
  - See per‑category budget usage and remaining amounts
  - Monthly budget summary card for quick overview
- **Analytics Dashboard**:
  - Visualize spending with charts (bar, line, pie)
  - Filter by common date ranges
- **Notifications & Sync**:
  - Notification settings for budgeting and reminders
  - Sync layer for persisting data via Supabase / SQLite
- **Theming & UX**:
  - Light/Dark mode aware via a centralized color system
  - Reusable primitives like `ThemedView`, `ThemedText`, and `HapticTab`

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up authentication (required before first run)

   See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed instructions on:
   - Creating a Supabase project
   - Configuring environment variables
   - Testing the authentication flow

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Project Structure

High‑level overview (not exhaustive):

```
app/
├── (tabs)/                  # Protected tab navigation
│   ├── index.tsx            # Home / recent expenses
│   ├── analytics.tsx        # Analytics dashboard
│   ├── budgets.tsx          # Budgets screen
│   └── profile.tsx          # Profile & settings
├── auth/                    # Authentication flows
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── verify-email.tsx
└── expenses/                # Expense‑specific routes
    ├── add.tsx
    └── [id].tsx             # Expense detail / edit

components/
├── primitives/              # Base UI primitives
│   ├── themed-view.tsx
│   ├── themed-text.tsx
│   └── haptic-tab.tsx
├── auth/                    # Auth views & inputs
├── expenses/                # Expense views & shared UI
├── budgets/                 # Budget views & cards
├── analytics/               # Charts & analytics UI
└── profile/                 # Profile screen UI

contexts/
├── AuthContext.tsx          # Global authentication state
└── (other domain contexts)

lib/
├── supabase.ts              # Supabase client configuration
├── auth-utils.ts            # Authentication helpers
├── expenses-*.ts            # Expense data access (Supabase / SQLite)
├── storage-*.ts             # Storage helpers (Supabase / local)
├── sync-service.ts          # Sync & background logic
└── budgets.ts               # Budget data helpers

types/
├── auth.ts                  # Auth types
├── expense.ts               # Expense types
└── budget.ts                # Budget types
```

## Technology Stack

- **Framework**: Expo 54 + React Native
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Secure Storage**: Expo SecureStore
- **Biometric Auth**: Expo Local Authentication

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
