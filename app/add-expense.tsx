import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { getDb } from '../src/db';
import { insertExpense } from '../src/db/expenses';
import { listCategories } from '../src/db/categories';
import { fmtDate } from '../src/utils/fmtDate';
import { todayStr } from '../src/utils/fmtPeso';
import { styles } from './add-expense.styles';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Card', 'Others'];

export default function AddExpenseScreen() {
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);
  const categories = useMemo(() => listCategories(getDb()), []);

  useEffect(() => {
    sheetRef.current?.present();
  }, []);

  const [amountText, setAmountText] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(todayStr());
  const [showPicker, setShowPicker] = useState(false);

  const amount = Number(amountText);
  const canSave = amount > 0 && categoryId !== null;

  function save() {
    if (!canSave) return;
    insertExpense(getDb(), { amount, categoryId, paymentMethod, date });
    router.back();
  }

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal ref={sheetRef} snapPoints={['80%']} enablePanDownToClose onDismiss={() => router.back()}>
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.title}>Log an Expense</Text>

          <Text style={styles.label}>Amount</Text>
          <BottomSheetTextInput
            style={styles.amountInput}
            keyboardType="numeric"
            placeholder="0"
            value={amountText}
            onChangeText={setAmountText}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((category) => {
              const selected = category.id === categoryId;
              return (
                <Pressable
                  key={category.id}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                    {category.icon} {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Payment Method</Text>
          <View style={styles.segment}>
            {PAYMENT_METHODS.map((method) => {
              const selected = method === paymentMethod;
              return (
                <Pressable
                  key={method}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{method}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Date</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowPicker(true)}>
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

          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            disabled={!canSave}
            onPress={save}
          >
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
}
