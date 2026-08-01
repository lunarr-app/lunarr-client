import type { PlaybackSubtitleTrack } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { spacing, tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { Check, Subtitles } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TVFocusGuideView, View } from "react-native";

type Props = {
  tracks: PlaybackSubtitleTrack[];
  selectedTrackId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

export function TvSubtitleMenu({ tracks, selectedTrackId, onSelect, onClose }: Props) {
  const { scale } = useTVScale();
  const panelWidth = 440 * scale;
  const slide = useRef(new Animated.Value(panelWidth)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [slide, fade]);

  const panelStyle = {
    width: panelWidth,
    paddingTop: tvSafe.top * scale,
    paddingBottom: tvSafe.vertical * scale,
    paddingHorizontal: spacing.lg * scale,
    borderLeftWidth: Math.max(1, 1 * scale),
  };
  const panelHeaderStyle = { marginBottom: spacing.lg * scale, gap: spacing.md * scale };
  const panelTitleRowStyle = { gap: spacing.md * scale };
  const panelTitleStyle = { fontSize: typography.fontSize.heading * scale };
  const panelDividerStyle = { height: Math.max(1, 1 * scale) };
  const listContentStyle = { gap: spacing.sm * scale, paddingBottom: spacing.xl * scale };
  const subtitlesIconSize = Math.round(30 * scale);

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View style={[styles.backdrop, { opacity: fade }]} pointerEvents="box-none">
          <Pressable style={styles.backdropPressable} onPress={onClose} focusable={false} />
        </Animated.View>

        <Animated.View style={[styles.panel, panelStyle, { transform: [{ translateX: slide }] }]}>
          <View style={[styles.panelHeader, panelHeaderStyle]}>
            <View style={[styles.panelTitleRow, panelTitleRowStyle]}>
              <Subtitles color={darkColors.accent} size={subtitlesIconSize} />
              <Text style={[styles.panelTitle, panelTitleStyle]}>Subtitles</Text>
            </View>
            <View style={[styles.panelDivider, panelDividerStyle]} />
          </View>

          <TVFocusGuideView autoFocus style={styles.listGuide}>
            <ScrollView style={styles.list} contentContainerStyle={listContentStyle}>
              <SubtitleRow
                label="Off"
                selected={selectedTrackId === null}
                onPress={() => onSelect(null)}
                scale={scale}
              />
              {tracks.map((track) => (
                <SubtitleRow
                  key={track.id}
                  label={track.label}
                  selected={selectedTrackId === track.id}
                  onPress={() => onSelect(track.id)}
                  scale={scale}
                />
              ))}
            </ScrollView>
          </TVFocusGuideView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SubtitleRow({
  label,
  selected,
  onPress,
  scale,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  scale: number;
}) {
  const rowStyle = {
    gap: spacing.md * scale,
    minHeight: 76 * scale,
    paddingHorizontal: spacing.lg * scale,
    borderRadius: 10 * scale,
    borderWidth: Math.max(1, 2 * scale),
  };
  const rowTextStyle = { fontSize: typography.fontSize.title * scale };
  const checkSize = Math.round(26 * scale);
  const rowCheckSpacerStyle = { width: checkSize };

  return (
    <Pressable
      onPress={onPress}
      focusable
      style={({ focused }) => [styles.row, rowStyle, focused && styles.rowFocused]}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.rowText, rowTextStyle, selected && styles.rowTextSelected]} numberOfLines={1}>
        {label}
      </Text>
      {selected ? <Check color={darkColors.accent} size={checkSize} /> : <View style={rowCheckSpacerStyle} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  backdropPressable: {
    ...StyleSheet.absoluteFill,
  },
  panel: {
    height: "100%",
    backgroundColor: "rgba(10, 14, 18, 0.97)",
    borderLeftColor: darkColors.border,
  },
  panelHeader: {},
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  panelTitle: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
  panelDivider: {
    backgroundColor: darkColors.border,
  },
  listGuide: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(248, 250, 252, 0.04)",
    borderColor: "transparent",
  },
  rowFocused: {
    backgroundColor: darkColors.accentChipSoft,
    borderColor: darkColors.accent,
  },
  rowText: {
    flex: 1,
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
  rowTextSelected: {
    color: darkColors.accent,
    fontWeight: typography.fontWeight.semibold,
  },
});
