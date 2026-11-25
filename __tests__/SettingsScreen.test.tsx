import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: (...args: any[]) => mockPush(...args) },
  useFocusEffect: (cb: () => (() => void) | void) => {
    const { useEffect } = require('react');
    useEffect(() => { return cb(); }, []);
  },
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: any) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: (props: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${props.name}`}>{props.name}</Text>;
  },
}));

jest.mock('../src/db', () => ({
  getDb: jest.fn(() => ({})),
}));

jest.mock('../src/db/settings', () => ({
  loadSettings: jest.fn(() => ({ incomeMode: 'salary', budgetCycleDay: 15 })),
  IncomeMode: {},
}));

import SettingsScreen from '../app/(tabs)/settings';

describe('SettingsScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders all three section headers', async () => {
    const { getByText } = await render(<SettingsScreen />);

    expect(getByText('Income & Budget')).toBeTruthy();
    expect(getByText('Data')).toBeTruthy();
    expect(getByText('Upcoming')).toBeTruthy();
  });

  it('renders Income & Budget section with two rows', async () => {
    const { getByText } = await render(<SettingsScreen />);

    expect(getByText('Income Mode')).toBeTruthy();
    expect(getByText('Salary')).toBeTruthy();
    expect(getByText('Budget Cycle')).toBeTruthy();
    expect(getByText('Day 15')).toBeTruthy();
  });

  it('renders Data section with three rows', async () => {
    const { getByText } = await render(<SettingsScreen />);

    expect(getByText('Recurring Rules')).toBeTruthy();
    expect(getByText('Reset Current Cycle')).toBeTruthy();
    expect(getByText('Recently Deleted')).toBeTruthy();
  });

  it('renders Upcoming section with one row', async () => {
    const { getByText } = await render(<SettingsScreen />);

    expect(getByText('PIN & Biometric Lock')).toBeTruthy();
    expect(getByText('SOON')).toBeTruthy();
  });

  it('navigates to correct route on row press', async () => {
    const { getByText } = await render(<SettingsScreen />);

    await fireEvent.press(getByText('Income Mode'));
    expect(mockPush).toHaveBeenCalledWith('/settings/income-mode');

    await fireEvent.press(getByText('Budget Cycle'));
    expect(mockPush).toHaveBeenCalledWith('/settings/budget-cycle');

    await fireEvent.press(getByText('Recurring Rules'));
    expect(mockPush).toHaveBeenCalledWith('/recurring-rules');

    await fireEvent.press(getByText('Reset Current Cycle'));
    expect(mockPush).toHaveBeenCalledWith('/settings/reset-cycle');

    await fireEvent.press(getByText('Recently Deleted'));
    expect(mockPush).toHaveBeenCalledWith('/settings/recently-deleted');
  });
});
