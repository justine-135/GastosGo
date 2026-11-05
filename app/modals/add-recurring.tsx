// FE-10: Add / Edit Recurring Rule Modal
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
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

  // Pre-select first category when categories load and none is set yet
  useEffect(() => {
    if (!isEditing && !categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, isEditing, categoryId]);
  const addRule = useAddRecurringRule();
  const updateRule = useUpdateRecurringRule();

  // Seed form state from existing rule when editing
  useEffect(() => {
    if (!isEditing || !params.ruleId) return;
    const rule = rules.find((r) => r.id === params.ruleId);
    if (!rule) return;
    setName(rule.name);
    setAmount(String(rule.amount));
    setCategoryId(rule.categoryId);
    setFrequency(rule.frequency);
    setPaymentMethod(rule.paymentMethod);
    setFirstDueDate(rule.nextDueDate);
  }, [isEditing, params.ruleId, rules]);

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
              ? <ActivityIndicator size="small" color="#F4A261" />
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
            placeholderTextColor="#9CA3AF"
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
              onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5D5C0',
  },
  headerBtn: { minWidth: 60, minHeight: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#2D3047', textAlign: 'center', flex: 1 },
  cancelText: { fontSize: 16, color: '#6B7280' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#F4A261', textAlign: 'right' },
  scroll: { padding: 20, gap: 10 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5D5C0', paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#2D3047', minHeight: 48,
  },
  inputError: { borderColor: '#E76F51' },
  errorText: { fontSize: 13, color: '#E76F51', marginTop: -4 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pesoSign: { fontSize: 20, fontWeight: '700', color: '#F4A261' },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  segmentRow: { flexDirection: 'row', backgroundColor: '#F0EAE0', borderRadius: 12, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, minHeight: 44, justifyContent: 'center' },
  segmentActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  segmentTextActive: { color: '#2D3047', fontWeight: '700' },
  dateBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5D5C0',
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 48,
  },
  dateBtnText: { fontSize: 16, color: '#2D3047' },
  doneDateBtn: { alignItems: 'center', paddingVertical: 12 },
  doneDateBtnText: { fontSize: 16, color: '#F4A261', fontWeight: '600' },
});
