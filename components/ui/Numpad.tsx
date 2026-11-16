import { View, Pressable, Text } from "react-native";
import styles from "./Numpad.styles";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;

export function Numpad({ value, onChange, onNext, nextLabel = "Next →", nextDisabled }: Props) {
  function press(key: string) {
    let v = value;
    if (key === "del") {
      v = v.slice(0, -1);
    } else if (key === ".") {
      if (!v.includes(".")) v += ".";
    } else {
      if (v === "0") v = key;
      else v += key;
      if (v.length > 8) return;
    }
    onChange(v);
  }

  return (
    <View style={styles.grid}>
      {KEYS.map((k) => (
        <Pressable key={k} style={styles.key} onPress={() => press(k)}>
          <Text style={[styles.keyText, k === "del" && styles.actionText]}>
            {k === "del" ? "⌫" : k}
          </Text>
        </Pressable>
      ))}
      <Pressable
        style={[styles.nextKey, nextDisabled && styles.nextDisabled]}
        disabled={nextDisabled}
        onPress={onNext}
      >
        <Text style={styles.nextText}>{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
