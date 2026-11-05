import React, { useEffect } from 'react';
import { Alert, BackHandler } from 'react-native';
import { Stack } from 'expo-router';

// TASK-FE-02 investigation:
// Expo Router v4 resolves sub-routes through the nearest _layout.tsx in the
// same folder. app/onboarding/_layout.tsx (this file) renders a <Stack>, so
// all sibling screens (index, budget, income, biometrics, notifications,
// pin-setup) are auto-registered — no manual Stack.Screen declarations needed.
// The root layout's <Stack.Screen name="onboarding" /> correctly mounts this
// nested layout. The blank-screen risk on Android is not a config gap; it was
// the absence of this nested layout providing a Stack navigator for the group.
// This file already existed, so the fix is confirmed present.

export default function OnboardingLayout() {
  useEffect(() => {
    // TASK-DEVOPS-02: Block Android hardware back button during onboarding.
    // Returning true from the handler consumes the event (no default back action).
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'Exit setup?',
        'Your progress will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ],
      );
      return true; // consumed — prevents navigator from popping
    });
    return () => handler.remove();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // gestureEnabled: false would also block iOS swipe-back; left enabled
        // so the iOS UX is unaffected — the hardware back guard is Android-only.
      }}
    />
  );
}
