import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockShowActionSheet = jest.fn();

jest.mock('@expo/react-native-action-sheet', () => ({
  useActionSheet: () => ({ showActionSheetWithOptions: mockShowActionSheet }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => { return cb(); }, []);
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

jest.mock('../src/db', () => ({
  getDb: jest.fn(() => ({})),
}));

jest.mock('../src/db/expenses', () => ({
  listExpenses: jest.fn(() => [
    {
      id: 'exp-1',
      amount: 150,
      merchant: 'Coffee Shop',
      payment_method: 'Cash',
      date: '2026-11-25',
      category_id: 'cat-1',
    },
  ]),
  softDeleteExpense: jest.fn(),
}));

jest.mock('../src/db/categories', () => ({
  listCategories: jest.fn(() => [
    { id: 'cat-1', name: 'Food', icon: '🍔', color: '#FF6B35' },
  ]),
}));

jest.mock('../src/utils/fmtPeso', () => ({
  fmtPeso: (amount: number) => `₱${amount}`,
  todayStr: () => '2026-11-25',
}));

jest.mock('../src/utils/fmtDate', () => ({
  fmtDate: (dateStr: string) => dateStr,
}));

jest.mock('../src/utils/groupByDate', () => ({
  groupByDate: (expenses: any[]) => [{ date: '2026-11-25', expenses }],
}));

import HistoryScreen from '../app/(tabs)/history';
import { softDeleteExpense } from '../src/db/expenses';
import * as Haptics from 'expo-haptics';

describe('History action sheet', () => {
  beforeEach(() => {
    mockShowActionSheet.mockClear();
    (softDeleteExpense as jest.Mock).mockClear();
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('shows action sheet with correct options on expense press', async () => {
    const { getByText } = await render(<HistoryScreen />);

    fireEvent.press(getByText('Coffee Shop'));

    expect(mockShowActionSheet).toHaveBeenCalledTimes(1);

    const [sheetConfig] = mockShowActionSheet.mock.calls[0];
    expect(sheetConfig.options).toEqual(['Edit', 'Delete', 'Cancel']);
    expect(sheetConfig.destructiveButtonIndex).toBe(1);
    expect(sheetConfig.cancelButtonIndex).toBe(2);
    expect(sheetConfig.title).toContain('Coffee Shop');
    expect(sheetConfig.title).toContain('₱150');
  });

  it('calls softDeleteExpense when Delete is selected', async () => {
    const { getByText } = await render(<HistoryScreen />);

    fireEvent.press(getByText('Coffee Shop'));

    const callback = mockShowActionSheet.mock.calls[0][1];
    callback(1);

    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    expect(softDeleteExpense).toHaveBeenCalledWith({}, 'exp-1');
  });

  it('does nothing when Cancel is selected', async () => {
    const { getByText } = await render(<HistoryScreen />);

    fireEvent.press(getByText('Coffee Shop'));

    const callback = mockShowActionSheet.mock.calls[0][1];
    callback(2);

    expect(softDeleteExpense).not.toHaveBeenCalled();
  });
});
