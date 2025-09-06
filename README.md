# TAR App with Instant DB and Magic Code Auth

This app includes a complete authentication flow using Instant DB with Magic Code authentication and Expo Router.

## Features

- Magic Code authentication flow with separate screens
- Protected routes
- Instant DB integration
- Expo Router for navigation
- Keyboard-friendly layouts

## Setup

1. Create an account at [instantdb.com](https://instantdb.com)
2. Create a new app in the Instant DB dashboard
3. Replace `YOUR_INSTANT_APP_ID` in `config/instant.ts` with your actual app ID
4. Run `npm install` to install dependencies
5. Run `npx expo start` to start the app

## Authentication Flow

1. Users enter their email on the login screen
2. Users are navigated to a verification screen
3. A magic code is sent to their email
4. Users enter the code on the verification screen
5. Once authenticated, users are redirected to the main app (workspace)
6. Users can logout from the main screen

## Project Structure

- `app/` - Main app screens
- `app/login.tsx` - Email input screen
- `app/verify.tsx` - Magic code verification screen
- `app/(tabs)/` - Protected tab-based screens
- `config/instant.ts` - Instant DB configuration
- `contexts/AuthContext.tsx` - Authentication context and provider
- `components/ProtectedRoute.tsx` - Component to protect routes

## UX Improvements

- Separate screens for email input and code verification
- Top-aligned content to prevent keyboard conflicts
- No dialog notifications - all feedback is inline
- Proper keyboard handling with KeyboardAvoidingView
- Back navigation between auth screens