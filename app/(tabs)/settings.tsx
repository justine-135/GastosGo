import { ScrollView, View, Text, TextInput, Pressable, Switch, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { getProfile, upsertProfile } from "../../db/queries/profiles";
import { drainSyncQueue } from "../../db/queries/syncQueue";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import styles from "./settings.styles";

type IncomeMode = "salary" | "mixed" | "target";

const INCOME_MODE_LABELS: Record<IncomeMode, string> = {
  salary: "Fixed Salary",
  mixed: "Mixed / Freelance",
  target: "Spending Cap",
};

const NOTIFS_KEY = "gg_notifs";
const LAST_SYNC_KEY = "gg_last_sync";

function NavRow({ label, value, onPress }: { label: string; value?: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        {value ? <Text style={styles.rowSublabel}>{value}</Text> : null}
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </Pressable>
  );
}

function ToggleRow({ label, sublabel, value, onToggle }: { label: string; sublabel: string; value: boolean; onToggle: (v: boolean) => void }) {
  return (
    <View style={[styles.row, styles.rowStatic]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSublabel}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#D1D5DB", true: "#F4A261" }}
        thumbColor="#fff"
      />
    </View>
  );
}

function DisplayRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={[styles.row, styles.rowStatic]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const supabaseSession = useAuthStore((s) => s.supabaseSession);
  const { preference: themePref, setPreference: setThemePref } = useThemeStore();

  const { data: profile } = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: () => getProfile(userId!),
  });

  // Profile sheet state
  const [profileSheet, setProfileSheet] = useState(false);
  const [incomeMode, setIncomeMode] = useState<IncomeMode>("salary");
  const [salary, setSalary] = useState("0");
  const [target, setTarget] = useState("0");
  const [cycleStart, setCycleStart] = useState("1");
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (!profile) return;
    setIncomeMode(profile.incomeMode as IncomeMode);
    setSalary(String(profile.monthlySalary ?? 0));
    setTarget(String(profile.savingsTarget));
    setCycleStart(String(profile.budgetCycleStart));
  }, [profile]);

  const profileMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("No user");
      return upsertProfile({
        userId,
        incomeMode,
        monthlySalary: incomeMode === "salary" ? parseFloat(salary) || 0 : null,
        savingsTarget: parseFloat(target) || 0,
        budgetCycleStart: Math.min(28, Math.max(1, parseInt(cycleStart) || 1)),
        currency: profile?.currency ?? "PHP",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setSavedAt(new Date());
      setProfileSheet(false);
    },
  });

  // Notifications
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [notifyBills, setNotifyBills] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFS_KEY).then((v) => {
      if (v) {
        const p = JSON.parse(v);
        setNotifyBudget(p.budget ?? true);
        setNotifyBills(p.bills ?? true);
      }
    });
  }, []);

  const saveNotifs = useCallback((budget: boolean, bills: boolean) => {
    AsyncStorage.setItem(NOTIFS_KEY, JSON.stringify({ budget, bills }));
  }, []);

  // Sync
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LAST_SYNC_KEY).then(setLastSyncedAt);
  }, []);

  async function handleSync() {
    if (!supabaseSession?.user.id || syncing) return;
    setSyncing(true);
    try {
      await drainSyncQueue(supabaseSession.user.id);
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now);
      setLastSyncedAt(now);
    } finally {
      setSyncing(false);
    }
  }

  function formatLastSync(iso: string | null) {
    if (!iso) return "Never";
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  const cycleLabel = `${profile?.budgetCycleStart ?? 1}${["st","nd","rd"][(profile?.budgetCycleStart ?? 1) - 1] ?? "th"} of month`;
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.title}>Settings</Text>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Profile */}
        <Text style={styles.sectionHdr}>Profile</Text>
        <View style={styles.settingsCard}>
          <NavRow
            label="Income Mode"
            value={profile ? INCOME_MODE_LABELS[profile.incomeMode as IncomeMode] : undefined}
            onPress={() => setProfileSheet(true)}
          />
          <NavRow
            label="Budget Cycle Start"
            value={profile ? cycleLabel : undefined}
            onPress={() => setProfileSheet(true)}
          />
          <NavRow
            label="Currency"
            value={profile?.currency ?? "PHP"}
            onPress={() => setProfileSheet(true)}
          />
        </View>

        {/* Notifications */}
        <Text style={styles.sectionHdr}>Notifications</Text>
        <View style={styles.settingsCard}>
          <ToggleRow
            label="Budget Alerts"
            sublabel="Notify at 80% and 100% of category budgets"
            value={notifyBudget}
            onToggle={(v) => { setNotifyBudget(v); saveNotifs(v, notifyBills); }}
          />
          <ToggleRow
            label="Bill Reminders"
            sublabel="1 day before recurring bills are due"
            value={notifyBills}
            onToggle={(v) => { setNotifyBills(v); saveNotifs(notifyBudget, v); }}
          />
        </View>

        {/* Appearance */}
        <Text style={styles.sectionHdr}>Appearance</Text>
        <View style={styles.settingsCard}>
          <View style={[styles.row, styles.rowStatic, { flexDirection: "row", alignItems: "center" }]}>
            <Text style={[styles.rowLabel, { flex: 1 }]}>Theme</Text>
            <View style={styles.chips}>
              {(["system", "light", "dark"] as const).map((opt) => (
                <Pressable
                  key={opt}
                  style={[styles.chip, themePref === opt && styles.chipActive]}
                  onPress={() => setThemePref(opt)}
                >
                  <Text style={[styles.chipText, themePref === opt && styles.chipTextActive]}>
                    {opt[0].toUpperCase() + opt.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Data */}
        <Text style={styles.sectionHdr}>Data</Text>
        <View style={styles.settingsCard}>
          <View style={[styles.row, styles.rowStatic]}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Last Synced</Text>
              <Text style={styles.rowSublabel}>{formatLastSync(lastSyncedAt)}</Text>
            </View>
            <Pressable
              style={[styles.syncBtn, syncing && { opacity: 0.5 }]}
              onPress={handleSync}
              disabled={syncing}
            >
              <Text style={styles.syncBtnText}>{syncing ? "Syncing…" : "Sync Now"}</Text>
            </Pressable>
          </View>
          <NavRow label="Recently Deleted" onPress={() => router.push("/trash")} />
          <NavRow label="Manage Categories" onPress={() => router.push("/categories")} />
        </View>

        {/* About */}
        <Text style={styles.sectionHdr}>About</Text>
        <View style={styles.settingsCard}>
          <DisplayRow label="Version" value={appVersion} />
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Profile edit sheet */}
      <Modal visible={profileSheet} transparent animationType="slide" onRequestClose={() => setProfileSheet(false)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setProfileSheet(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHdr}>
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <Pressable style={styles.sheetClose} onPress={() => setProfileSheet(false)}>
                <Text style={styles.sheetCloseText}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.sheetBody} keyboardShouldPersistTaps="handled">

              <Text style={styles.inputLbl}>Income Mode</Text>
              {(["salary", "mixed", "target"] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.modeRow, incomeMode === m && styles.modeRowSel]}
                  onPress={() => setIncomeMode(m)}
                >
                  <Text style={[styles.modeName, incomeMode === m && styles.modeNameSel]}>
                    {INCOME_MODE_LABELS[m]}
                  </Text>
                </Pressable>
              ))}

              {incomeMode === "salary" && (
                <>
                  <Text style={[styles.inputLbl, { marginTop: 16 }]}>Monthly Salary (₱)</Text>
                  <TextInput
                    style={styles.inputField}
                    value={salary}
                    onChangeText={setSalary}
                    keyboardType="numeric"
                    placeholder="25000"
                    placeholderTextColor="#C4B4A0"
                  />
                </>
              )}

              <Text style={[styles.inputLbl, { marginTop: 16 }]}>
                {incomeMode === "target" ? "Spending Cap (₱)" : "Savings Target (₱)"}
              </Text>
              <TextInput
                style={styles.inputField}
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                placeholder="5000"
                placeholderTextColor="#C4B4A0"
              />

              <Text style={[styles.inputLbl, { marginTop: 16 }]}>Budget Cycle Start (day 1–28)</Text>
              <TextInput
                style={styles.inputField}
                value={cycleStart}
                onChangeText={setCycleStart}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor="#C4B4A0"
              />

              <Pressable
                style={[styles.saveBtn, profileMutation.isPending && { opacity: 0.5 }]}
                disabled={profileMutation.isPending}
                onPress={() => profileMutation.mutate()}
              >
                <Text style={styles.saveBtnText}>
                  {profileMutation.isPending ? "Saving…" : "Save Changes"}
                </Text>
              </Pressable>

              <View style={{ height: 24 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
