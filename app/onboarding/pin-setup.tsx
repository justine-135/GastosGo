// Onboarding Screen 4 — PIN Setup
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

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
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        confirmPin,
      );
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
          {saving && <ActivityIndicator color="#F4A261" style={{ marginTop: 8 }} />}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingTop: 32, paddingBottom: 48 },
  stepRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5D5C0' },
  dotActive: { backgroundColor: '#F4A261', width: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#2D3047', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  pinRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  pinDot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: '#E5D5C0', backgroundColor: 'transparent',
  },
  pinDotFilled: { backgroundColor: '#F4A261', borderColor: '#F4A261' },
  errorText: { fontSize: 14, color: '#E76F51', fontWeight: '500', textAlign: 'center' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  key: {
    width: '30%', aspectRatio: 1.4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5D5C0', minHeight: 56,
  },
  keyInvisible: { backgroundColor: 'transparent', borderColor: 'transparent' },
  keyText: { fontSize: 24, fontWeight: '500', color: '#2D3047' },
});
