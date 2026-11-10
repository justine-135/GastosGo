import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './PinPad.styles';

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

