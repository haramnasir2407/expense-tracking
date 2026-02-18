# Authentication Setup Guide

This guide will help you set up and test the authentication system for your Expense Tracking app.

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- A Supabase account (free tier works great)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in the following:
   - **Name**: expense-tracker (or any name you prefer)
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to you
4. Click "Create new project" and wait for it to initialize (1-2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll find two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **Project API Key (anon public)**: A long string starting with `eyJ...`

## Step 3: Configure Environment Variables

1. Open the `.env` file in the project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Configure Supabase Email Settings

### Enable Email Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Find "Email" and make sure it's **enabled**
3. Configure email settings:
   - **Enable email confirmations**: ON (recommended)
   - **Secure email change**: ON (recommended)

### Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. You can customize the following templates:
   - **Confirm signup**: Sent when a user registers
   - **Magic Link**: For passwordless login (future feature)
   - **Change Email Address**: When user changes email
   - **Reset Password**: For password reset flow

For development, you can use the default templates.

## Step 5: Run the App

1. Start the development server:

```bash
npm start
```

2. Choose your platform:
   - Press `i` for iOS Simulator (macOS only)
   - Press `a` for Android Emulator
   - Scan the QR code with Expo Go app on your physical device

## Testing the Authentication Flow

### Test 1: Registration

1. Launch the app - you should see the **Login** screen
2. Tap "Sign Up" at the bottom
3. Fill in the registration form:
   - Enter a valid email address
   - Create a strong password (8+ chars, letters + numbers)
   - Confirm your password
   - Check the Terms of Service box
4. Tap "Create Account"
5. You should be redirected to the **Verify Email** screen

### Test 2: Email Verification

1. Check your email inbox (and spam folder) for a verification email from Supabase
2. Click the verification link in the email
3. Return to the app and tap "I've Verified My Email"
4. If verified successfully, you'll be taken to the **Expenses** screen

**Note**: During development, you can skip verification by tapping "Skip for now"

### Test 3: Login with Email/Password

1. Sign out from the app (tap the logout icon in the top right)
2. Enter your email and password on the **Login** screen
3. Tap "Login"
4. You should be redirected to the **Expenses** screen

### Test 4: Biometric Authentication Setup

1. After your first successful login, a modal will appear asking to enable biometric authentication
2. Tap "Enable [Face ID/Touch ID/Fingerprint]" (depending on your device)
3. Authenticate with your biometric
4. On future logins, you'll see a "Login with Biometric" button

### Test 5: Biometric Login

1. Sign out from the app
2. On the login screen, tap "Login with Biometric" (if you enabled it in Test 4)
3. Authenticate with your biometric (Face ID, Touch ID, or Fingerprint)
4. You should be logged in without entering your password

### Test 6: Forgot Password

1. On the **Login** screen, tap "Forgot Password?"
2. Enter your email address
3. Tap "Send Reset Link"
4. Check your email for the password reset link
5. Click the link and you'll be redirected to the **Set New Password** screen
6. Enter and confirm your new password
7. Tap "Reset Password"
8. You can now login with your new password

### Test 7: Toggle Biometric Settings

1. Once logged in, go to the **Expenses** screen
2. Tap on "Enable/Disable Biometric Login"
3. Confirm your choice
4. Try signing out and back in to test the change

### Test 8: Session Persistence

1. Close the app completely (force quit)
2. Reopen the app
3. You should remain logged in and see the **Expenses** screen
4. This confirms that the session is properly stored in SecureStore

## Common Issues and Solutions

### Issue: Email not received

**Solutions**:

- Check spam/junk folder
- Verify email is correct in Supabase dashboard
- Check Supabase email rate limits (max 3-4 emails per hour on free tier)
- For development, you can check the Supabase dashboard → Authentication → Users to manually confirm users

### Issue: "Invalid email or password"

**Solutions**:

- Double-check your credentials
- Make sure email verification is not required for login (check Supabase settings)
- Check Supabase logs in Dashboard → Logs → Auth Logs

### Issue: Biometric not working

**Solutions**:

- Make sure your device has biometric hardware (Face ID, Touch ID, or Fingerprint)
- Ensure biometric is set up in device settings
- For iOS simulator: Face ID can be simulated via Features → Face ID → Enrolled
- For Android emulator: Fingerprint must be configured in emulator settings

### Issue: App crashes on startup

**Solutions**:

- Make sure all dependencies are installed: `npm install`
- Clear Metro bundler cache: `npx expo start -c`
- Check that `.env` file has valid Supabase credentials
- Verify Supabase project is active and running

### Issue: "EXPO_PUBLIC_SUPABASE_URL is not defined"

**Solutions**:

- Restart the Expo development server after adding/updating `.env` file
- Make sure `.env` file is in the project root
- Environment variables must start with `EXPO_PUBLIC_` to be accessible in the app

## Next Steps

Now that authentication is working, you can:

1. **Create expense tracking features**: Add, edit, delete expenses
2. **Set up Supabase database**: Create tables for expenses, categories, budgets
3. **Implement data sync**: Save expenses to Supabase
4. **Add analytics**: Track spending by category, time period, etc.
5. **Export data**: Allow users to export their expenses as CSV/PDF

## Security Best Practices

- ✅ Passwords are hashed by Supabase (never stored in plain text)
- ✅ Auth tokens are stored in encrypted SecureStore
- ✅ Session auto-refresh prevents token expiration issues
- ✅ Biometric auth adds an extra layer of security
- ✅ Email verification prevents unauthorized registrations

## Architecture Overview

```
User Registration/Login
  ↓
Supabase Authentication
  ↓
JWT Token Generation
  ↓
Expo SecureStore (Encrypted)
  ↓
AuthContext (Global State)
  ↓
Protected Routes (Tabs)
```

## Support

If you encounter any issues:

1. Check the console logs for error messages
2. Review Supabase dashboard logs
3. Refer to the Supabase docs: https://supabase.com/docs
4. Check Expo docs: https://docs.expo.dev