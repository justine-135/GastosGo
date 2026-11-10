// FE-05: Add / Edit Expense Modal
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Modal,
} from 'react-native';
import { styles } from './add-expense.styles';
import { colors } from '../../theme/index';
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
      console.error('[AddExpense] save failed:', e);
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
              placeholderTextColor={colors.light.disabledForeground}
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
                  placeholderTextColor={colors.light.mutedForeground}
                  accessibilityLabel="New category name"
                />
                <TextInput
                  style={[styles.input, { width: 60, textAlign: 'center' }]}
                  value={newCatIcon}
                  onChangeText={setNewCatIcon}
                  placeholder="🏷️"
                  placeholderTextColor={colors.light.mutedForeground}
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
            placeholderTextColor={colors.light.mutedForeground}
            accessibilityLabel="Merchant name"
          />

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={(v) => setNotes(v.slice(0, 200))}
            placeholder="Add a note…"
            placeholderTextColor={colors.light.mutedForeground}
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

