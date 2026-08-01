import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { radii, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { X } from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function FiltersDrawer({ visible, onClose, title = "Filters", subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.88, scaleNum(360));
  const translateX = useSharedValue(drawerWidth);
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateX.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    translateX.value = withTiming(drawerWidth, {
      duration: 200,
      easing: Easing.in(Easing.cubic),
    });
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [drawerWidth, translateX, visible]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (!mounted) {
    return null;
  }

  return (
    <Modal visible={mounted} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close filters"
          onPress={onClose}
          style={styles.backdrop}
        />
        <Animated.View
          style={[
            styles.drawer,
            drawerStyle,
            {
              width: drawerWidth,
              paddingTop: insets.top + spacing.md,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              onPress={onClose}
              style={styles.closeButton}
            >
              <X color={darkColors.muted} size={20} />
            </Pressable>
          </View>

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawer: {
    height: "100%",
    backgroundColor: darkColors.surfaceStrong,
    borderLeftWidth: 1,
    borderLeftColor: darkColors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    color: darkColors.text,
    fontSize: typography.fontSize.large,
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    color: darkColors.muted,
    fontSize: typography.fontSize.body,
    marginTop: spacing.xs,
  },
  closeButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: darkColors.border,
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
});
