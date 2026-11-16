import { View } from "react-native";
import styles from "./ProgressBar.styles";
import { colors } from "../../theme";

interface Props {
  pct: number; // 0–1
}

const c = colors.light;

export function ProgressBar({ pct }: Props) {
  const clamped = Math.min(pct, 1);
  const barColor = pct >= 1 ? c.destructive : pct >= 0.8 ? c.warning : c.muted;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped * 100}%` as any, backgroundColor: barColor }]} />
    </View>
  );
}
