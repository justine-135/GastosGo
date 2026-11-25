import { useLocalSearchParams } from 'expo-router';
import { RecurringRuleSheet } from '../src/components/RecurringRuleSheet';

export default function RecurringRuleFormScreen() {
  const { ruleId } = useLocalSearchParams<{ ruleId?: string }>();
  return <RecurringRuleSheet editRuleId={ruleId} />;
}
