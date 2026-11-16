import { View, Text } from "react-native";
import styles from "./EmptyState.styles";

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}
