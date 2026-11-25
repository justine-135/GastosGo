import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { getDb } from '../db';
import {
  insertRule,
  updateRule,
  deleteRule,
  deactivateRule,
  activateRule,
  RecurringRuleRow,
} from '../db/recurringRules';
import { listCategories, CategoryRow } from '../db/categories';
import { colors } from '../theme/colors';
import { styles } from '../screens/recurring-rule-sheet.styles';

const PAYMENT_METHODS = ['Cash', 'GCash', 'Card', 'Others'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHLY_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const SLIDE_DURATION = 250;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface RecurringRuleSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  editRule?: RecurringRuleRow | null;
  onSaved: () => void;
}

export function RecurringRuleSheet({ sheetRef, editRule, onSaved }: RecurringRuleSheetProps) {
  const saveScale = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;

  const [ruleName, setRuleName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [amountText, setAmountText] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly'>('monthly');
  const [recurrenceDay, setRecurrenceDay] = useState(1);
  const [sheetView, setSheetView] = useState<'form' | 'category-picker'>('form');

  const categories = useMemo(() => listCategories(getDb()), []);
  const amount = Number(amountText);
  const canSave = amount > 0 && categoryId !== null && ruleName.trim().length > 0;

  useEffect(() => {
    if (editRule) {
      setRuleName(editRule.name);
      setAmountText(String(editRule.amount));
      setCategoryId(editRule.category_id);
      const matchedCategory = categories.find(c => c.id === editRule.category_id);
      setCategoryName(matchedCategory?.name ?? null);
      setPaymentMethod(editRule.payment_method);
      setFrequency(editRule.frequency);
      setRecurrenceDay(editRule.recurrence_day);
    }
  }, [editRule, categories]);

  function resetForm() {
    setRuleName('');
    setAmountText('');
    setCategoryId(null);
    setCategoryName(null);
    setPaymentMethod('Cash');
    setFrequency('monthly');
    setRecurrenceDay(1);
    setSheetView('form');
    slideX.setValue(0);
  }

  function openCategoryPicker() {
    setSheetView('category-picker');
    Animated.timing(slideX, { toValue: -SCREEN_WIDTH, duration: SLIDE_DURATION, useNativeDriver: true }).start();
  }

  function closeToForm() {
    Animated.timing(slideX, { toValue: 0, duration: SLIDE_DURATION, useNativeDriver: true }).start(() => {
      setSheetView('form');
    });
  }

  function pickCategory(id: string, name: string) {
    setCategoryId(id);
    setCategoryName(name);
    closeToForm();
  }

  function handleSave() {
    if (!canSave) return;
    const db = getDb();
    if (editRule) {
      updateRule(db, editRule.id, {
        name: ruleName.trim(),
        amount,
        categoryId: categoryId!,
        frequency,
        recurrenceDay,
        paymentMethod,
      });
    } else {
      insertRule(db, {
        name: ruleName.trim(),
        amount,
        categoryId: categoryId!,
        frequency,
        recurrenceDay,
        paymentMethod,
      });
    }
    onSaved();
    sheetRef.current?.dismiss();
  }

  function handleDelete() {
    if (!editRule) return;
    Alert.alert('Delete Rule', 'This will permanently remove this recurring rule. Expenses already logged will remain.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRule(getDb(), editRule.id);
          onSaved();
          sheetRef.current?.dismiss();
        },
      },
    ]);
  }

  function handleToggleActive() {
    if (!editRule) return;
    const db = getDb();
    if (editRule.is_active) {
      deactivateRule(db, editRule.id);
    } else {
      activateRule(db, editRule.id);
    }
    onSaved();
    sheetRef.current?.dismiss();
  }

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    [],
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
          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
              <View style={styles.handle} />
            </Pressable>
            <View style={styles.header}>
              <Text style={styles.title}>{editRule ? 'Edit Rule' : 'New Rule'}</Text>
            </View>

            <ScrollView style={styles.sheetContent} keyboardShouldPersistTaps="handled">
              <Pressable onPress={Keyboard.dismiss}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Name</Text>
                  <View style={[styles.inputWrap, nameFocused && styles.inputWrapFocused]}>
                    <TextInput
                      style={styles.nameInput}
                      placeholder="e.g. Netflix, Electricity"
                      placeholderTextColor={colors.gray2}
                      value={ruleName}
                      onChangeText={setRuleName}
                      onFocus={() => setNameFocused(true)}
                      onBlur={() => setNameFocused(false)}
                    />
                  </View>
                </View>

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
                  <Text style={styles.label}>Frequency</Text>
                  <SegmentedControl
                    values={['Monthly', 'Weekly']}
                    selectedIndex={frequency === 'monthly' ? 0 : 1}
                    onChange={(event) => {
                      const newFreq = event.nativeEvent.selectedSegmentIndex === 0 ? 'monthly' : 'weekly';
                      setFrequency(newFreq);
                      setRecurrenceDay(newFreq === 'monthly' ? 1 : 0);
                    }}
                    tintColor={colors.brand}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>{frequency === 'monthly' ? 'Day of Month' : 'Day of Week'}</Text>
                  {frequency === 'weekly' ? (
                    <SegmentedControl
                      values={DAY_NAMES}
                      selectedIndex={recurrenceDay}
                      onChange={(event) => setRecurrenceDay(event.nativeEvent.selectedSegmentIndex)}
                      tintColor={colors.brand}
                    />
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.dayScrollRow}>
                        {MONTHLY_DAYS.map((dayNum) => {
                          const selected = dayNum === recurrenceDay;
                          return (
                            <Pressable
                              key={dayNum}
                              style={[styles.dayChip, selected && styles.dayChipActive]}
                              onPress={() => setRecurrenceDay(dayNum)}
                            >
                              <Text style={selected ? styles.dayChipTextActive : styles.dayChipText}>{dayNum}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  )}
                </View>

                <Animated.View style={{ transform: [{ scale: saveScale }] }}>
                  <Pressable
                    style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                    disabled={!canSave}
                    onPress={handleSave}
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

                {editRule && (
                  <>
                    <Pressable style={styles.dangerButton} onPress={handleToggleActive}>
                      <Text style={styles.pauseText}>
                        {editRule.is_active ? 'Pause Rule' : 'Resume Rule'}
                      </Text>
                    </Pressable>
                    <Pressable style={styles.dangerButton} onPress={handleDelete}>
                      <Text style={styles.dangerText}>Delete Rule</Text>
                    </Pressable>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>

          <View style={[styles.slidePage, { width: SCREEN_WIDTH }]}>
            <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
              <View style={styles.handle} />
            </Pressable>
            <View style={styles.categoryPickerHeader}>
              <Text style={styles.categoryPickerHeaderTitle}>Category</Text>
            </View>
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
