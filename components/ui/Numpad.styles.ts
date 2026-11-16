import { StyleSheet } from "react-native";
import { colors, typography } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  key: {
    width: "33.33%",
    paddingVertical: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: c.background,
    borderRightWidth: 1,
    borderRightColor: c.border,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  keyText: {
    fontSize: 22,
    fontWeight: "500",
    color: c.foreground,
  },
  actionText: {
    fontSize: typography.sizes.base,
    fontWeight: "600",
    color: c.mutedForeground,
  },
  nextKey: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: c.primary,
  },
  nextDisabled: {
    opacity: 0.4,
  },
  nextText: {
    fontSize: typography.sizes.base,
    fontWeight: "700",
    color: "#fff",
  },
});
