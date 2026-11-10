// Onboarding Screen 5 — Biometrics Opt-in
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import styles from './biometrics.styles';
import { white } from '../../theme/index';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRICS_KEY = 'gastosgo-biometrics-enabled';

export default function OnboardingBiometrics() {
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((has) => {
      if (!has) return;
      LocalAuthentication.isEnrolledAsync().then(setSupported);
    });
  }, []);

  async function handleEnable() {
    setLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm your identity to enable biometrics',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        await SecureStore.setItemAsync(BIOMETRICS_KEY, 'true');
      }
    } finally {
      setLoading(false);
      router.push('/onboarding/notifications');
    }
  }

  function handleSkip() {
    router.push('/onboarding/notifications');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Step 5 of 6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 4 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.emoji}>🔐</Text>
          <Text style={styles.title}>Use Biometrics?</Text>
          <Text style={styles.subtitle}>
            {supported
              ? 'Unlock GastosGo faster with Face ID or fingerprint instead of your PIN.'
              : 'No biometric hardware detected on this device. You can still use your PIN.'}
          </Text>
        </View>

        <View style={styles.actions}>
          {supported && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleEnable}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Enable biometric unlock"
            >
              {loading
                ? <ActivityIndicator color={white} />
                : <Text style={styles.primaryBtnText}>Enable Biometrics</Text>}
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={handleSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip biometrics setup"
          >
            <Text style={styles.skipBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

