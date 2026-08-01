import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View, type ViewStyle } from "react-native";

import { darkColors } from "@/src/theme/colors";
import { useTVScale } from "@/src/theme/tv-scale";

type Props = {
  value: number;
  maximumValue: number;
  trackColor?: string;
  fillColor?: string;
  thumbColor?: string;
  focusColor?: string;
  trackHeight?: number;
  thumbSize?: number;
  style?: ViewStyle;
  accessible?: boolean;
  accessibilityLabel?: string;
  popupText?: string;
  onFocusChange?: (focused: boolean) => void;
  requestFocus?: boolean;
};

export function TvSlider({
  value,
  maximumValue,
  trackColor = "rgba(248, 250, 252, 0.34)",
  fillColor = darkColors.accent,
  thumbColor = darkColors.accent,
  focusColor = darkColors.accent,
  trackHeight = 14,
  thumbSize = 24,
  style,
  accessible,
  accessibilityLabel,
  popupText,
  onFocusChange,
  requestFocus,
}: Props) {
  const { scale } = useTVScale();
  const layoutWidth = useRef(0);
  const [fillAnim] = useState(() => new Animated.Value(0));
  const [thumbX] = useState(() => new Animated.Value(0));
  const [focused, setFocused] = useState(false);
  const pressableRef = useRef<View>(null);

  const fraction = maximumValue > 0 ? Math.max(0, Math.min(value / maximumValue, 1)) : 0;

  useEffect(() => {
    if (layoutWidth.current > 0) {
      const x = fraction * layoutWidth.current;
      fillAnim.setValue(x);
      thumbX.setValue(x);
    }
  }, [fraction, fillAnim, thumbX]);

  const onFocus = () => {
    setFocused(true);
    onFocusChange?.(true);
  };

  const onBlur = () => {
    setFocused(false);
    onFocusChange?.(false);
  };

  useEffect(() => {
    if (requestFocus) {
      pressableRef.current?.focus();
    }
  }, [requestFocus]);

  const activeThumbSize = thumbSize + 8 * scale;

  return (
    <Pressable
      ref={pressableRef}
      focusable
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="adjustable"
      onFocus={onFocus}
      onBlur={onBlur}
      hasTVPreferredFocus={requestFocus}
      style={[{ height: thumbSize + 28 * scale, justifyContent: "center" }, style]}
    >
      <View
        onLayout={(e) => {
          layoutWidth.current = e.nativeEvent.layout.width;
          const x = fraction * layoutWidth.current;
          fillAnim.setValue(x);
          thumbX.setValue(x);
        }}
        style={{
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: trackColor,
          overflow: "visible",
          position: "relative",
        }}
      >
        {popupText && focused ? (
          <View
            style={{
              position: "absolute",
              bottom: trackHeight + 10 * scale,
              left: `${fraction * 100}%`,
              transform: [{ translateX: -24 * scale }],
              backgroundColor: "rgba(8, 12, 16, 0.92)",
              borderRadius: 6 * scale,
              paddingHorizontal: 12 * scale,
              paddingVertical: 6 * scale,
              minWidth: 60 * scale,
              alignItems: "center",
            }}
            pointerEvents="none"
          >
            <Text
              style={{
                color: darkColors.text,
                fontSize: 20 * scale,
                fontWeight: "600",
                fontVariant: ["tabular-nums"],
              }}
            >
              {popupText}
            </Text>
          </View>
        ) : null}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: fillAnim,
            backgroundColor: fillColor,
            borderRadius: trackHeight / 2,
          }}
        />
        {focused ? (
          <Animated.View
            style={{
              position: "absolute",
              top: (trackHeight - activeThumbSize) / 2,
              width: activeThumbSize,
              height: activeThumbSize,
              borderRadius: activeThumbSize / 2,
              backgroundColor: thumbColor,
              borderWidth: Math.max(1, 3 * scale),
              borderColor: focusColor,
              transform: [{ translateX: Animated.subtract(thumbX, activeThumbSize / 2) }],
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}
