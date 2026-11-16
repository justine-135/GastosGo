import { StyleSheet } from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    fontSize: typography.sizes.lg + 1,
    fontWeight: "800",
    color: c.foreground,
    letterSpacing: -0.02 * (typography.sizes.lg + 1),
  },
  scroll: { paddingBottom: spacing.xxl },

  // Section header
  sectionHdr: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.07 * 11,
    color: c.mutedForeground,
  },

  // Settings card — groups rows
  settingsCard: {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },

  // Row pattern
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  rowStatic: { borderBottomWidth: 1, borderBottomColor: c.border },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: typography.sizes.base, color: c.foreground, lineHeight: 20 },
  rowSublabel: { fontSize: typography.sizes.sm, color: c.mutedForeground, marginTop: 2, lineHeight: 18 },
  rowValue: { fontSize: typography.sizes.base, color: c.mutedForeground },
  rowChevron: { fontSize: typography.sizes.base, color: c.mutedForeground, opacity: 0.5 },

  // Chips (theme picker)
  chips: { flexDirection: "row", gap: 6 },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 13,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { fontSize: typography.sizes.xs, fontWeight: "600", color: c.mutedForeground },
  chipTextActive: { color: "#fff" },

  // Sync button
  syncBtn: {
    backgroundColor: c.primary,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 13,
  },
  syncBtnText: { fontSize: typography.sizes.xs, fontWeight: "600", color: "#fff" },

  // Profile sheet
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "90%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: c.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheetHdr: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  sheetTitle: { flex: 1, fontSize: typography.sizes.md, fontWeight: "700", color: c.foreground },
  sheetClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: c.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseText: { fontSize: typography.sizes.sm, color: c.mutedForeground },
  sheetBody: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  inputLbl: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    color: c.mutedForeground,
    marginBottom: 5,
  },
  inputField: {
    paddingVertical: spacing.sm + 3,
    paddingHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: c.border,
    borderRadius: radius.md,
    fontSize: typography.sizes.base,
    color: c.foreground,
    backgroundColor: c.surfaceInput,
    marginBottom: 4,
  },

  modeRow: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: c.background,
  },
  modeRowSel: { borderColor: c.primary, backgroundColor: "rgba(244,162,97,0.07)" },
  modeName: { fontSize: typography.sizes.base, fontWeight: "600", color: c.foreground },
  modeNameSel: { color: c.primary },

  saveBtn: {
    backgroundColor: c.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  saveBtnText: { color: "#fff", fontSize: typography.sizes.base, fontWeight: "700" },
});
