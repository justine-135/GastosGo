// Onboarding Screen 6 — Push Notification Opt-in
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import styles from './notifications.styles';
import { white } from '../../theme/index';
import { router } from 'expo-router';
import { requestNotificationPermission } from '../../lib/notifications';

export default function OnboardingNotifications() {
  const [loading, setLoading] = useState(false);

  async function handleEnable() {
    setLoading(true);
    try {
      await requestNotificationPermission();
    } finally {
      setLoading(false);
      // setTimeout defers the replace to avoid react-native-screens fragment race
      setTimeout(() => router.replace('/(tabs)'), 0);
    }
  }

  function handleSkip() {
    setTimeout(() => router.replace('/(tabs)'), 0);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Step 6 of 6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 5 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.emoji}>🔔</Text>
          <Text style={styles.title}>Stay on Track</Text>
          <Text style={styles.subtitle}>
            Get reminders for upcoming bills and budget alerts so you never miss a payment.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleEnable}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Enable push notifications"
          >
            {loading
              ? <ActivityIndicator color={white} />
              : <Text style={styles.primaryBtnText}>Enable Notifications</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Not now"
          >
            <Text style={styles.skipBtnText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

