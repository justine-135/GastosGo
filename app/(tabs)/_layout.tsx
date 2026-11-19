import { Tabs } from 'expo-router';
import { TabBar } from '../../src/components/TabBar';
import { AddExpenseSheet } from '../../src/components/AddExpenseSheet';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={props => <TabBar {...props} />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="budgets" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <AddExpenseSheet />
    </>
  );
}
