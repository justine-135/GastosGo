import { Text } from "react-native";
import { Tabs } from "expo-router";
import { colors } from "../../theme";

const c = colors.light;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.mutedForeground,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: c.border,
          height: 80,
          paddingBottom: 14,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Home", tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="budgets"
        options={{ title: "Budgets", tabBarIcon: ({ color }) => <TabIcon emoji="🎯" color={color} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: "Insights", tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" color={color} /> }}
      />
    </Tabs>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabIcon({ emoji }: { emoji: string; color?: any }) {
  return <Text style={{ fontSize: 21 }}>{emoji}</Text>;
}
