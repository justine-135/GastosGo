import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('expo-blur', () => ({
  BlurView: (props: any) => {
    const { View } = require('react-native');
    return <View {...props} />;
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: (props: any) => {
    const { Text } = require('react-native');
    return <Text testID={`icon-${props.name}`}>{props.name}</Text>;
  },
}));

import { TabBar } from '../src/components/TabBar';
import * as Haptics from 'expo-haptics';

function buildMockProps(activeIndex = 0) {
  const routes = [
    { key: 'index-key', name: 'index', params: undefined },
    { key: 'history-key', name: 'history', params: undefined },
    { key: 'budgets-key', name: 'budgets', params: undefined },
    { key: 'settings-key', name: 'settings', params: undefined },
  ];

  return {
    state: {
      index: activeIndex,
      routes,
      key: 'tab',
      routeNames: routes.map(r => r.name),
      stale: false as const,
      type: 'tab' as const,
      history: [],
    },
    descriptors: {},
    navigation: {} as any,
    navigateToTab: jest.fn(),
  };
}

describe('TabBar', () => {
  it('renders exactly four tabs', async () => {
    const props = buildMockProps();
    const { getByText, getAllByRole } = await render(<TabBar {...(props as any)} />);

    expect(getByText('Home')).toBeTruthy();
    expect(getByText('History')).toBeTruthy();
    expect(getByText('Budgets')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getAllByRole('tab')).toHaveLength(4);
  });

  it('does not render a FAB or fifth tab', async () => {
    const props = buildMockProps();
    const { getAllByRole } = await render(<TabBar {...(props as any)} />);

    expect(getAllByRole('tab')).toHaveLength(4);
  });

  it('calls navigateToTab with correct route key on press', async () => {
    const props = buildMockProps(0);
    const { getByText } = await render(<TabBar {...(props as any)} />);

    fireEvent.press(getByText('History'));

    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    expect(props.navigateToTab).toHaveBeenCalledWith('history-key');
  });

  it('marks the active tab as selected', async () => {
    const props = buildMockProps(2);
    const { getByLabelText } = await render(<TabBar {...(props as any)} />);

    const budgetsTab = getByLabelText('Budgets');
    expect(budgetsTab.props.accessibilityState).toEqual({ selected: true });

    const homeTab = getByLabelText('Home');
    expect(homeTab.props.accessibilityState).toEqual({ selected: false });
  });
});
