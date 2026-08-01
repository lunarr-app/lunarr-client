import { darkColors } from "@/src/theme/colors";
import { radii } from "@/src/theme/spacing";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const PULSE_MIN = 0.45;
const PULSE_MAX = 0.95;

const SkeletonPulseContext = createContext<SharedValue<number> | null>(null);

export function SkeletonProvider({ children }: { children: ReactNode }) {
  const pulse = useSharedValue(PULSE_MIN);

  useEffect(() => {
    const animation = withRepeat(withTiming(PULSE_MAX, { duration: 850, easing: Easing.inOut(Easing.ease) }), -1, true);
    pulse.value = animation;
    return () => cancelAnimation(pulse);
  }, [pulse]);

  return <SkeletonPulseContext.Provider value={pulse}>{children}</SkeletonPulseContext.Provider>;
}

type Props = {
  style?: StyleProp<ViewStyle>;
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
};

export function Skeleton({ style, width, height, borderRadius = radii.control }: Props) {
  const pulse = useContext(SkeletonPulseContext);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse ? pulse.value : PULSE_MIN,
  }));

  return <Animated.View style={[styles.block, { width, height, borderRadius }, style, animatedStyle]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: darkColors.card,
  },
});
