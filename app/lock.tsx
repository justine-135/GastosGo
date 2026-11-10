// FE-03: PIN / Biometric Lock Screen
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity,
  AppState, type AppStateStatus, Alert,
} from 'react-native';
import { styles } from './lock.styles';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { PinPad } from '../components/PinPad';
import { hashPin, verifyPin } from '../utils/pinSecurity';

const PIN_KEY = 'gastosgo-pin-hash';
const FAIL_COUNT_KEY = 'gastosgo-pin-fail-count';
const LOCKOUT_UNTIL_KEY = 'gastosgo-pin-lockout-until';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;


type Mode = 'verify' | 'setup' | 'change';
// 'enter': old PIN (change) or new PIN (setup) or current PIN (verify)
// 'new': new PIN entry (change only)
// 'confirm': confirm new PIN (setup/change)
type Step = 'enter' | 'new' | 'confirm';

export default function LockScreen() {
  const { mode: paramMode } = useLocalSearchParams<{ mode?: Mode }>();
  const mode: Mode = paramMode ?? 'verify';

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<Step>('enter');
  const [error, setError] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const appState = useRef(AppState.currentState);

  // Check lockout and biometrics on mount
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
        SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
        SecureStore.setItemAsync(FAIL_COUNT_KEY, '0');
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
    const until = await SecureStore.getItemAsync(LOCKOUT_UNTIL_KEY);
    if (until) {
      const ts = parseInt(until, 10);
      if (ts > Date.now()) {
        setLockoutUntil(ts);
        setCountdown(Math.ceil((ts - Date.now()) / 1000));
      } else {
        await SecureStore.deleteItemAsync(LOCKOUT_UNTIL_KEY);
        await SecureStore.setItemAsync(FAIL_COUNT_KEY, '0');
      }
    }
  }

  async function tryBiometric() {
    if (mode !== 'verify') return;
    try {
      // FE-09: only prompt if the user opted in during onboarding
      const enabled = await SecureStore.getItemAsync('gastosgo-biometrics-enabled');
      if (enabled !== 'true') return;

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
    if (step === 'confirm') {
      setConfirmPin((p) => p.length < 6 ? p + d : p);
    } else {
      // 'enter' (verify/change old PIN / setup new PIN) and 'new' (change new PIN)
      setPin((p) => p.length < 6 ? p + d : p);
    }
  }, [lockoutUntil, step]);

  const handleBackspace = useCallback(() => {
    if (step === 'confirm') setConfirmPin((p) => p.slice(0, -1));
    else setPin((p) => p.slice(0, -1));
  }, [step]);

  const handleClear = useCallback(() => {
    if (step === 'confirm') setConfirmPin('');
    else setPin('');
  }, [step]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    const current = step === 'confirm' ? confirmPin : pin;
    if (current.length < 6) return;

    const timer = setTimeout(() => submitPin(current), 150);
    return () => clearTimeout(timer);
  }, [pin, confirmPin, step]);

  async function submitPin(entered: string) {
    if (mode === 'verify' || (mode === 'change' && step === 'enter')) {
      const stored = await SecureStore.getItemAsync(PIN_KEY);

      if (!stored && mode === 'verify') {
        // No PIN set — go straight to app
        navigateToApp();
        return;
      }

      const match = stored ? await verifyPin(entered, stored) : false;
      if (match) {
        await SecureStore.setItemAsync(FAIL_COUNT_KEY, '0');
        if (mode === 'change') {
          // Old PIN verified — now collect the new PIN
          setStep('new');
          setPin('');
        } else {
          navigateToApp();
        }
      } else {
        const countStr = await SecureStore.getItemAsync(FAIL_COUNT_KEY);
        const count = parseInt(countStr ?? '0', 10) + 1;
        await SecureStore.setItemAsync(FAIL_COUNT_KEY, String(count));

        if (count >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          await SecureStore.setItemAsync(LOCKOUT_UNTIL_KEY, String(until));
          setLockoutUntil(until);
          setCountdown(LOCKOUT_SECONDS);
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - count} attempt${MAX_ATTEMPTS - count === 1 ? '' : 's'} left.`);
        }
        setPin('');
      }
    } else if (mode === 'setup' || (mode === 'change' && step === 'new')) {
      // 'enter' for setup means first new-PIN entry; 'new' for change is same thing
      setStep('confirm');
      setConfirmPin('');
      // keep pin = entered so confirm step can compare
    } else if (step === 'confirm') {
      // Confirm step for both setup and change
      if (pin !== entered) {
        setError('PINs do not match. Try again.');
        setPin('');
        setConfirmPin('');
        setStep(mode === 'change' ? 'new' : 'enter');
      } else {
        const hashed = await hashPin(entered);
        await SecureStore.setItemAsync(PIN_KEY, hashed);
        navigateToApp();
      }
    }
  }

  const dots = step === 'confirm' ? confirmPin : pin;
  const isLockedOut = !!lockoutUntil;

  const headerText =
    isLockedOut ? `Too many attempts` :
    mode === 'setup' ? (step === 'confirm' ? 'Confirm your PIN' : 'Create a PIN') :
    mode === 'change' ? (
      step === 'enter' ? 'Enter current PIN' :
      step === 'new' ? 'Enter new PIN' :
      'Confirm new PIN'
    ) :
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
          <Text style={styles.hint}>Choose a 6-digit PIN to protect your financial data.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

