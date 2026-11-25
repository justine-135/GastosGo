import { Pressable } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { TabBar } from '../../src/components/TabBar';
import { colors } from '../../src/theme';

function HeaderPlusButton() {
  return (
    <Pressable onPress={() => router.push('/add-expense')} hitSlop={8}>
      <Feather name="plus" size={24} color={colors.brand} />
    </Pressable>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerRight: () => <HeaderPlusButton />,
      }}
      tabBar={props => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="history" options={{ title: 'History' }} />
      <Tabs.Screen name="budgets" options={{ title: 'Budgets' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
