import { Text } from "react-native";
import styles from "./SectionHeader.styles";

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.text}>{title}</Text>;
}
