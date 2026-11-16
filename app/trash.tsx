import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRecentlyDeleted, restoreExpense, purgeExpense } from "../db/queries/expenses";
import { useAuthStore } from "../store/authStore";
import { formatCurrency } from "../lib/formatCurrency";
import { EmptyState } from "../components/ui/EmptyState";
import styles from "./trash.styles";

export default function TrashScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);

  const { data: items = [] } = useQuery({
    queryKey: ["trash", userId],
    enabled: !!userId,
    queryFn: () => getRecentlyDeleted(userId!),
  });

  const restore = useMutation({
    mutationFn: (id: string) => restoreExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash", userId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const purge = useMutation({
    mutationFn: (id: string) => purgeExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trash", userId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Deleted Expenses</Text>
      </View>

      {items.length === 0 ? (
        <EmptyState message="No deleted expenses." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.merchant}>{item.merchant ?? "Expense"}</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              <Pressable style={styles.restoreBtn} onPress={() => restore.mutate(item.id)}>
                <Text style={styles.restoreText}>Restore</Text>
              </Pressable>
              <Pressable style={styles.purgeBtn} onPress={() => purge.mutate(item.id)}>
                <Text style={styles.purgeText}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
