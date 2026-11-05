---
name: project-stack
description: GastosGo mobile app tech stack, key dependency versions, and native module peer-dep requirements
metadata:
  type: project
---

GastosGo is a React Native / Expo 52 app using expo-router v4, TypeScript, Drizzle ORM with expo-sqlite, and @tanstack/react-query v5.

Key native deps and peer-dep notes:
- `react-native-reanimated` ~3.16.0 — required by victory-native v36+
- `react-native-svg` ^15.16.0 — required peer dep of victory-native v36+ (was missing at project init; added 2026-11-05)
- `victory-native` ^41.26.0 — uses PolarChart/Pie API (v36+ style); installed 2026-11-05

**Why:** victory-native was declared in package.json but react-native-svg (its peer dep) was absent, causing Metro bundler crash on the Insights screen.
**How to apply:** Any future charting additions via victory-native v36+ also need react-native-svg present.
