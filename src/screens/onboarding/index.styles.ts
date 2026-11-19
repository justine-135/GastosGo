import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F8FAFC' },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 32 },
  option: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  optionSelected: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  optionLabel: { fontSize: 17, fontWeight: '600', color: '#0F172A' },
  optionLabelSelected: { color: '#2563EB' },
  optionDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  next: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextDisabled: { backgroundColor: '#93C5FD' },
  nextLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
