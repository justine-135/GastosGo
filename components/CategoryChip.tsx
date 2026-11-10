import React from 'react';
import { TouchableOpacity, Text, type ViewStyle } from 'react-native';
import { styles } from './CategoryChip.styles';
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

