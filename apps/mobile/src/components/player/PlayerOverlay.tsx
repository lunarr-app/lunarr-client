import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { ArrowLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { EdgeInsets } from "react-native-safe-area-context";

const CONTROL_SIZE = 44;

const playerTheme = {
  text: darkColors.text,
  textMuted: "rgba(248, 250, 252, 0.7)",
  controlBg: "rgba(8, 12, 16, 0.58)",
  accent: "#f8fafc",
};

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  insets: EdgeInsets;
  topActions?: ReactNode;
  children?: ReactNode;
};

export function PlayerOverlay({ visible, title, onClose, insets, topActions, children }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.controlsLayer} pointerEvents="box-none">
      <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0.56)", "transparent"]} style={styles.topGradient} />
      <LinearGradient pointerEvents="none" colors={["transparent", "rgba(0,0,0,0.72)"]} style={styles.bottomGradient} />

      <View
        style={[
          styles.topControls,
          {
            paddingTop: insets.top + spacing.sm,
            paddingLeft: insets.left + spacing.md,
            paddingRight: insets.right + spacing.md,
          },
        ]}
      >
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.controlButton, pressed && styles.controlPressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={playerTheme.text} size={22} />
        </Pressable>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>Now playing</Text>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
        {topActions ?? <View style={styles.topSpacer} />}
      </View>

      <View
        style={[
          styles.bottomControls,
          {
            paddingBottom: insets.bottom + spacing.md,
            paddingLeft: insets.left + spacing.md,
            paddingRight: insets.right + spacing.md,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    zIndex: 3,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "34%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "42%",
  },
  topControls: {
    zIndex: 2,
    minHeight: 68,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  topSpacer: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  eyebrow: {
    color: playerTheme.textMuted,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    color: playerTheme.text,
    fontSize: typography.fontSize.heading,
    fontWeight: typography.fontWeight.bold,
  },
  bottomControls: {
    zIndex: 2,
    gap: spacing.sm,
  },
  controlButton: {
    width: CONTROL_SIZE,
    height: CONTROL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  controlPressed: {
    opacity: 0.82,
  },
});
