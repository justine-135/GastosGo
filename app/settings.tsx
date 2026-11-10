// FE-13: Settings Screen
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, Modal, FlatList,
} from 'react-native';
import { styles } from './settings.styles';
import { colors, white } from '../theme/index';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../stores/themeStore';
import { useSyncStore } from '../stores/syncStore';
import { getProfile, updateProfile } from '../lib/db';
import { runFullBackup } from '../lib/restore';
import { supabase } from '../lib/supabase';
import type { IncomeMode } from '../lib/db/types';

const PIN_KEY = 'gastosgo-pin-hash';
type ThemeMode = 'system' | 'light' | 'dark';

const INCOME_MODE_LABELS: Record<string, string> = {
  salary: 'Fixed Salary',
  mixed: 'Salary + Freelance',
  target: 'Savings Target',
};

export default function SettingsScreen() {
  const qc = useQueryClient();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const { lastSyncedAt, isSyncing, setIsSyncing } = useSyncStore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [hasPIN, setHasPIN] = useState<boolean | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  // Check PIN on mount
  useEffect(() => {
    SecureStore.getItemAsync(PIN_KEY).then((v) => setHasPIN(!!v));
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateProfile>[0]) => updateProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  async function handleBackup() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      Alert.alert('Sign In Required', 'Sign in to back up your data.');
      return;
    }
    setIsBackingUp(true);
    try {
      await runFullBackup();
      Alert.alert('Backup Complete', 'Your data has been backed up to the cloud.');
    } catch {
      Alert.alert('Backup Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  }

  async function handleDisablePIN() {
    if (!hasPIN) return;
    Alert.alert('Disable PIN', 'Are you sure? Anyone can access your financial data without a PIN.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disable', style: 'destructive',
        onPress: async () => {
          await SecureStore.deleteItemAsync(PIN_KEY);
          setHasPIN(false);
          Alert.alert('PIN Disabled', 'Your PIN has been removed.');
        },
      },
    ]);
  }

  function handleIncomeMode() {
    if (!profile) return;
    const modes: IncomeMode[] = ['salary', 'mixed', 'target'];
    Alert.alert(
      'Income Mode',
      `Current: ${INCOME_MODE_LABELS[profile.incomeMode]}`,
      modes.map((m) => ({
        text: INCOME_MODE_LABELS[m],
        onPress: () => updateProfileMutation.mutate({ incomeMode: m }),
      }))
    );
  }

  function handleBudgetCycleStart() {
    if (!profile) return;
    setShowDayPicker(true);
  }

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Theme</Text>
          <View style={styles.segmentRow}>
            {(['light', 'system', 'dark'] as ThemeMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.segment, themeMode === m && styles.segmentActive]}
                onPress={() => setThemeMode(m)}
                accessibilityRole="radio"
                accessibilityLabel={m}
                accessibilityState={{ checked: themeMode === m }}
              >
                <Text style={[styles.segmentText, themeMode === m && styles.segmentTextActive]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={styles.card}>
          {hasPIN && (
            <>
              <SettingsRow
                label="Change PIN"
                onPress={() => router.push({ pathname: '/lock', params: { mode: 'change' } })}
                accessibilityLabel="Change PIN"
              />
              <Divider />
            </>
          )}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>PIN Enabled</Text>
            <Switch
              value={!!hasPIN}
              onValueChange={(v) => { if (v) router.push('/lock?mode=setup'); else handleDisablePIN(); }}
              trackColor={{ false: colors.light.border, true: colors.light.primary }}
              thumbColor={white}
              accessibilityLabel="Toggle PIN lock"
            />
          </View>
        </View>

        {/* Budget */}
        <SectionHeader title="Budget" />
        <View style={styles.card}>
          <SettingsRow
            label="Income Mode"
            value={profile ? INCOME_MODE_LABELS[profile.incomeMode] : '—'}
            onPress={handleIncomeMode}
            accessibilityLabel="Change income mode"
          />
          <Divider />
          <SettingsRow
            label="Budget Cycle Starts"
            value={profile ? `Day ${profile.budgetCycleStart}` : '—'}
            onPress={handleBudgetCycleStart}
            accessibilityLabel="Change budget cycle start day"
          />
        </View>

        {/* Cloud */}
        <SectionHeader title="Cloud Sync" />
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.rowBtn]}
            onPress={handleBackup}
            disabled={isBackingUp}
            accessibilityRole="button"
            accessibilityLabel="Backup data to cloud"
          >
            <Text style={styles.rowLabel}>Backup Now</Text>
            {isBackingUp
              ? <ActivityIndicator size="small" color={colors.light.primary} />
              : <Text style={styles.rowAction}>☁️ Backup</Text>}
          </TouchableOpacity>
          {lastSyncedAt && (
            <>
              <Divider />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Last Synced</Text>
                <Text style={styles.rowValue}>{new Date(lastSyncedAt).toLocaleString()}</Text>
              </View>
            </>
          )}
        </View>

        {/* Currency */}
        <SectionHeader title="Currency" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Currency</Text>
            <Text style={styles.rowValue}>PHP (₱)</Text>
          </View>
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>GastosGo</Text>
            <Text style={styles.rowValue}>v{appVersion}</Text>
          </View>
          <Divider />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Built with ❤️ for Filipinos</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={showDayPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayPicker(false)}
          accessibilityLabel="Close day picker"
        >
          <View style={styles.dayPickerSheet}>
            <Text style={styles.dayPickerTitle}>Budget Cycle Start Day</Text>
            <FlatList
              data={Array.from({ length: 31 }, (_, i) => i + 1)}
              keyExtractor={(item) => String(item)}
              numColumns={7}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dayCell,
                    profile?.budgetCycleStart === item && styles.dayCellActive,
                  ]}
                  onPress={() => {
                    updateProfileMutation.mutate({ budgetCycleStart: item });
                    setShowDayPicker(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Day ${item}`}
                  accessibilityState={{ selected: profile?.budgetCycleStart === item }}
                >
                  <Text style={[
                    styles.dayCellText,
                    profile?.budgetCycleStart === item && styles.dayCellTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.dayPickerCancel}
              onPress={() => setShowDayPicker(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.dayPickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function SettingsRow({
  label,
  value,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, styles.rowBtn]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

