import { StyleSheet } from "react-native";
import { colors, shadows, spacing } from "../theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  ruleCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
    overflow: "hidden",
    ...shadows.sm,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  ruleRowSep: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.sep,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  ruleEmoji: {
    fontSize: 18,
  },
  ruleMain: {
    flex: 1,
  },
  ruleName: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.navy,
  },
  ruleMeta: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  ruleRight: {
    alignItems: "flex-end",
  },
  ruleAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
  },
  ruleDueDate: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  inactiveBadge: {
    backgroundColor: colors.grayLight,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  inactiveBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.gray,
    textTransform: "uppercase",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.fab,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.navy,
    marginTop: 12,
  },
  emptyMeta: {
    fontSize: 14,
    color: colors.gray,
    marginTop: 4,
  },
});
