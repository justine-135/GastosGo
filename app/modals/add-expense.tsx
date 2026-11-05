// FE-05: Add / Edit Expense Modal
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories, insertCategory } from '../../lib/db';
import { useAddExpense, useUpdateExpense } from '../../hooks/useExpenses';
import { CategoryChip } from '../../components/CategoryChip';
import { formatDate } from '../../utils/format';
import type { PaymentMethod, Category } from '../../lib/db/types';

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'GCash', 'Card', 'Others'];

interface Props {
  // When editing, these params are pre-filled
  expenseId?: string;
  initialAmount?: string;
  initialCategoryId?: string;
  initialMerchant?: string;
  initialNotes?: string;
  initialPaymentMethod?: PaymentMethod;
  initialDate?: string;
}

export default function AddExpenseModal() {
  const params = useLocalSearchParams<{
    expenseId?: string;
    initialAmount?: string;
    initialCategoryId?: string;
    initialMerchant?: string;
    initialNotes?: string;
    initialPaymentMethod?: PaymentMethod;
    initialDate?: string;
  }>();

  const isEditing = !!params.expenseId;
  const amountRef = useRef<TextInput>(null);

  const [amount, setAmount] = useState(params.initialAmount ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(params.initialCategoryId ?? '');
  const [merchant, setMerchant] = useState(params.initialMerchant ?? '');
  const [notes, setNotes] = useState(params.initialNotes ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (params.initialPaymentMethod as PaymentMethod) ?? 'Cash'
  );
  const [date, setDate] = useState(params.initialDate ?? (() => { const n = new Date(); return new Date(n.getTime() - n.getTimezoneOffset() * 60000).toISOString().split('T')[0]; })());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();

  useEffect(() => {
    // Auto-focus amount field on open
    const t = setTimeout(() => amountRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  function validate(): boolean {
    const e: Record<string, string> = {};
    const a = parseFloat(amount);
    if (!amount || isNaN(a) || a <= 0) e.amount = 'Enter a valid amount greater than 0';
    if (!selectedCategoryId) e.category = 'Please select a category';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const input = {
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      categoryId: selectedCategoryId,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
      date,
    };

    try {
      if (isEditing && params.expenseId) {
        await updateExpense.mutateAsync({ id: params.expenseId, input });
      } else {
        await addExpense.mutateAsync(input);
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    }
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    await insertCategory({ name: newCatName.trim(), icon: newCatIcon, color: '#F4A261', monthlyBudget: 0 });
    await qc.invalidateQueries({ queryKey: ['categories'] });
    setShowNewCategory(false);
    setNewCatName('');
  }

  const handleAmountChange = useCallback((val: string) => {
    // Allow only valid decimal input up to 2 places
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
  }, []);

  const isSaving = addExpense.isPending || updateExpense.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cancel and close modal"
            style={styles.headerBtn}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Expense' : 'Add Expense'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save expense"
            style={styles.headerBtn}
          >
            <Text style={[styles.saveText, isSaving && styles.saveTextDisabled]}>
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.pesoSign}>₱</Text>
            <TextInput
              ref={amountRef}
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#C4B4A0"
              accessibilityLabel="Expense amount"
              maxLength={10}
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
                selected={selectedCategoryId === cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
              />
            ))}
            <TouchableOpacity
              style={styles.newCatChip}
              onPress={() => setShowNewCategory(true)}
              accessibilityRole="button"
              accessibilityLabel="Add new category"
            >
              <Text style={styles.newCatChipText}>+ New</Text>
            </TouchableOpacity>
          </ScrollView>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {/* Inline new category mini-form */}
          {showNewCategory && (
            <View style={styles.newCatForm}>
              <Text style={styles.fieldLabel}>New Category</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newCatName}
                  onChangeText={setNewCatName}
                  placeholder="Category name"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel="New category name"
                />
                <TextInput
                  style={[styles.input, { width: 60, textAlign: 'center' }]}
                  value={newCatIcon}
                  onChangeText={setNewCatIcon}
                  placeholder="🏷️"
                  placeholderTextColor="#9CA3AF"
                  accessibilityLabel="Category icon emoji"
                  maxLength={2}
                />
                <TouchableOpacity style={styles.addCatBtn} onPress={handleAddCategory} accessibilityRole="button" accessibilityLabel="Save new category">
                  <Text style={styles.addCatBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Merchant */}
          <Text style={styles.fieldLabel}>Merchant (optional)</Text>
          <TextInput
            style={styles.input}
            value={merchant}
            onChangeText={setMerchant}
            placeholder="e.g. Jollibee, GrabFood"
            placeholderTextColor="#9CA3AF"
            accessibilityLabel="Merchant name"
          />

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={(v) => setNotes(v.slice(0, 200))}
            placeholder="Add a note…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={200}
            accessibilityLabel="Expense notes"
          />
          <Text style={styles.charCount}>{notes.length}/200</Text>

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

          {/* Date */}
          <Text style={styles.fieldLabel}>Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`Selected date: ${formatDate(date)}`}
          >
            <Text style={styles.dateBtnText}>📅 {formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={(_, selected) => {
                setShowDatePicker(Platform.OS === 'android' ? false : showDatePicker);
                if (selected) setDate(new Date(selected.getTime() - selected.getTimezoneOffset() * 60000).toISOString().split('T')[0]);
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#2D3047' },
  cancelText: { fontSize: 16, color: '#6B7280' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#F4A261', textAlign: 'right' },
  saveTextDisabled: { color: '#C4B4A0' },
  scroll: { padding: 20, gap: 10 },
  amountContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 4,
  },
  pesoSign: { fontSize: 36, fontWeight: '700', color: '#F4A261' },
  amountInput: { fontSize: 52, fontWeight: '700', color: '#2D3047', minWidth: 160, textAlign: 'center' },
  errorText: { fontSize: 13, color: '#E76F51', marginTop: -4 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  newCatChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5,
    borderColor: '#E5D5C0', borderStyle: 'dashed', minHeight: 44, justifyContent: 'center',
  },
  newCatChipText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  newCatForm: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5D5C0', gap: 10,
  },
  row: { flexDirection: 'row', gap: 8 },
  addCatBtn: { backgroundColor: '#F4A261', borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center', minHeight: 44 },
  addCatBtnText: { color: '#FFFFFF', fontWeight: '600' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#E5D5C0', paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#2D3047', minHeight: 48,
  },
  notesInput: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right', marginTop: -4 },
  segmentRow: { flexDirection: 'row', backgroundColor: '#F0EAE0', borderRadius: 12, padding: 3 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, minHeight: 44, justifyContent: 'center' },
  segmentActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  segmentTextActive: { color: '#2D3047', fontWeight: '700' },
  dateBtn: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5D5C0',
    paddingHorizontal: 16, paddingVertical: 14, minHeight: 48,
  },
  dateBtnText: { fontSize: 16, color: '#2D3047' },
  doneDateBtn: { alignItems: 'center', paddingVertical: 12 },
  doneDateBtnText: { fontSize: 16, color: '#F4A261', fontWeight: '600' },
});
