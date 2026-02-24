# Expense Tracking App 💰

A personal finance mobile application built with Expo and React Native, featuring secure authentication and expense tracking.

## Features

- ✅ **Secure Authentication**: Email/password login with Supabase
- ✅ **Biometric Login**: Face ID, Touch ID, and Fingerprint support
- ✅ **Email Verification**: Confirm user accounts via email
- ✅ **Password Reset**: Easy password recovery flow
- ✅ **Session Persistence**: Stay logged in across app restarts
- 🚧 **Expense Tracking**: Coming soon!

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

```
app/
├── (tabs)/           # Protected tab navigation
│   ├── index.tsx     # Home/Expenses screen
│   └── explore.tsx   # Explore screen
├── auth/             # Authentication screens
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   └── verify-email.tsx
└── _layout.tsx       # Root layout with auth protection

contexts/
└── AuthContext.tsx   # Global authentication state

lib/
├── supabase.ts       # Supabase client configuration
└── auth-utils.ts     # Authentication helper functions

components/
├── auth/             # Reusable auth components
│   ├── AuthInput.tsx
│   ├── AuthButton.tsx
│   └── SocialAuthButtons.tsx

types/
└── auth.ts           # TypeScript type definitions
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
