import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { getDb } from '../src/db';
import { listRules, RecurringRuleRow } from '../src/db/recurringRules';
import { listCategories, CategoryRow } from '../src/db/categories';
import { fmtPeso } from '../src/utils/fmtPeso';
import { colors } from '../src/theme';
import { styles } from '../src/screens/recurring-rules.styles';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function frequencyLabel(rule: RecurringRuleRow): string {
  if (rule.frequency === 'weekly') return `Weekly · ${DAY_NAMES[rule.recurrence_day]}`;
  return `Monthly · Day ${rule.recurrence_day}`;
}

export default function RecurringRulesScreen() {
  const [rules, setRules] = useState<RecurringRuleRow[]>([]);
  const [categoriesById, setCategoriesById] = useState<Record<string, CategoryRow>>({});

  const reload = useCallback(() => {
    const db = getDb();
    setRules(listRules(db));
    const allCategories = listCategories(db);
    const byId: Record<string, CategoryRow> = {};
    for (const category of allCategories) byId[category.id] = category;
    setCategoriesById(byId);
  }, []);

  useFocusEffect(reload);

  function openCreate() {
    router.push('/recurring-rule-form');
  }

  function openEdit(rule: RecurringRuleRow) {
    router.push({ pathname: '/recurring-rule-form', params: { ruleId: rule.id } });
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => (
          <Pressable onPress={openCreate} hitSlop={8}>
            <Text style={{ color: colors.brand, fontSize: 17, fontWeight: '600' }}>Add</Text>
          </Pressable>
        ),
      }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rules.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔁</Text>
            <Text style={styles.emptyTitle}>No recurring rules</Text>
            <Text style={styles.emptyMeta}>Tap Add to create a recurring bill.</Text>
          </View>
        ) : (
          <View style={styles.ruleCard}>
            {rules.map((rule, index) => {
              const category = rule.category_id ? categoriesById[rule.category_id] : undefined;
              const iconBg = `${category?.color ?? '#8E8E93'}22`;
              return (
                <Pressable key={rule.id} onPress={() => openEdit(rule)}>
                  <View style={[styles.ruleRow, index < rules.length - 1 && styles.ruleRowSep]}>
                    <View style={[styles.ruleIcon, { backgroundColor: iconBg }]}>
                      <Text style={styles.ruleEmoji}>{category?.icon ?? '📦'}</Text>
                    </View>
                    <View style={styles.ruleMain}>
                      <Text style={styles.ruleName}>{rule.name}</Text>
                      <Text style={styles.ruleMeta}>{frequencyLabel(rule)}</Text>
                    </View>
                    <View style={styles.ruleRight}>
                      <Text style={styles.ruleAmount}>{fmtPeso(rule.amount)}</Text>
                      <Text style={styles.ruleDueDate}>{rule.next_due_date}</Text>
                      {!rule.is_active && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>Paused</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
