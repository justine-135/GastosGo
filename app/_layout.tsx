import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useThemeStore } from '../stores/themeStore';
import { getOrFetchPushToken } from '../lib/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  // Resolve effective color mode: store override > system default
  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  useEffect(() => {
    // Request push token once — subsequent launches hit AsyncStorage cache
    getOrFetchPushToken().catch(console.warn);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode={effectiveMode}>
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
