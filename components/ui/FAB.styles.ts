import { StyleSheet } from "react-native";
import { colors } from "../../theme";

const c = colors.light;

export default StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 88 + 12,
    right: 18,
    width: 56,
    height: 56,
    backgroundColor: c.primary,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 28,
    color: "#fff",
    lineHeight: 32,
  },
});
