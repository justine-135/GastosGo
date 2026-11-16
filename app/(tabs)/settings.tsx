import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "../../theme";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.sub}>Coming in Phase 7</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background, alignItems: "center", justifyContent: "center" },
  title: { fontSize: typography.sizes.xl, fontWeight: "800", color: colors.light.foreground },
  sub: { fontSize: typography.sizes.sm, color: colors.light.mutedForeground, marginTop: spacing.sm },
});
