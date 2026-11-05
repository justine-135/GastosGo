// Onboarding Screen 6 — Push Notification Opt-in
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
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
      router.replace('/(tabs)');
    }
  }

  function handleSkip() {
    router.replace('/(tabs)');
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
              ? <ActivityIndicator color="#FFFFFF" />
              : <Text style={styles.primaryBtnText}>Enable Notifications</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip notifications setup"
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingTop: 32, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5D5C0' },
  dotActive: { backgroundColor: '#F4A261', width: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emoji: { fontSize: 72 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3047', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#F4A261', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', minHeight: 56,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  skipBtn: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center', minHeight: 56,
    justifyContent: 'center',
  },
  skipBtnText: { fontSize: 16, color: '#6B7280' },
});
