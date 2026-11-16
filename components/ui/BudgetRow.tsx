import { View, Text } from "react-native";
import { ProgressBar } from "./ProgressBar";
import { formatCurrency } from "../../lib/formatCurrency";
import styles from "./BudgetRow.styles";
import { colors } from "../../theme";

interface Props {
  icon: string;
  name: string;
  pct: number;
}

export function BudgetRow({ icon, name, pct }: Props) {
  const c = colors.light;
  const color = pct >= 1 ? c.destructive : pct >= 0.8 ? "#d97706" : c.mutedForeground;
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <ProgressBar pct={pct} />
      </View>
      <Text style={[styles.pct, { color }]}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}
