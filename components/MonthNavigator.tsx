import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './MonthNavigator.styles';
import { useUIStore } from '../stores/uiStore';
import { formatMonthYear } from '../utils/format';

interface Props {
  // Optionally override store values (for storybook / isolated usage)
  month?: number;
  year?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function MonthNavigator({ month, year, onPrev, onNext }: Props) {
  const store = useUIStore();
  const m = month ?? store.selectedMonth;
  const y = year ?? store.selectedYear;
  const handlePrev = onPrev ?? store.navigatePreviousMonth;
  const handleNext = onNext ?? store.navigateNextMonth;

  const now = new Date();
  const isCurrentMonth = y > now.getFullYear() ||
    (y === now.getFullYear() && m >= now.getMonth() + 1);

  return (
    <View style={styles.row} accessibilityRole="toolbar" accessibilityLabel="Month navigator">
      <TouchableOpacity
        onPress={handlePrev}
        accessibilityLabel="Previous month"
        accessibilityRole="button"
        style={styles.arrow}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.arrowText}>‹</Text>
      </TouchableOpacity>
      <Text style={styles.label}>{formatMonthYear(m, y)}</Text>
      <TouchableOpacity
        onPress={handleNext}
        accessibilityLabel="Next month"
        accessibilityRole="button"
        style={[styles.arrow, isCurrentMonth && styles.arrowDisabled]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        disabled={isCurrentMonth}
        accessibilityState={{ disabled: isCurrentMonth }}
      >
        <Text style={[styles.arrowText, isCurrentMonth && styles.arrowTextDisabled]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

