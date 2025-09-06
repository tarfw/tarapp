import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { onPressIn, ...rest } = props;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      {...rest}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}
