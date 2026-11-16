import { StyleSheet } from "react-native";
import { spacing, radius, typography } from "../../theme";

export default StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.lg - 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  compact: {
    marginHorizontal: 0,
    padding: spacing.md,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 3,
  },
  amount: {
    fontSize: typography.sizes.xxxl + 6,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },
  desc: {
    fontSize: typography.sizes.xs,
    color: "rgba(255,255,255,0.85)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  miniLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  miniVal: {
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    color: "#fff",
    marginTop: 2,
  },
  addIncomeBtn: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
  addIncomeBtnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: typography.sizes.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
});
