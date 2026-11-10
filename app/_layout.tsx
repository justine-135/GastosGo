import React, { useEffect, useRef, useState } from 'react';
import { useColorScheme, LogBox, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, router, usePathname, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useThemeStore } from '../stores/themeStore';
import { getOrFetchPushToken } from '../lib/notifications';
import { runMigrations } from '../db/migrate';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { migrationStyles } from './_layout.styles';
import { colors } from '../theme/index';

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
  const [migrationError, setMigrationError] = useState(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resolve effective color mode: store override > system default
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  useEffect(() => {
    runMigrations().catch((err) => {
      console.error('[RootLayout] Migration failed:', err);
      setMigrationError(true);
    });
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
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      setIsAuthChecking(false);
    }).catch(() => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      setIsAuthChecking(false);
    });
    // Only run once navigator is ready — pathname intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navState?.key]);

  // Fallback: if navState never initializes (e.g. deadlock), unblock render after 3s
  useEffect(() => {
    fallbackTimerRef.current = setTimeout(() => setIsAuthChecking(false), 3000);
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  // No native splash configured — show a centered spinner while auth resolves
  // shortcut: ActivityIndicator only; upgrade to SplashScreen.preventAutoHideAsync when splash asset is added
  if (isAuthChecking) {
    return (
      <View style={migrationStyles.container}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (migrationError) {
    return (
      <View style={migrationStyles.container}>
        <Text style={migrationStyles.title} accessibilityRole="header">
          Couldn't prepare your data
        </Text>
        <Text style={migrationStyles.message}>
          There was a problem setting up the local database. Please try again.
        </Text>
        <TouchableOpacity
          style={migrationStyles.button}
          onPress={() => {
            setMigrationError(false);
            runMigrations().catch((err) => {
              console.error('[RootLayout] Migration retry failed:', err);
              setMigrationError(true);
            });
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry database setup"
        >
          <Text style={migrationStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

