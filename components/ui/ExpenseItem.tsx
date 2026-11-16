import { View, Text } from "react-native";
import { formatCurrency } from "../../lib/formatCurrency";
import styles from "./ExpenseItem.styles";

interface Props {
  icon: string;
  categoryName: string;
  merchant: string;
  paymentMethod: string;
  date: string;
  amount: number;
  isRecurring?: boolean;
}

export function ExpenseItem({ icon, categoryName, merchant, paymentMethod, date, amount, isRecurring }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{merchant}</Text>
        <Text style={styles.meta}>
          {categoryName} · {paymentMethod} · {date}{isRecurring ? " · 🔁" : ""}
        </Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
    </View>
  );
}
