import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getDb } from '../../src/db';
import { listCategories, updateCategoryBudget, CategoryRow } from '../../src/db/categories';
import { listExpenses } from '../../src/db/expenses';
import { loadSettings, saveSettings } from '../../src/db/settings';
import { spendingCap, budgetedSpent, CategoryBudgetStatus } from '../../src/utils/computeSpendingCap';
import { fmtPeso } from '../../src/utils/fmtPeso';
import { styles } from './budgets.styles';

interface EditingCategory {
  category: CategoryRow;
  budgetInput: string;
  carryoverEnabled: boolean;
}

export default function BudgetsScreen() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [statusById, setStatusById] = useState<Record<string, CategoryBudgetStatus>>({});
  const [cap, setCap] = useState(0);
  const [cycleStartDay, setCycleStartDay] = useState(1);
  const [editing, setEditing] = useState<EditingCategory | null>(null);

  const reload = useCallback(() => {
    const db = getDb();
    const loadedCategories = listCategories(db);
    const expenses = listExpenses(db);
    const settings = loadSettings(db);
    const day = settings.budgetCycleDay;

    setCategories(loadedCategories);
    setCycleStartDay(day);
    setCap(spendingCap(loadedCategories));

    const statuses = budgetedSpent(expenses, loadedCategories, day);
    const byId: Record<string, CategoryBudgetStatus> = {};
    for (const status of statuses) byId[status.categoryId] = status;
    setStatusById(byId);
  }, []);

  useFocusEffect(reload);

  const handleCycleDayPress = useCallback(() => {
    Alert.prompt(
      'Budget Cycle Start Day',
      'Enter the day of month (1–28) when your budget cycle resets.',
      (inputText) => {
        const parsed = parseInt(inputText ?? '', 10);
        if (isNaN(parsed) || parsed < 1 || parsed > 28) {
          Alert.alert('Invalid day', 'Please enter a number between 1 and 28.');
          return;
        }
        saveSettings(getDb(), { budgetCycleDay: parsed });
        reload();
      },
      'plain-text',
      String(cycleStartDay),
      'number-pad',
    );
  }, [cycleStartDay, reload]);

  const handleCategoryPress = useCallback((category: CategoryRow) => {
    setEditing({
      category,
      budgetInput: category.monthly_budget > 0 ? String(category.monthly_budget) : '',
      carryoverEnabled: category.carryover_enabled === 1,
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editing) return;
    const parsedBudget = parseFloat(editing.budgetInput);
    const monthlyBudget = isNaN(parsedBudget) || parsedBudget < 0 ? 0 : parsedBudget;
    updateCategoryBudget(getDb(), editing.category.id, monthlyBudget, editing.carryoverEnabled);
    setEditing(null);
    reload();
  }, [editing, reload]);

  const totalSpent = Object.values(statusById).reduce((sum, s) => sum + s.spent, 0);

  return (
    <View style={styles.container}>
      <View style={styles.capCard}>
        <Text style={styles.capLabel}>Spending Cap</Text>
        <Text style={styles.capAmount}>{fmtPeso(cap)}</Text>
        <Text style={styles.capSub}>{fmtPeso(cap - totalSpent)} remaining</Text>
      </View>

      <TouchableOpacity style={styles.cycleRow} onPress={handleCycleDayPress}>
        <Text style={styles.cycleLabel}>Budget Cycle Start Day</Text>
        <View style={styles.cycleDayButton}>
          <Text style={styles.cycleDayText}>{cycleStartDay}</Text>
        </View>
      </TouchableOpacity>

      <FlatList
        data={categories}
        keyExtractor={(category) => category.id}
        ListEmptyComponent={<Text style={styles.empty}>No categories found.</Text>}
        renderItem={({ item: category }) => {
          const status = statusById[category.id];
          const fillRatio = status && status.limit > 0 ? Math.min(status.spent / status.limit, 1) : 0;
          const isOverBudget = status && status.spent > status.limit;
          return (
            <TouchableOpacity onPress={() => handleCategoryPress(category)} activeOpacity={0.7}>
              <View style={styles.row}>
                <Text style={styles.icon}>{category.icon}</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.monthly_budget > 0 ? (
                    <>
                      <Text style={styles.limitText}>
                        {fmtPeso(status?.spent ?? 0)} / {fmtPeso(category.monthly_budget)}
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${fillRatio * 100}%`, backgroundColor: isOverBudget ? '#EF4444' : '#3B82F6' },
                          ]}
                        />
                      </View>
                    </>
                  ) : (
                    <Text style={styles.limitText}>No limit set</Text>
                  )}
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <Modal visible={editing !== null} transparent animationType="slide" onRequestClose={() => setEditing(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditing(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>{editing?.category.name}</Text>

              <Text style={styles.fieldLabel}>Monthly Limit (₱)</Text>
              <TextInput
                style={styles.textInput}
                value={editing?.budgetInput ?? ''}
                onChangeText={(text) => setEditing(prev => prev ? { ...prev, budgetInput: text } : null)}
                keyboardType="numeric"
                placeholder="0 = no limit"
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Budget Carryover</Text>
                <Switch
                  value={editing?.carryoverEnabled ?? false}
                  onValueChange={(value) => setEditing(prev => prev ? { ...prev, carryoverEnabled: value } : null)}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
