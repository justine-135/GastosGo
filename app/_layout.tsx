import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, router } from 'expo-router';
import { AppState } from 'react-native';
import { getDb } from '../src/db';
import { hasCompletedOnboarding } from '../src/db/settings';
import { signInAnonymously } from '../src/lib/supabase';
import { drainSyncQueue } from '../src/lib/sync';
import { registerForPushNotifications } from '../src/lib/notifications';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getDb();
    signInAnonymously()
      .then(drainSyncQueue)
      .then(registerForPushNotifications)
      .catch(() => {});

    const onboardingDone = hasCompletedOnboarding(getDb());
    if (!onboardingDone) {
      setReady(true);
      router.replace('/onboarding');
    } else {
      setReady(true);
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') drainSyncQueue().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-expense"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
