import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDb } from '../src/db';
import { insertExpense } from '../src/db/expenses';
import { fmtDate } from '../src/utils/fmtDate';
import { todayStr } from '../src/utils/fmtPeso';
import { colors } from '../src/theme/colors';
import { setCallback } from '../src/lib/categoryPickerBridge';
import { styles } from '../src/screens/add-expense.styles';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Card', 'Others'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const [amountText, setAmountText] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(todayStr());
  const [showPicker, setShowPicker] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const [notes, setNotes] = useState('');

  const amount = Number(amountText);
  const canSave = amount > 0 && categoryId !== null;

  function openCategoryPicker() {
    setCallback((pickedId, pickedName) => {
      setCategoryId(pickedId);
      setCategoryName(pickedName);
      setCallback(null);
    });
    router.push({ pathname: '/category-picker', params: { currentCategoryId: categoryId ?? '' } });
  }

  function save() {
    if (!canSave) return;
    insertExpense(getDb(), {
      amount,
      categoryId,
      paymentMethod,
      date,
      notes: notes.trim() || undefined,
    });
    router.back();
  }

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={['80%']}
        enablePanDownToClose
        onDismiss={() => router.back()}
      >
        <BottomSheetView>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Add Expense</Text>
            <Pressable style={styles.closeButton} onPress={() => router.back()}>
              <Feather name="x" size={14} color={colors.gray} />
            </Pressable>
          </View>

          <View style={styles.sheetContent}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Amount</Text>
              <View style={[styles.inputWrap, amountFocused && styles.inputWrapFocused]}>
                <Text style={styles.amountPrefix}>₱</Text>
                <TextInput
                  style={styles.amountInput}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.gray2}
                  value={amountText}
                  onChangeText={setAmountText}
                  onFocus={() => setAmountFocused(true)}
                  onBlur={() => setAmountFocused(false)}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category</Text>
              <Pressable style={styles.inputWrap} onPress={openCategoryPicker}>
                {categoryName ? (
                  <Text style={styles.categoryName}>{categoryName}</Text>
                ) : (
                  <Text style={styles.categoryPlaceholder}>Select category</Text>
                )}
                <Feather name="chevron-right" size={16} color={colors.gray} />
              </Pressable>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.segmentContainer}>
                {PAYMENT_METHODS.map((method) => {
                  const selected = method === paymentMethod;
                  return (
                    <Pressable
                      key={method}
                      style={[styles.segment, selected && styles.segmentActive]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text style={selected ? styles.segmentTextActive : styles.segmentText}>
                        {method}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date</Text>
              <Pressable style={styles.inputWrap} onPress={() => setShowPicker(true)}>
                <Text style={styles.dateText}>{fmtDate(date, todayStr())}</Text>
              </Pressable>
              {showPicker && (
                <DateTimePicker
                  value={new Date(date)}
                  mode="date"
                  onChange={(_event, selectedDate) => {
                    setShowPicker(Platform.OS === 'ios');
                    if (selectedDate) setDate(selectedDate.toISOString().slice(0, 10));
                  }}
                />
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <View style={[styles.inputWrap, notesFocused && styles.inputWrapFocused, { paddingVertical: 12 }]}>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Optional"
                  placeholderTextColor={colors.gray2}
                  value={notes}
                  onChangeText={setNotes}
                  onFocus={() => setNotesFocused(true)}
                  onBlur={() => setNotesFocused(false)}
                />
              </View>
            </View>

            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              disabled={!canSave}
              onPress={save}
            >
              <LinearGradient
                colors={['#7389F9', '#4F6EF7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                <Text style={styles.saveText}>Save</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
