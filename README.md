# Obsidian Ledger - Native Android Build Guide

This project is already integrated with **Capacitor** to allow you to build a native Android APK.

## Prerequisites
1. **Node.js** (v18+)
2. **Android Studio** (with Android SDK)
3. **Java Development Kit (JDK)** (v17+)

## Steps to Build the APK

### 1. Extract the ZIP
Download and extract the project ZIP file to a folder on your computer.

### 2. Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
npm install
```

### 3. Build the Web Application
Run the build command to generate the production-ready web files:
```bash
npm run build
```

### 4. Sync with Capacitor
Sync the web assets with the native Android project:
```bash
npx cap sync android
```

### 5. Open in Android Studio
Open the `android` folder in Android Studio:
```bash
npx cap open android
```

### 6. Generate the APK
In Android Studio:
1. Wait for Gradle to finish syncing.
2. Go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
3. Once finished, a notification will appear. Click **locate** to find your `app-debug.apk`.

## Optimization for 4GB/6GB RAM Devices
The app is built using **React** and **Framer Motion** with spring physics, which ensures smooth UI performance even on mid-range devices. The "True Black" theme and glassmorphism effects are optimized for modern mobile displays.

## Troubleshooting
- If you encounter errors during `npm install`, try `npm install --legacy-peer-deps`.
- Ensure your Android Studio has the latest **Android SDK Platform** and **Build Tools** installed.
