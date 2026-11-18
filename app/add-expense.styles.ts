import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#16A34A',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chipSelected: {
    backgroundColor: '#16A34A',
  },
  chipText: {
    fontSize: 14,
    color: '#334155',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 15,
    color: '#0F172A',
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
