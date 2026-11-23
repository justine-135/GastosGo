import { StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/shadows';

export const styles = StyleSheet.create({
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray2,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.52,
    marginBottom: 6,
  },
  inputWrap: {
    backgroundColor: colors.grayLight,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapFocused: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.brand,
  },
  amountPrefix: {
    fontSize: 20,
    fontWeight: '300',
    color: colors.gray,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: colors.navy,
    fontVariant: ['tabular-nums'],
    padding: 0,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.navy,
    padding: 0,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.navy,
  },
  categoryPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.gray2,
  },
  segmentContainer: {
    backgroundColor: colors.grayLight,
    borderRadius: 10,
    padding: 2,
    flexDirection: 'row',
    gap: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#fff',
    ...shadows.sm,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray,
  },
  segmentTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
  },
  dayScrollRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.brand,
  },
  dayChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.navy,
  },
  dayChipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.38,
  },
  saveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  dangerButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.red,
  },
  pauseText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.amber,
  },
  slideViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  slideTrack: {
    flexDirection: 'row',
  },
  slidePage: {
    width: '100%',
  },
  categoryPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  categoryPickerHeaderTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.navy,
    marginLeft: 10,
  },
  categoryPickerList: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  categoryPickerSeparator: {
    height: 1,
    backgroundColor: colors.grayLight,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  categoryPickerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPickerEmoji: {
    fontSize: 18,
  },
  categoryPickerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.navy,
  },
});
