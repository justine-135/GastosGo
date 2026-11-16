import { View, Text, Pressable } from "react-native";
import type { PaymentMethod } from "../../store/addExpenseStore";
import styles from "./PaymentMethodPicker.styles";

const METHODS: Array<{ id: PaymentMethod; emoji: string; name: string }> = [
  { id: "Cash", emoji: "💵", name: "Cash" },
  { id: "GCash", emoji: "📱", name: "GCash" },
  { id: "Card", emoji: "💳", name: "Card" },
  { id: "Others", emoji: "🔄", name: "Others" },
];

interface Props {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
}

export function PaymentMethodPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {METHODS.map((m) => (
        <Pressable
          key={m.id}
          style={[styles.chip, selected === m.id && styles.chipSelected]}
          onPress={() => onSelect(m.id)}
        >
          <Text style={styles.icon}>{m.emoji}</Text>
          <Text style={styles.name}>{m.name}</Text>
        </Pressable>
      ))}
    </View>
  );
}
