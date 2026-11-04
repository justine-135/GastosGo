import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
        style={styles.arrow}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.arrowText}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  arrow: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 24,
    color: '#F4A261',
    fontWeight: '600',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D3047',
    minWidth: 160,
    textAlign: 'center',
  },
});
