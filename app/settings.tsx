// FE-13: Settings Screen
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, Modal, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useThemeStore } from '../stores/themeStore';
import { useSyncStore } from '../stores/syncStore';
import { getProfile, updateProfile } from '../lib/db';
import { runFullBackup } from '../lib/restore';
import type { IncomeMode } from '../lib/db/types';

const PIN_KEY = 'gastosgo-pin-hash';
type ThemeMode = 'system' | 'light' | 'dark';

export default function SettingsScreen() {
  const qc = useQueryClient();
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore();
  const { lastSyncedAt, isSyncing, setIsSyncing } = useSyncStore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [hasPIN, setHasPIN] = useState<boolean | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });

  // Check PIN on mount
  React.useEffect(() => {
    SecureStore.getItemAsync(PIN_KEY).then((v) => setHasPIN(!!v));
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateProfile>[0]) => updateProfile(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });

  async function handleBackup() {
    setIsBackingUp(true);
    try {
      await runFullBackup();
      Alert.alert('Backup Complete', 'Your data has been backed up to the cloud.');
    } catch {
      Alert.alert('Backup Failed', 'Please check your internet connection and try again.');
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
    const labels: Record<IncomeMode, string> = {
      salary: 'Fixed Salary',
      mixed: 'Salary + Freelance',
      target: 'Savings Target',
    };
    Alert.alert(
      'Income Mode',
      `Current: ${labels[profile.incomeMode]}`,
      modes.map((m) => ({
        text: labels[m],
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
          <SettingsRow
            label="Change PIN"
            onPress={() => router.push({ pathname: '/lock', params: { mode: 'change' } })}
            accessibilityLabel="Change PIN"
          />
          <Divider />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>PIN Enabled</Text>
            <Switch
              value={!!hasPIN}
              onValueChange={(v) => { if (!v) handleDisablePIN(); }}
              trackColor={{ false: '#E5D5C0', true: '#F4A261' }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle PIN lock"
            />
          </View>
        </View>

        {/* Budget */}
        <SectionHeader title="Budget" />
        <View style={styles.card}>
          <SettingsRow
            label="Income Mode"
            value={profile ? { salary: 'Fixed Salary', mixed: 'Salary + Freelance', target: 'Target' }[profile.incomeMode] : '—'}
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
              ? <ActivityIndicator size="small" color="#F4A261" />
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
              data={Array.from({ length: 28 }, (_, i) => i + 1)}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5D5C0',
  },
  backBtn: { minWidth: 70, minHeight: 44, justifyContent: 'center' },
  backBtnText: { fontSize: 17, color: '#F4A261' },
  screenTitle: { fontSize: 17, fontWeight: '700', color: '#2D3047' },
  scroll: { padding: 16, gap: 8 },
  sectionHeader: {
    fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 4, marginTop: 8, marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5D5C0',
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, minHeight: 52 },
  rowBtn: {},
  rowLabel: { fontSize: 16, color: '#2D3047', flex: 1 },
  rowValue: { fontSize: 15, color: '#6B7280' },
  rowAction: { fontSize: 15, color: '#F4A261', fontWeight: '600' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { fontSize: 20, color: '#9CA3AF', marginRight: -4 },
  divider: { height: 1, backgroundColor: '#F0EAE0', marginHorizontal: 16 },
  segmentRow: { flexDirection: 'row', backgroundColor: '#F0EAE0', borderRadius: 10, padding: 2, flex: 1, maxWidth: 200 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, minHeight: 36, justifyContent: 'center' },
  segmentActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  segmentTextActive: { color: '#2D3047', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  dayPickerSheet: {
    backgroundColor: '#FFF8F0', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  dayPickerTitle: { fontSize: 17, fontWeight: '700', color: '#2D3047', textAlign: 'center', marginBottom: 16 },
  dayCell: {
    flex: 1, aspectRatio: 1, margin: 4, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0EAE0', minHeight: 44,
  },
  dayCellActive: { backgroundColor: '#F4A261' },
  dayCellText: { fontSize: 15, fontWeight: '500', color: '#2D3047' },
  dayCellTextActive: { color: '#FFFFFF', fontWeight: '700' },
  dayPickerCancel: { marginTop: 16, alignItems: 'center', paddingVertical: 14, minHeight: 48 },
  dayPickerCancelText: { fontSize: 16, color: '#6B7280' },
});
