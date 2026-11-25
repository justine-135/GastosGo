import { StyleSheet } from 'react-native';
import { colors, shadows, spacing } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenHPad,
    paddingTop: 24,
    paddingBottom: 48,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  nameWrap: {
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  nameWrapFocused: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.brand,
    ...shadows.sm,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.navy,
    padding: 0,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.radiusSm,
    backgroundColor: colors.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
  },
  limitPrefix: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.gray,
    marginRight: 6,
  },
  limitInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  limitHint: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 28,
  },
  carryoverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: spacing.radiusCard,
    paddingHorizontal: spacing.screenHPad,
    paddingVertical: 16,
    ...shadows.sm,
  },
  carryoverTextGroup: {
    flex: 1,
    marginRight: 16,
  },
  carryoverTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.navy,
  },
  carryoverDesc: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 2,
  },
  headerActionText: {
    color: colors.brand,
    fontSize: 17,
    fontWeight: '600',
  },
});
