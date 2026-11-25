import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../db';
import { insertExpense } from '../db/expenses';
import { listCategories } from '../db/categories';
import { fmtDate } from '../utils/fmtDate';
import { todayStr } from '../utils/fmtPeso';
import { colors } from '../theme/colors';
import { styles } from '../screens/add-expense.styles';
import { registerAddExpenseSheet } from '../lib/addExpenseSheet';
import { notifyExpenseSaved } from '../lib/expenseSavedBridge';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Card', 'Others'];
const SLIDE_DURATION = 250;
const SCREEN_WIDTH = Dimensions.get('window').width;

type SheetView = 'form' | 'category-picker';

export function AddExpenseSheet() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const saveScale = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  const [view, setView] = useState<SheetView>('form');
  const [amountText, setAmountText] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [date, setDate] = useState(todayStr());
  const [showPicker, setShowPicker] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const [notes, setNotes] = useState('');

  const categories = useMemo(() => listCategories(getDb()), []);
  const amount = Number(amountText);
  const canSave = amount > 0 && categoryId !== null;

  useEffect(() => {
    registerAddExpenseSheet(sheetRef);
    return () => registerAddExpenseSheet(null);
  }, []);

  function resetForm() {
    setAmountText('');
    setCategoryId(null);
    setCategoryName(null);
    setPaymentMethod('Cash');
    setDate(todayStr());
    setNotes('');
    setView('form');
    slideX.setValue(0);
  }

  function openCategoryPicker() {
    setView('category-picker');
    Animated.timing(slideX, { toValue: -SCREEN_WIDTH, duration: SLIDE_DURATION, useNativeDriver: true }).start();
  }

  function closeToForm() {
    Animated.timing(slideX, { toValue: 0, duration: SLIDE_DURATION, useNativeDriver: true }).start(() => {
      setView('form');
    });
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [view]
  );

  function pickCategory(id: string, name: string) {
    setCategoryId(id);
    setCategoryName(name);
    closeToForm();
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
    notifyExpenseSaved();
    sheetRef.current?.dismiss();
  }

  const categoryPickerHeader = (
    <>
      <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
        <View style={styles.handle} />
      </Pressable>

      <View style={styles.categoryPickerHeader}>
        <Text style={styles.categoryPickerHeaderTitle}>Category</Text>
      </View>
    </>
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={['92%']}
      handleComponent={null}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={resetForm}
    >
      <BottomSheetView style={styles.slideViewport}>
        <Animated.View style={[styles.slideTrack, { transform: [{ translateX: slideX }] }]}>
          {/* Form page */}
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
              <View style={styles.handle} />
            </Pressable>
            <View style={styles.header}>
              <Text style={styles.title}>Add Expense</Text>
            </View>

            <Pressable style={styles.sheetContent} onPress={Keyboard.dismiss}>
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
                <SegmentedControl
                  values={PAYMENT_METHODS}
                  selectedIndex={PAYMENT_METHODS.indexOf(paymentMethod)}
                  onChange={(event) => setPaymentMethod(PAYMENT_METHODS[event.nativeEvent.selectedSegmentIndex])}
                  tintColor={colors.brand}
                />
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

              <Animated.View style={{ transform: [{ scale: saveScale }] }}>
                <Pressable
                  style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                  disabled={!canSave}
                  onPress={save}
                  onPressIn={() => Animated.timing(saveScale, { toValue: 0.97, duration: 120, useNativeDriver: true }).start()}
                  onPressOut={() => Animated.timing(saveScale, { toValue: 1, duration: 120, useNativeDriver: true }).start()}
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
              </Animated.View>
            </Pressable>
          </View>

          {/* Category picker page */}
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            {categoryPickerHeader}
            <ScrollView contentContainerStyle={styles.categoryPickerList}>
              {categories.map((category, index) => {
                const selected = category.id === categoryId;
                return (
                  <View key={category.id}>
                    {index > 0 && <View style={styles.categoryPickerSeparator} />}
                    <Pressable style={styles.categoryPickerRow} onPress={() => pickCategory(category.id, category.name)}>
                      <View style={[styles.categoryPickerIconBox, { backgroundColor: `${category.color}22` }]}>
                        <Text style={styles.categoryPickerEmoji}>{category.icon}</Text>
                      </View>
                      <Text style={styles.categoryPickerName}>{category.name}</Text>
                      {selected && <Feather name="check" size={16} color={colors.brand} />}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
