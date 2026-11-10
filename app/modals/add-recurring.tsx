// FE-10: Add / Edit Recurring Rule Modal
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { styles } from './add-recurring.styles';
import { colors } from '../../theme/index';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../lib/db';
import { useAddRecurringRule, useUpdateRecurringRule, useRecurringRules } from '../../hooks/useRecurring';
import { CategoryChip } from '../../components/CategoryChip';
import { formatDate } from '../../utils/format';
import type { Frequency, PaymentMethod } from '../../lib/db/types';

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Card', 'Others'];

export default function AddRecurringModal() {
  const params = useLocalSearchParams<{ ruleId?: string }>();
  const isEditing = !!params.ruleId;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [firstDueDate, setFirstDueDate] = useState((() => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const { data: rules = [] } = useRecurringRules();
  const hasSeeded = useRef(false);

  // Pre-select first category when categories load and none is set yet.
  // Mutually exclusive with the seed effect below: only runs when !isEditing.
  useEffect(() => {
    if (!isEditing && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, isEditing, categoryId]);
  const addRule = useAddRecurringRule();
  const updateRule = useUpdateRecurringRule();

  // Seed form state from existing rule when entering edit mode.
  // hasSeeded guards against background refetches of `rules` clobbering in-progress edits.
  // Mutually exclusive with the category pre-select effect above: only runs when isEditing.
  useEffect(() => {
    if (!isEditing || hasSeeded.current) return;
    const rule = rules.find((r) => r.id === params.ruleId);
    if (!rule) return;
    setName(rule.name);
    setAmount(String(rule.amount));
    setCategoryId(rule.categoryId);
    setFrequency(rule.frequency);
    setPaymentMethod(rule.paymentMethod);
    setFirstDueDate(rule.nextDueDate);
    hasSeeded.current = true;
  }, [isEditing, rules, params.ruleId]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) e.amount = 'Enter a valid amount';
    if (!categoryId) e.category = 'Select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const input = {
      name: name.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      categoryId,
      frequency,
      firstDueDate,
      paymentMethod,
    };

    try {
      if (isEditing && params.ruleId) {
        await updateRule.mutateAsync({ id: params.ruleId, input });
      } else {
        await addRule.mutateAsync(input);
      }
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save recurring rule. Please try again.');
    }
  }

  const isSaving = addRule.isPending || updateRule.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            style={styles.headerBtn}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Recurring Bill' : 'Add Recurring Bill'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save recurring rule"
            style={styles.headerBtn}
          >
            {isSaving
              ? <ActivityIndicator size="small" color={colors.light.primary} />
              : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Name */}
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Netflix, Electric Bill"
            placeholderTextColor={colors.light.mutedForeground}
            accessibilityLabel="Recurring bill name"
            autoFocus
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          {/* Amount */}
          <Text style={styles.fieldLabel}>Amount (₱)</Text>
          <View style={styles.amountRow}>
            <Text style={styles.pesoSign}>₱</Text>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.amount && styles.inputError]}
              value={amount}
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*/, '$1'))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.light.mutedForeground}
              accessibilityLabel="Recurring amount"
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

          {/* Category */}
          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                selected={categoryId === cat.id}
                onPress={() => setCategoryId(cat.id)}
              />
            ))}
          </ScrollView>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {/* Frequency */}
          <Text style={styles.fieldLabel}>Frequency</Text>
          <View style={styles.segmentRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.segment, frequency === f && styles.segmentActive]}
                onPress={() => setFrequency(f)}
                accessibilityRole="radio"
                accessibilityLabel={f}
                accessibilityState={{ checked: frequency === f }}
              >
                <Text style={[styles.segmentText, frequency === f && styles.segmentTextActive]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Method */}
          <Text style={styles.fieldLabel}>Payment Method</Text>
          <View style={styles.segmentRow}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.segment, paymentMethod === m && styles.segmentActive]}
                onPress={() => setPaymentMethod(m)}
                accessibilityRole="radio"
                accessibilityLabel={m}
                accessibilityState={{ checked: paymentMethod === m }}
              >
                <Text style={[styles.segmentText, paymentMethod === m && styles.segmentTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* First Due Date */}
          <Text style={styles.fieldLabel}>First Due Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`First due date: ${formatDate(firstDueDate)}`}
          >
            <Text style={styles.dateBtnText}>📅 {formatDate(firstDueDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(firstDueDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'android' ? false : showDatePicker);
                if (selected) setFirstDueDate(new Date(selected.getTime() - selected.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
              }}
            />
          )}
          {Platform.OS === 'ios' && showDatePicker && (
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneDateBtn}>
              <Text style={styles.doneDateBtnText}>Done</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

