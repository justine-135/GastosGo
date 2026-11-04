import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import type { Category } from '../lib/db/types';

interface Props {
  category: Category;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function CategoryChip({ category, selected = false, onPress, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: category.color, backgroundColor: selected ? category.color : 'transparent' },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category`}
      accessibilityState={{ selected }}
    >
      <Text style={styles.icon}>{category.icon}</Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 44,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#2D3047' },
  labelSelected: { color: '#FFFFFF' },
});
