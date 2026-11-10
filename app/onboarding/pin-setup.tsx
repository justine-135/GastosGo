// Onboarding Screen 4 — PIN Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator,
} from 'react-native';
import styles from './pin-setup.styles';
import { colors } from '../../theme/index';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { hashPin } from '../../utils/pinSecurity';

const PIN_KEY = 'gastosgo-pin-hash';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'] as const;

export default function OnboardingPINSetup() {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function handleDigit(d: number | 'del' | null) {
    if (d === null) return;
    setError('');
    if (step === 'enter') {
      if (d === 'del') { setPin((p) => p.slice(0, -1)); return; }
      const next = pin + d;
      if (next.length <= 6) setPin(next);
      if (next.length === 6) setStep('confirm');
    } else {
      if (d === 'del') { setConfirm((c) => c.slice(0, -1)); return; }
      const next = confirm + d;
      if (next.length <= 6) setConfirm(next);
      if (next.length === 6) handleConfirm(next);
    }
  }

  async function handleConfirm(confirmPin: string) {
    if (confirmPin !== pin) {
      setError("PINs don't match. Try again.");
      setConfirm('');
      setStep('enter');
      setPin('');
      return;
    }
    setSaving(true);
    try {
      const hash = await hashPin(confirmPin);
      await SecureStore.setItemAsync(PIN_KEY, hash);
      router.push('/onboarding/biometrics');
    } finally {
      setSaving(false);
    }
  }

  const displayPin = step === 'enter' ? pin : confirm;
  const title = step === 'enter' ? 'Create a PIN' : 'Confirm your PIN';
  const subtitle = step === 'enter'
    ? 'Choose a 6-digit PIN to protect your data.'
    : 'Enter your PIN again to confirm.';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Step 4 of 6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 3 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* PIN dots */}
          <View style={styles.pinRow} accessibilityLabel={`${displayPin.length} of 6 digits entered`}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} style={[styles.pinDot, i < displayPin.length && styles.pinDotFilled]} />
            ))}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {saving && <ActivityIndicator color={colors.light.primary} style={{ marginTop: 8 }} />}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          {DIGITS.map((d, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.key, d === null && styles.keyInvisible]}
              onPress={() => handleDigit(d)}
              disabled={d === null || saving}
              accessibilityRole="button"
              accessibilityLabel={d === 'del' ? 'Delete' : d === null ? '' : String(d)}
            >
              <Text style={styles.keyText}>{d === 'del' ? '⌫' : d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

