import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { type BottomTabBarProps, type BottomTabViewRoute } from 'expo-router/build/layouts/Tabs';
import { colors, typography } from '../theme';
import { styles } from './TabBar.styles';
import { presentAddExpenseSheet } from '../lib/addExpenseSheet';

const TAB_ROUTES = [
  { name: 'index', label: 'Home', icon: 'home' as const },
  { name: 'history', label: 'History', icon: 'clock' as const },
  { name: 'budgets', label: 'Budgets', icon: 'pie-chart' as const },
  { name: 'settings', label: 'Settings', icon: 'settings' as const },
];

function TabItem({
  label,
  icon,
  isActive,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  isActive: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const iconColor = isActive ? colors.brand : colors.gray2;

  function handlePressIn() {
    Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }).start();
  }

  return (
    <Pressable
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Feather name={icon} size={24} color={iconColor} />
      </Animated.View>
      <Text
        style={[typography.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabel]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FabButton() {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(scale, { toValue: 0.9, duration: 120, useNativeDriver: true }).start();
  }

  function handlePressOut() {
    Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
  }

  return (
    <View style={styles.fabSlot}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={presentAddExpenseSheet}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel="Log an Expense"
        >
          <LinearGradient
            colors={['#7389F9', '#4F6EF7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const leftTabs = TAB_ROUTES.slice(0, 2);
  const rightTabs = TAB_ROUTES.slice(2);

  function isRouteActive(routeName: string) {
    return state.routes[state.index].name === routeName;
  }

  function handleTabPress(routeName: string) {
    const targetRoute = state.routes.find((route: BottomTabViewRoute) => route.name === routeName);
    if (!targetRoute) return;
    navigateToTab(targetRoute.key);
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={styles.blurFill} />
      {leftTabs.map(tab => (
        <TabItem
          key={tab.name}
          label={tab.label}
          icon={tab.icon}
          isActive={isRouteActive(tab.name)}
          onPress={() => handleTabPress(tab.name)}
        />
      ))}
      <FabButton />
      {rightTabs.map(tab => (
        <TabItem
          key={tab.name}
          label={tab.label}
          icon={tab.icon}
          isActive={isRouteActive(tab.name)}
          onPress={() => handleTabPress(tab.name)}
        />
      ))}
    </View>
  );
}
