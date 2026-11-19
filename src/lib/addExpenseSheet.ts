import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { RefObject } from 'react';

let sheetRef: RefObject<BottomSheetModal | null> | null = null;

export function registerAddExpenseSheet(ref: RefObject<BottomSheetModal | null> | null): void {
  sheetRef = ref;
}

export function presentAddExpenseSheet(): void {
  sheetRef?.current?.present();
}
