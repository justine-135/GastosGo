import { Text, View } from 'react-native';
import { styles } from './Placeholder.styles';

export function Placeholder({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}
