import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme";
import { StyleSheet } from "react-native";

export default function BudgetsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Budgets</Text>
      <Text style={styles.sub}>Coming in Phase 5</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.sizes.xl, fontWeight: "800", color: colors.light.foreground },
  sub: { fontSize: typography.sizes.sm, color: colors.light.mutedForeground, marginTop: spacing.sm },
});
