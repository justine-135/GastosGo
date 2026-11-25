import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getDb } from '../src/db';
import { listCategories, updateCategoryBudget } from '../src/db/categories';
import { colors } from '../src/theme';
import { styles } from '../src/screens/budget-edit.styles';

export default function BudgetEditScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const db = getDb();
  const category = listCategories(db).find((c) => c.id === categoryId);

  const [limitInput, setLimitInput] = useState(
    category && category.monthly_budget > 0 ? String(category.monthly_budget) : '',
  );
  const [carryoverEnabled, setCarryoverEnabled] = useState(
    category ? category.carryover_enabled === 1 : false,
  );
  const [nameFocused, setNameFocused] = useState(false);

  const handleSave = useCallback(() => {
    if (!category) return;
    const parsedLimit = parseFloat(limitInput);
    const monthlyBudget = isNaN(parsedLimit) || parsedLimit < 0 ? 0 : parsedLimit;
    updateCategoryBudget(db, category.id, monthlyBudget, carryoverEnabled);
    router.back();
  }, [category, limitInput, carryoverEnabled, db]);

  if (!category) return null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: category.name,
        headerRight: () => (
          <Pressable onPress={handleSave} hitSlop={8}>
            <Text style={{ color: colors.brand, fontSize: 17, fontWeight: '600' }}>Save</Text>
          </Pressable>
        ),
      }} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.fieldLabel}>Category Name</Text>
        <View style={[styles.nameWrap, nameFocused && styles.nameWrapFocused]}>
          <TextInput
            style={styles.nameInput}
            value={category.name}
            editable={false}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
          />
        </View>

        <Text style={styles.fieldLabel}>Monthly Limit</Text>
        <View style={styles.limitRow}>
          <Text style={styles.limitPrefix}>₱</Text>
          <TextInput
            style={styles.limitInput}
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.gray2}
          />
        </View>
        <Text style={styles.limitHint}>Leave empty for no limit</Text>

        <View style={styles.carryoverCard}>
          <View style={styles.carryoverTextGroup}>
            <Text style={styles.carryoverTitle}>Budget Carryover</Text>
            <Text style={styles.carryoverDesc}>Unused budget rolls over</Text>
          </View>
          <Switch
            value={carryoverEnabled}
            onValueChange={(value) => { Haptics.selectionAsync(); setCarryoverEnabled(value); }}
            trackColor={{ false: colors.gray2, true: colors.green }}
            thumbColor={colors.card}
          />
        </View>
      </ScrollView>
    </View>
  );
}
