import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  Tabs: Object.assign(
    (props: any) => {
      const { View } = require('react-native');
      return <View>{props.screenOptions?.headerRight?.()}</View>;
    },
    {
      Screen: (_props: any) => null,
    },
  ),
  router: { push: (...args: any[]) => mockPush(...args) },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: (props: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${props.name}`}>{props.name}</Text>;
  },
}));

jest.mock('../src/components/TabBar', () => ({
  TabBar: () => null,
}));

import TabsLayout from '../app/(tabs)/_layout';
import * as Haptics from 'expo-haptics';

describe('HeaderPlusButton', () => {
  beforeEach(() => {
    mockPush.mockClear();
    (Haptics.impactAsync as jest.Mock).mockClear();
  });

  it('renders a plus icon', async () => {
    const { getByTestId } = await render(<TabsLayout />);
    expect(getByTestId('icon-plus')).toBeTruthy();
  });

  it('navigates to /add-expense and triggers haptics on press', async () => {
    const { getByTestId } = await render(<TabsLayout />);

    const plusIcon = getByTestId('icon-plus');
    await fireEvent.press(plusIcon.parent!);

    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(mockPush).toHaveBeenCalledWith('/add-expense');
  });
});
