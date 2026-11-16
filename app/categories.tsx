import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getCategories, updateCategory, softDeleteCategory } from "../db/queries/categories";
import { useAuthStore } from "../store/authStore";
import { EmptyState } from "../components/ui/EmptyState";
import type { Category } from "../db/schema";
import styles from "./categories.styles";

export default function CategoriesScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.userId);
  const [editing, setEditing] = useState<Record<string, string>>({});

  const { data: cats = [] } = useQuery({
    queryKey: ["categories", userId],
    enabled: !!userId,
    queryFn: () => getCategories(userId!),
  });

  const save = useMutation({
    mutationFn: ({ id, budget }: { id: string; budget: number }) =>
      updateCategory(id, { monthlyBudget: budget }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories", userId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => softDeleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories", userId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function handleBudgetBlur(cat: Category) {
    const raw = editing[cat.id];
    if (raw === undefined) return;
    const budget = parseFloat(raw);
    if (!isNaN(budget) && budget !== cat.monthlyBudget) {
      save.mutate({ id: cat.id, budget });
    }
    setEditing((e) => { const n = { ...e }; delete n[cat.id]; return n; });
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <Text style={styles.title}>Categories</Text>
      </View>

      {cats.length === 0 ? (
        <EmptyState message="No categories." />
      ) : (
        <FlatList
          data={cats}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: cat }) => (
            <View style={styles.row}>
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={styles.name}>{cat.name}</Text>
              <TextInput
                style={styles.budgetInput}
                value={editing[cat.id] ?? String(cat.monthlyBudget)}
                onChangeText={(v) => setEditing((e) => ({ ...e, [cat.id]: v }))}
                onBlur={() => handleBudgetBlur(cat)}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Pressable style={styles.delBtn} onPress={() => del.mutate(cat.id)}>
                <Text style={styles.delText}>✕</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
