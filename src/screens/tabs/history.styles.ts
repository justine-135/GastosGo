import { Platform, StyleSheet } from 'react-native';
import { spacing } from '../../theme';

const colors = {
  bg: '#F7F7F9',
  card: '#FFFFFF',
  navy: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
} as const;

const shadowSm = Platform.OS === 'ios'
  ? { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 2 } }
  : { elevation: 2 };

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    paddingTop: spacing.navBarHeight + 16,
  },
  largeHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  largeTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Inter_800ExtraBold',
    color: colors.navy,
    letterSpacing: -1,
  },
  monthLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.bg,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.gray,
    letterSpacing: 0.52,
  },
  dayTotalPill: {
    backgroundColor: colors.grayLight,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dayTotalText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  cardWrapper: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 0,
    ...shadowSm,
  },
  cardWrapperFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  rowFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  rowLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 8,
  },
  rowPressed: {
    backgroundColor: colors.grayLight,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  rowMain: {
    flex: 1,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    color: colors.navy,
  },
  meta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    padding: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    color: colors.navy,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.gray,
    lineHeight: 22,
  },
});
