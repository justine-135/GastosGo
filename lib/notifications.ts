// FE-12: Push notification client registration
// Token saved to AsyncStorage to avoid re-fetching on every launch.
// Supabase upsert is stubbed until BE-04/BE-07 are ready.

import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { NavigationContainerRef } from '@react-navigation/native';

const TOKEN_KEY = 'gastosgo-push-token';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getOrFetchPushToken(): Promise<string | null> {
  const cached = await AsyncStorage.getItem(TOKEN_KEY);
  if (cached) return cached;

  const granted = await requestNotificationPermission();
  if (!granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) {
    console.warn('No EAS projectId found in app.json. Push token not retrieved.');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await AsyncStorage.setItem(TOKEN_KEY, token);

  // ⚠️ BACKEND REQUIRED (BE-07): upsert token to Supabase profiles.expo_push_token
  // await supabase.from('profiles').update({ expo_push_token: token }).eq('user_id', userId);

  return token;
}

type NavRef = NavigationContainerRef<Record<string, object | undefined>>;

export function registerNotificationResponseHandler(navRef: React.RefObject<NavRef>) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, string> | undefined;
    if (!data) return;

    if (data.screen === 'budget') {
      navRef.current?.navigate('(tabs)', { screen: 'budgets' });
    } else if (data.screen === 'recurring') {
      navRef.current?.navigate('(tabs)', { screen: 'expenses' });
    }
  });
}
