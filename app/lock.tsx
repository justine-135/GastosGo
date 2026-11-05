// FE-03: PIN / Biometric Lock Screen
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  AppState, type AppStateStatus, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { PinPad } from '../components/PinPad';

const PIN_KEY = 'gastosgo-pin-hash';
const FAIL_COUNT_KEY = 'gastosgo-pin-fail-count';
const LOCKOUT_UNTIL_KEY = 'gastosgo-pin-lockout-until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

type Mode = 'verify' | 'setup' | 'change';

export default function LockScreen() {
  const { mode: paramMode } = useLocalSearchParams<{ mode?: Mode }>();
  const mode: Mode = paramMode ?? 'verify';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const appState = useRef(AppState.currentState);

  // Check lockout on mount
  useEffect(() => {
    checkLockout();
    tryBiometric();
  }, []);

  // Countdown timer when locked out
  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setCountdown(0);
        AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
        AsyncStorage.setItem(FAIL_COUNT_KEY, '0');
        clearInterval(interval);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Lock on app background return
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current === 'background' && next === 'active') {
        setPin('');
        setError('');
        checkLockout();
        tryBiometric();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  async function checkLockout() {
    const until = await AsyncStorage.getItem(LOCKOUT_UNTIL_KEY);
    if (until) {
      const ts = parseInt(until, 10);
      if (ts > Date.now()) {
        setLockoutUntil(ts);
        setCountdown(Math.ceil((ts - Date.now()) / 1000));
      } else {
        await AsyncStorage.removeItem(LOCKOUT_UNTIL_KEY);
        await AsyncStorage.setItem(FAIL_COUNT_KEY, '0');
      }
    }
  }

  async function tryBiometric() {
    if (mode !== 'verify') return;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !enrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock GastosGo',
        fallbackLabel: 'Use PIN',
      });
      if (result.success) navigateToApp();
      // failure falls through — PIN pad is already visible
    } catch {
      // biometric unavailable or OS error — PIN pad remains for user
    }
  }

  function navigateToApp() {
    if (mode === 'change') {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }

  const handleDigit = useCallback((d: string) => {
    if (lockoutUntil) return;
    setError('');
    if (mode === 'setup' || (mode === 'change' && step === 'confirm')) {
      if (step === 'enter') setPin((p) => p.length < 6 ? p + d : p);
      else setConfirmPin((p) => p.length < 6 ? p + d : p);
    } else {
      setPin((p) => p.length < 6 ? p + d : p);
    }
  }, [lockoutUntil, mode, step]);

  const handleBackspace = useCallback(() => {
    if (step === 'confirm') setConfirmPin((p) => p.slice(0, -1));
    else setPin((p) => p.slice(0, -1));
  }, [step]);

  const handleClear = useCallback(() => {
    if (step === 'confirm') setConfirmPin('');
    else setPin('');
  }, [step]);

  // Auto-submit when 4+ digits entered
  useEffect(() => {
    const current = step === 'confirm' ? confirmPin : pin;
    if (current.length < 4) return;

    const timer = setTimeout(() => submitPin(current), 150);
    return () => clearTimeout(timer);
  }, [pin, confirmPin, step]);

  async function submitPin(entered: string) {
    if (mode === 'verify' || (mode === 'change' && step === 'enter')) {
      const stored = await SecureStore.getItemAsync(PIN_KEY);
      const hashed = await hashPin(entered);

      if (!stored && mode === 'verify') {
        // No PIN set — go straight to app
        navigateToApp();
        return;
      }

      if (stored === hashed) {
        await AsyncStorage.setItem(FAIL_COUNT_KEY, '0');
        if (mode === 'change') {
          setStep('confirm');
          setPin('');
        } else {
          navigateToApp();
        }
      } else {
        const countStr = await AsyncStorage.getItem(FAIL_COUNT_KEY);
        const count = parseInt(countStr ?? '0', 10) + 1;
        await AsyncStorage.setItem(FAIL_COUNT_KEY, String(count));

        if (count >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          await AsyncStorage.setItem(LOCKOUT_UNTIL_KEY, String(until));
          setLockoutUntil(until);
          setCountdown(LOCKOUT_SECONDS);
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - count} attempt${MAX_ATTEMPTS - count === 1 ? '' : 's'} left.`);
        }
        setPin('');
      }
    } else if (mode === 'setup' || (mode === 'change' && step === 'confirm')) {
      if (step === 'enter') {
        setStep('confirm');
        setPin('');
      } else {
        // Confirm step
        if (pin !== entered) {
          setError('PINs do not match. Try again.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
        } else {
          const hashed = await hashPin(entered);
          await SecureStore.setItemAsync(PIN_KEY, hashed);
          navigateToApp();
        }
      }
    }
  }

  const dots = step === 'confirm' ? confirmPin : pin;
  const isLockedOut = !!lockoutUntil;

  const headerText =
    isLockedOut ? `Too many attempts` :
    mode === 'setup' ? (step === 'enter' ? 'Create a PIN' : 'Confirm your PIN') :
    mode === 'change' ? (step === 'enter' ? 'Enter current PIN' : 'Enter new PIN') :
    'Enter PIN';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.appName}>GastosGo</Text>
        <Text style={styles.header}>{headerText}</Text>

        {/* PIN dots */}
        <View style={styles.dotsRow} accessibilityLabel={`${dots.length} digits entered`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[styles.pinDot, i < dots.length && styles.pinDotFilled]} />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {isLockedOut ? (
          <Text style={styles.lockout}>Try again in {countdown}s</Text>
        ) : null}

        <PinPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onClear={handleClear}
          disabled={isLockedOut}
        />

        {mode === 'setup' && (
          <Text style={styles.hint}>Choose a 4–6 digit PIN to protect your financial data.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 32 },
  appName: { fontSize: 24, fontWeight: '700', color: '#F4A261' },
  header: { fontSize: 20, fontWeight: '600', color: '#2D3047', textAlign: 'center' },
  dotsRow: { flexDirection: 'row', gap: 16 },
  pinDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#E5D5C0', backgroundColor: 'transparent',
  },
  pinDotFilled: { backgroundColor: '#F4A261', borderColor: '#F4A261' },
  error: { fontSize: 14, color: '#E76F51', textAlign: 'center' },
  lockout: { fontSize: 15, color: '#E76F51', fontWeight: '600' },
  hint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});
