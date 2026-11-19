import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getDb } from '../db';
import { saveSettings, IncomeMode } from '../db/settings';
import { insertCycleSnapshot, InsertCycleSnapshotInput } from '../db/cycleSnapshots';
import { styles } from './NewCyclePrompt.styles';

interface DefaultValues {
  incomeMode: IncomeMode;
  monthlySalary: number;
  freelanceIncome: number;
  expectedSavings: number;
  savingsTarget: number;
}

interface Props {
  cycleStartDate: string;
  defaultValues: DefaultValues;
  onConfirm: () => void;
}

export default function NewCyclePrompt({ cycleStartDate, defaultValues, onConfirm }: Props) {
  const [salary, setSalary] = useState(String(defaultValues.monthlySalary));
  const [freelance, setFreelance] = useState(String(defaultValues.freelanceIncome));
  const [expectedSavings, setExpectedSavings] = useState(String(defaultValues.expectedSavings));
  const [savingsTarget, setSavingsTarget] = useState(String(defaultValues.savingsTarget));

  const { incomeMode } = defaultValues;
  const isTarget = incomeMode === 'target';
  const canConfirm = isTarget ? Number(savingsTarget) > 0 : Number(salary) > 0;
  const valuesChanged =
    salary !== String(defaultValues.monthlySalary) ||
    freelance !== String(defaultValues.freelanceIncome) ||
    expectedSavings !== String(defaultValues.expectedSavings) ||
    savingsTarget !== String(defaultValues.savingsTarget);

  function handleConfirm() {
    const db = getDb();
    const snapshot: InsertCycleSnapshotInput = {
      cycleStartDate,
      incomeMode,
      monthlySalary: Number(salary),
      freelanceIncome: Number(freelance),
      expectedSavings: Number(expectedSavings),
      savingsTarget: Number(savingsTarget),
    };
    insertCycleSnapshot(db, snapshot);
    saveSettings(db, {
      incomeMode,
      monthlySalary: Number(salary),
      freelanceIncome: Number(freelance),
      expectedSavings: Number(expectedSavings),
      savingsTarget: Number(savingsTarget),
    });
    onConfirm();
  }

  return (
    <Modal visible transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <ScrollView contentContainerStyle={{ width: '100%' }} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>New cycle started</Text>
            <Text style={styles.subtitle}>Confirm your income for this cycle.</Text>

            {!isTarget && (
              <>
                <Text style={styles.label}>Monthly salary (₱)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={salary} onChangeText={setSalary} />
                {incomeMode === 'mixed' && (
                  <>
                    <Text style={styles.label}>Freelance income (₱)</Text>
                    <TextInput style={styles.input} keyboardType="numeric" value={freelance} onChangeText={setFreelance} />
                  </>
                )}
                <Text style={styles.label}>Expected savings (₱)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={expectedSavings} onChangeText={setExpectedSavings} />
              </>
            )}

            {isTarget && (
              <>
                <Text style={styles.label}>Savings target (₱)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={savingsTarget} onChangeText={setSavingsTarget} />
              </>
            )}

            <TouchableOpacity
              style={[styles.confirm, !canConfirm && styles.confirmDisabled]}
              onPress={handleConfirm}
              disabled={!canConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmLabel}>{valuesChanged ? 'Save changes' : 'Looks good'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
