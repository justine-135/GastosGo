import { View, Text, Pressable } from "react-native";
import type { Category } from "../../db/schema";
import { formatCurrency } from "../../lib/formatCurrency";
import styles from "./CategoryPicker.styles";

interface Props {
  categories: Category[];
  spentByCategory: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryPicker({ categories, spentByCategory, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {categories.map((cat) => {
        const spent = spentByCategory[cat.id] ?? 0;
        const remaining = cat.monthlyBudget - spent;
        const selected = selectedId === cat.id;
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onSelect(cat.id)}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={styles.name}>{cat.name}</Text>
            <Text style={styles.budget}>{formatCurrency(remaining)} left</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
