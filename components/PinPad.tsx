import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['C', '0', '⌫'],
];

export function PinPad({ onDigit, onBackspace, onClear, disabled = false }: Props) {
  const handleKey = useCallback(
    (key: string) => {
      if (disabled) return;
      if (key === '⌫') onBackspace();
      else if (key === 'C') onClear();
      else onDigit(key);
    },
    [disabled, onDigit, onBackspace, onClear]
  );

  return (
    <View style={styles.grid} accessibilityLabel="PIN keypad">
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.key, disabled && styles.keyDisabled]}
              onPress={() => handleKey(key)}
              accessibilityRole="button"
              accessibilityLabel={key === '⌫' ? 'Backspace' : key === 'C' ? 'Clear' : key}
              disabled={disabled}
            >
              <Text style={[styles.keyText, disabled && styles.keyTextDisabled]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  keyDisabled: { backgroundColor: '#F0EAE0', opacity: 0.5 },
  keyText: { fontSize: 22, fontWeight: '600', color: '#2D3047' },
  keyTextDisabled: { color: '#9CA3AF' },
});
