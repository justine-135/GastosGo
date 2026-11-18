import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  empty: {
    marginTop: 64,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  rowMain: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  meta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  gapCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  gapOnTrack: { backgroundColor: '#DCFCE7' },
  gapAtRisk: { backgroundColor: '#FEE2E2' },
  gapLabel: { fontSize: 13, fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  gapAmount: { fontSize: 32, fontWeight: '800', color: '#0F172A', marginTop: 4, fontVariant: ['tabular-nums'] },
  gapStatus: { fontSize: 14, color: '#475569', marginTop: 4 },
});
