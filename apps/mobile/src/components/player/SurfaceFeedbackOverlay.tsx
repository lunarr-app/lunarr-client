import { type SurfaceFeedback } from "@/src/lib/playback/controls";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { typography } from "@/src/theme/typography";
import { FastForward, Pause, Play, Rewind } from "lucide-react-native";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BUBBLE_SIZE = 80;
const BUBBLE_RADIUS = BUBBLE_SIZE / 2;

type Props = {
  feedback: SurfaceFeedback | null;
};

export function SurfaceFeedbackOverlay({ feedback }: Props) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.82);

  useEffect(() => {
    if (!feedback) return;
    opacity.value = 0;
    scale.value = 0.82;
    opacity.value = withSequence(
      withTiming(1, { duration: 112, easing: Easing.out(Easing.ease) }),
      withDelay(370, withTiming(0, { duration: 138, easing: Easing.in(Easing.ease) })),
    );
    scale.value = withSequence(
      withTiming(1, { duration: 112, easing: Easing.out(Easing.ease) }),
      withDelay(370, withTiming(1.18, { duration: 138, easing: Easing.in(Easing.ease) })),
    );
  }, [feedback, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!feedback) return null;

  return (
    <View pointerEvents="none" style={styles.layer}>
      <Animated.View
        style={[
          styles.bubble,
          feedback === "seek-backward" && styles.seekBackward,
          feedback === "seek-forward" && styles.seekForward,
          animatedStyle,
        ]}
      >
        {feedback === "seek-backward" ? (
          <>
            <Rewind color={darkColors.text} size={scaleNum(34)} />
            <Text style={styles.label}>10</Text>
          </>
        ) : feedback === "seek-forward" ? (
          <>
            <FastForward color={darkColors.text} size={scaleNum(34)} />
            <Text style={styles.label}>30</Text>
          </>
        ) : feedback === "pause" ? (
          <Pause color={darkColors.text} size={scaleNum(38)} fill={darkColors.text} />
        ) : (
          <Play color={darkColors.text} size={scaleNum(38)} fill={darkColors.text} />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 4,
  },
  bubble: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    marginLeft: -BUBBLE_RADIUS,
    marginTop: -BUBBLE_RADIUS,
    borderRadius: BUBBLE_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  },
  seekBackward: {
    left: "24%",
  },
  seekForward: {
    left: "76%",
  },
  label: {
    position: "absolute",
    bottom: 14,
    color: darkColors.text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    lineHeight: typography.lineHeight.tight,
  },
});
