import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./index.styles";

type IncomeMode = "salary" | "mixed" | "target";

const MODES: Array<{ id: IncomeMode; emoji: string; name: string; desc: string }> = [
  { id: "salary", emoji: "💼", name: "Salary", desc: "Fixed monthly income" },
  { id: "mixed", emoji: "🔀", name: "Mixed", desc: "Salary + freelance / irregular income" },
  { id: "target", emoji: "🎯", name: "Target", desc: "No income logging — just set a spending cap" },
];

export default function OnboardingModeScreen() {
  const [selected, setSelected] = useState<IncomeMode | null>(null);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>💰</Text>
        <Text style={styles.title}>How do you track income?</Text>
        <Text style={styles.subtitle}>
          Helps us calculate your savings gap — the difference between what you expected to save and what you actually saved.
        </Text>
      </View>

      <View style={styles.modes}>
        {MODES.map((mode) => (
          <Pressable
            key={mode.id}
            style={[styles.modeOpt, selected === mode.id && styles.modeOptSelected]}
            onPress={() => setSelected(mode.id)}
          >
            <View style={styles.modeHeader}>
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
              <Text style={styles.modeName}>{mode.name}</Text>
            </View>
            <Text style={styles.modeDesc}>{mode.desc}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <Pressable
        style={[styles.btn, !selected && styles.btnDisabled]}
        disabled={!selected}
        onPress={() => router.push({ pathname: "/(onboarding)/setup", params: { mode: selected! } })}
      >
        <Text style={styles.btnText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}
