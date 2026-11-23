import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../../src/db';
import { loadSettings, IncomeMode } from '../../src/db/settings';
import { colors } from '../../src/theme/colors';
import { styles } from '../../src/screens/tabs/settings.styles';

const INCOME_MODE_LABELS: Record<IncomeMode, string> = {
  salary: 'Salary',
  mixed: 'Mixed',
  target: 'Target',
};

interface SettingsRow {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  route: string;
}

function ListRow({ row, isFirst }: { row: SettingsRow; isFirst: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !isFirst && styles.rowBorder,
        pressed && { backgroundColor: colors.grayLight },
      ]}
      onPress={() => router.push(row.route as any)}
    >
      <View style={[styles.iconSlot, { backgroundColor: row.iconBg }]}>
        <Feather name={row.icon as any} size={18} color={row.iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{row.title}</Text>
        {row.subtitle ? <Text style={styles.rowSubtitle}>{row.subtitle}</Text> : null}
      </View>
      <Feather name="chevron-right" size={14} color={colors.gray2} />
    </Pressable>
  );
}

function UpcomingRow({ icon, iconBg, title, isFirst }: { icon: string; iconBg: string; title: string; isFirst: boolean }) {
  return (
    <View style={[styles.row, !isFirst && styles.rowBorder]}>
      <View style={[styles.iconSlot, { backgroundColor: iconBg }]}>
        <Feather name={icon as any} size={18} color={colors.gray} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: colors.gray }]}>{title}</Text>
      </View>
      <View style={styles.soonBadge}>
        <Text style={styles.soonBadgeText}>SOON</Text>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const [incomeMode, setIncomeMode] = useState<IncomeMode>('salary');
  const [budgetCycleDay, setBudgetCycleDay] = useState(1);

  useFocusEffect(
    useCallback(() => {
      const settings = loadSettings(getDb());
      setIncomeMode(settings.incomeMode);
      setBudgetCycleDay(settings.budgetCycleDay);
    }, []),
  );

  const incomeBudgetRows: SettingsRow[] = [
    {
      icon: 'trending-up',
      iconBg: colors.brandBg,
      iconColor: colors.brand,
      title: 'Income Mode',
      subtitle: INCOME_MODE_LABELS[incomeMode],
      route: '/settings/income-mode',
    },
    {
      icon: 'calendar',
      iconBg: colors.amberBg,
      iconColor: colors.amber,
      title: 'Budget Cycle',
      subtitle: `Day ${budgetCycleDay}`,
      route: '/settings/budget-cycle',
    },
  ];

  const recurringRow: SettingsRow = {
    icon: 'repeat',
    iconBg: colors.greenBg,
    iconColor: colors.green,
    title: 'Recurring Rules',
    subtitle: '',
    route: '/recurring-rules',
  };

  const resetCycleRow: SettingsRow = {
    icon: 'refresh-cw',
    iconBg: colors.amberBg,
    iconColor: colors.amber,
    title: 'Reset Current Cycle',
    subtitle: '',
    route: '/settings/reset-cycle',
  };

  const dataRow: SettingsRow = {
    icon: 'trash-2',
    iconBg: colors.redBg,
    iconColor: colors.red,
    title: 'Recently Deleted',
    subtitle: '',
    route: '/settings/recently-deleted',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.pageTitle}>Settings</Text>

      <Text style={styles.sectionLabel}>Income & Budget</Text>
      <View style={styles.card}>
        {incomeBudgetRows.map((settingsRow, index) => (
          <ListRow key={settingsRow.route} row={settingsRow} isFirst={index === 0} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Data</Text>
      <View style={styles.card}>
        <ListRow row={recurringRow} isFirst />
        <ListRow row={resetCycleRow} isFirst={false} />
        <ListRow row={dataRow} isFirst={false} />
      </View>

      <Text style={styles.sectionLabel}>Upcoming</Text>
      <View style={styles.card}>
        <UpcomingRow icon="lock" iconBg={colors.grayLight} title="PIN & Biometric Lock" isFirst />
      </View>

      <View style={styles.footer}>
        <LinearGradient
          colors={[colors.brand, colors.brandSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.footerLogo}
        >
          <Feather name="trending-up" size={22} color={colors.card} />
        </LinearGradient>
        <Text style={styles.footerAppName}>GastosGo</Text>
        <Text style={styles.footerVersion}>Version 0.1.0</Text>
      </View>
    </ScrollView>
  );
}
