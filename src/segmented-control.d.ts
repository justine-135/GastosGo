declare module '@react-native-segmented-control/segmented-control' {
  import type { NativeSyntheticEvent, ViewProps, ViewStyle } from 'react-native';

  export interface NativeSegmentedControlIOSChangeEvent {
    value: string;
    selectedSegmentIndex: number;
  }

  export type FontStyle = {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  };

  export interface SegmentedControlProps extends ViewProps {
    enabled?: boolean;
    momentary?: boolean;
    onChange?: (event: NativeSyntheticEvent<NativeSegmentedControlIOSChangeEvent>) => void;
    onValueChange?: (value: string) => void;
    selectedIndex?: number;
    tintColor?: string;
    backgroundColor?: string;
    values?: string[];
    appearance?: 'dark' | 'light';
    fontStyle?: FontStyle;
    activeFontStyle?: FontStyle;
    tabStyle?: ViewStyle;
    sliderStyle?: ViewStyle;
  }

  const SegmentedControl: React.FC<SegmentedControlProps>;
  export default SegmentedControl;
}
