# Obsidian Ledger - All-in-One Payment & Budget Tracker

[![GitHub forks](https://img.shields.io/github/forks/Sanju0845/Obsidian-ledger-budget--tracker?style=flat-square)](https://github.com/Sanju0845/Obsidian-ledger-budget--tracker/network/members)
[![GitHub stars](https://img.shields.io/github/stars/Sanju0845/Obsidian-ledger-budget--tracker?style=flat-square)](https://github.com/Sanju0845/Obsidian-ledger-budget--tracker/stargazers)
[![GitHub watchers](https://img.shields.io/github/watchers/Sanju0845/Obsidian-ledger-budget--tracker?style=flat-square)](https://github.com/Sanju0845/Obsidian-ledger-budget--tracker/watchers)

**Obsidian Ledger is an all-in-one personal finance management app built with React and Capacitor for Android, combining payment tracking, budget planning, and expense analytics in one sleek, performant application.**

***⚠️ COPYRIGHT NOTICE: This is an original personal project by Sanju0845 (AKA Sanjay Anand Soma).***
***You must provide credit to the original author in ALL cases - personal, educational, or commercial use.***
***The author is NOT responsible for any damages, data loss, security breaches, or misuse of this code.***
***You CANNOT sue the author directly or indirectly for any issues arising from using this project.***
***By using this code, you accept full responsibility for your implementation and any consequences.***

---

## Features

- 💰 **All-in-One Payment Management** - Track expenses, income, and transfers
- 📊 **Budget Tracking** - Set budgets and monitor spending in real-time
- 📱 **Native Android App** - Built with React and Capacitor for smooth performance
- 🎨 **True Black Theme & Glassmorphism** - Beautiful UI optimized for OLED displays
- ⚡ **Optimized for Mid-Range Devices** - Runs smoothly on 4GB/6GB RAM phones
- 🔄 **Framer Motion Animations** - Spring physics for fluid transitions

## Prerequisites

1. **Node.js** (v18+)
2. **Android Studio** (with Android SDK)
3. **Java Development Kit (JDK)** (v17+)

## Steps to Build the APK

### 1. Extract the Project
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

## Optimization for Mid-Range Devices

The app is built using **React** and **Framer Motion** with spring physics, which ensures smooth UI performance even on mid-range devices. The "True Black" theme and glassmorphism effects are optimized for battery efficiency and visual appeal on OLED displays.

## Troubleshooting

- If you encounter errors during `npm install`, try `npm install --legacy-peer-deps`.
- Ensure your Android Studio has the latest **Android SDK Platform** and **Build Tools** installed.
- For build errors, clean the project: `npx cap clean android` then retry.

## Project Structure

```
├── src/                    # React source code
├── android/                # Capacitor native Android project
├── public/                 # Static assets
├── package.json            # Dependencies and scripts
└── capacitor.config.ts     # Capacitor configuration
```

## License

**Dual License:**
- **MIT License** - Use, modify, and distribute freely (see LICENSE-MIT)
- **CC-BY 4.0 (Creative Commons Attribution)** - Any use (including commercial) requires attribution to Sanjay Anand Soma (Sanju0845)

**Full Text:**
```
This project is provided "AS-IS" without any warranty or liability.
The author (Sanju0845/Sanjay Anand Soma) is NOT responsible for:
- Any damages, data loss, or financial losses
- Security breaches or unauthorized access to financial data
- Misuse of this code for malicious purposes
- Any consequences arising from using this project

You may NOT sue the author directly or indirectly for any issues.
By downloading/using this code, you accept full responsibility.
```

## Contributing

If you fork or modify this project, you MUST:
1. ✅ Credit the original author (Sanju0845 / Sanjay Anand Soma)
2. ✅ Link to the original repository
3. ✅ Clearly state what modifications you made
4. ✅ Include this license in your fork

## Contact & Attribution

**Original Author:** Sanju0845 (Sanjay Anand Soma)  
**GitHub:** [@Sanju0845](https://github.com/Sanju0845)

---

**Made with ❤️ by Sanju0845**
