import React, { useEffect, useState } from 'react';
import { useColorScheme, LogBox } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, usePathname, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../stores/themeStore';
import { getOrFetchPushToken } from '../lib/notifications';
import { runMigrations } from '../db/migrate';

if (process.env.EXPO_E2E === 'true') LogBox.ignoreAllLogs(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();
  const pathname = usePathname();
  const navState = useRootNavigationState();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Resolve effective color mode: store override > system default
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  useEffect(() => {
    runMigrations().catch(console.error);
    // Request push token once — subsequent launches hit AsyncStorage cache
    getOrFetchPushToken().catch(console.warn);
  }, []);

  useEffect(() => {
    // Guard: navigator must be mounted before we can call router.replace
    if (!navState?.key) return;
    // On cold start, redirect to lock screen if a PIN hash exists
    SecureStore.getItemAsync('gastosgo-pin-hash').then((hash) => {
      if (hash && pathname !== '/lock') {
        router.replace('/lock');
      }
      setIsAuthChecking(false);
    }).catch(() => setIsAuthChecking(false));
    // Only run once navigator is ready — pathname intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.key]);

  // Fallback: if navState never initializes (e.g. deadlock), unblock render after 3s
  useEffect(() => {
    const t = setTimeout(() => setIsAuthChecking(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (isAuthChecking) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider colorMode={effectiveMode}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="lock" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="modals/add-expense" options={{ presentation: 'modal' }} />
          <Stack.Screen name="modals/add-recurring" options={{ presentation: 'modal' }} />
        </Stack>
      </GluestackUIProvider>
    </QueryClientProvider>
  );
}
