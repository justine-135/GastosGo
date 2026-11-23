import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { AppState } from 'react-native';
import { getDb } from '../src/db';
import { hasCompletedOnboarding, loadSettings } from '../src/db/settings';
import { getLatestCycleSnapshot, insertCycleSnapshot, CycleSnapshot } from '../src/db/cycleSnapshots';
import { cycleStartDate, needsNewCycleSnapshot } from '../src/utils/cycleDate';
import { todayStr } from '../src/utils/fmtPeso';
import { signInAnonymously } from '../src/lib/supabase';
import { drainSyncQueue } from '../src/lib/sync';
import { registerForPushNotifications } from '../src/lib/notifications';
import NewCyclePrompt from '../src/components/NewCyclePrompt';

interface CyclePromptData {
  cycleStartDate: string;
  defaultValues: {
    incomeMode: CycleSnapshot['income_mode'];
    monthlySalary: number;
    freelanceIncome: number;
    expectedSavings: number;
    savingsTarget: number;
  };
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });
  const [cyclePromptData, setCyclePromptData] = useState<CyclePromptData | null>(null);

  useEffect(() => {
    getDb();
    signInAnonymously()
      .then(drainSyncQueue)
      .then(registerForPushNotifications)
      .catch(() => {});

    if (!hasCompletedOnboarding(getDb())) {
      router.replace('/onboarding/welcome');
      return;
    }

    const db = getDb();
    const settings = loadSettings(db);
    const today = todayStr();
    const latestSnapshot = getLatestCycleSnapshot(db);
    const startDate = cycleStartDate(today, settings.budgetCycleDay);

    if (needsNewCycleSnapshot(today, settings.budgetCycleDay, latestSnapshot?.cycle_start_date ?? null)) {
      if (!latestSnapshot) {
        insertCycleSnapshot(db, {
          cycleStartDate: startDate,
          incomeMode: settings.incomeMode,
          monthlySalary: settings.monthlySalary,
          freelanceIncome: settings.freelanceIncome,
          expectedSavings: settings.expectedSavings,
          savingsTarget: settings.savingsTarget,
        });
      } else {
        setCyclePromptData({
          cycleStartDate: startDate,
          defaultValues: {
            incomeMode: latestSnapshot.income_mode,
            monthlySalary: latestSnapshot.monthly_salary,
            freelanceIncome: latestSnapshot.freelance_income,
            expectedSavings: latestSnapshot.expected_savings,
            savingsTarget: latestSnapshot.savings_target,
          },
        });
      }
    }

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') drainSyncQueue().catch(() => {});
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="add-expense" options={{ presentation: 'transparentModal', headerShown: false }} />
        <Stack.Screen name="category-picker" options={{ headerShown: false }} />
        <Stack.Screen name="budget-edit" options={{ headerShown: false }} />
        <Stack.Screen name="settings/income-mode" options={{ headerShown: false }} />
        <Stack.Screen name="settings/budget-cycle" options={{ headerShown: false }} />
        <Stack.Screen name="settings/recently-deleted" options={{ headerShown: false }} />
        <Stack.Screen name="recurring-rules" options={{ headerShown: false }} />
      </Stack>
      {cyclePromptData && (
        <NewCyclePrompt
          key={cyclePromptData.cycleStartDate}
          cycleStartDate={cyclePromptData.cycleStartDate}
          defaultValues={cyclePromptData.defaultValues}
          onConfirm={() => setCyclePromptData(null)}
        />
      )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
