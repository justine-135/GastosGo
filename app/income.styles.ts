import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../theme";

const c = colors.light;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background, padding: spacing.lg, paddingTop: 0 },
  handle: { width: 36, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: "center", marginVertical: spacing.sm },
  title: { fontSize: typography.sizes.md + 1, fontWeight: "800", color: c.foreground, marginBottom: 4 },
  sub: { fontSize: typography.sizes.sm, color: c.mutedForeground, marginBottom: spacing.lg },
  inputWrap: { marginBottom: spacing.sm },
  label: { fontSize: typography.sizes.xs, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.3, color: c.mutedForeground, marginBottom: 6 },
  input: { backgroundColor: "#fff", borderWidth: 2, borderColor: c.border, borderRadius: radius.md, padding: 13, fontSize: 22, fontWeight: "700", color: c.foreground },
  sourceWrap: { marginBottom: spacing.lg },
  sourceRow: { flexDirection: "row", gap: spacing.sm },
  srcBtn: { flex: 1, padding: spacing.sm, borderWidth: 2, borderColor: c.border, borderRadius: radius.md, alignItems: "center" },
  srcBtnSel: { borderColor: c.primary, backgroundColor: c.primaryTint },
  srcEmoji: { fontSize: 16 },
  srcName: { fontSize: typography.sizes.xs, fontWeight: "600", color: c.foreground, marginTop: 2 },
  btn: { backgroundColor: c.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: "#fff", fontSize: typography.sizes.base, fontWeight: "700" },
});
