import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 32, marginTop: 60 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 16 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 17,
    backgroundColor: '#fff',
    color: '#0F172A',
  },
  done: {
    marginTop: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneDisabled: { backgroundColor: '#93C5FD' },
  doneLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
});
