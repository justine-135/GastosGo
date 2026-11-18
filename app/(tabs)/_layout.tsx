import { Tabs, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './_layout.styles';

function AddFab() {
  const router = useRouter();
  return (
    <View style={styles.fabWrap}>
      <Pressable
        accessibilityLabel="Log an Expense"
        style={styles.fab}
        onPress={() => router.push('/add-expense')}
      >
        <Feather name="plus" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#16A34A', headerShown: true }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Feather name="clock" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: '', tabBarButton: () => <AddFab /> }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => <Feather name="pie-chart" color={color as string} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Feather name="settings" color={color as string} size={size} />,
        }}
      />
    </Tabs>
  );
}
