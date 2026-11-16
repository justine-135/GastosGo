import { Pressable, Text } from "react-native";
import styles from "./FAB.styles";

interface Props {
  onPress: () => void;
}

export function FAB({ onPress }: Props) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Text style={styles.icon}>+</Text>
    </Pressable>
  );
}
