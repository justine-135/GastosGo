import { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDb } from '../src/db';
import { listCategories } from '../src/db/categories';
import { NavBar } from '../src/components/NavBar';
import { callback } from '../src/lib/categoryPickerBridge';
import { styles } from '../src/screens/category-picker.styles';

export default function CategoryPickerScreen() {
  const router = useRouter();
  const { currentCategoryId } = useLocalSearchParams<{ currentCategoryId?: string }>();
  const categories = useMemo(() => listCategories(getDb()), []);

  function pickCategory(id: string, name: string) {
    callback?.(id, name);
    router.back();
  }

  return (
    <View style={styles.container}>
      <NavBar title="Category" onBack={() => router.back()} />
      <FlatList
        data={categories}
        keyExtractor={(category) => category.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item: category }) => {
          const selected = category.id === currentCategoryId;
          return (
            <Pressable style={styles.row} onPress={() => pickCategory(category.id, category.name)}>
              <View style={[styles.iconBox, { backgroundColor: `${category.color}22` }]}>
                <Text style={styles.emoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          );
        }}
      />
    </View>
  );
}
