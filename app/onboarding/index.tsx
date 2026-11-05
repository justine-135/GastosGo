// Onboarding Screen 1 — Welcome
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { runRestore } from '../../lib/restore';
import { supabase } from '../../lib/supabase';

export default function OnboardingWelcome() {
  const [hasCloudSession, setHasCloudSession] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasCloudSession(!!data.session);
    });
  }, []);

  async function handleRestore() {
    setRestoring(true);
    setRestoreMsg(null);
    try {
      const result = await runRestore();
      if (result.success) {
        setRestoreMsg(`Restored ${result.rowsRestored} records. You're all set!`);
      } else {
        setRestoreMsg(`Restore failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setRestoreMsg(`Restore failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRestoring(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Step indicator */}
        <View style={styles.stepRow} accessibilityLabel="Step 1 of 6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.hero}>
          <Text style={styles.emoji}>💰</Text>
          <Text style={styles.appName}>GastosGo</Text>
          <Text style={styles.tagline}>
            Alam mo ba kung saan napupunta ang pera mo?{'\n'}
            <Text style={styles.taglineEn}>Know exactly where every peso goes.</Text>
          </Text>
        </View>

        <View style={styles.actions}>
          {restoreMsg ? (
            <Text style={[styles.restoreMsg, restoreMsg.startsWith('Restore failed') && styles.restoreMsgError]}>
              {restoreMsg}
            </Text>
          ) : null}
          {hasCloudSession && (
            <TouchableOpacity
              style={[styles.secondaryBtn, restoring && styles.btnDisabled]}
              onPress={handleRestore}
              disabled={restoring}
              accessibilityRole="button"
              accessibilityLabel="Restore data from cloud backup"
            >
              <Text style={styles.secondaryBtnText}>{restoring ? 'Restoring...' : '☁️ Restore from cloud'}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/onboarding/income')}
            accessibilityRole="button"
            accessibilityLabel="Get started with GastosGo"
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
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
  appName: { fontSize: 40, fontWeight: '700', color: '#2D3047' },
  tagline: { fontSize: 18, textAlign: 'center', color: '#6B7280', lineHeight: 28 },
  taglineEn: { fontStyle: 'italic', color: '#F4A261', fontWeight: '500' },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#F4A261', borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', minHeight: 56,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  secondaryBtn: {
    borderWidth: 1.5, borderColor: '#A8DADC', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', minHeight: 56,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '500', color: '#2D3047' },
  btnDisabled: { opacity: 0.5 },
  restoreMsg: { fontSize: 14, textAlign: 'center', color: '#2D3047', paddingHorizontal: 8 },
  restoreMsgError: { color: '#D62828' },
});
