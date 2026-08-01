import { darkColors } from "@/src/theme/colors";
import { tvSafe } from "@/src/theme/spacing";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "react-native-linear-gradient";

type Props = {
  title: string;
  children?: ReactNode;
};

export function TvPlayerOverlay({ title, children }: Props) {
  const { scale } = useTVScale();

  const topControlsStyle = { paddingTop: tvSafe.top * scale, paddingHorizontal: tvSafe.horizontal * scale };
  const titleBlockStyle = { paddingTop: 2 * scale };
  const eyebrowStyle = { fontSize: typography.fontSize.label * scale, letterSpacing: 0.6 * scale };
  const titleStyle = { fontSize: typography.fontSize.heading * scale };

  return (
    <View style={styles.controlsLayer} pointerEvents="box-none">
      <LinearGradient pointerEvents="none" colors={["rgba(0,0,0,0.7)", "transparent"]} style={styles.topGradient} />
      <LinearGradient pointerEvents="none" colors={["transparent", "rgba(0,0,0,0.85)"]} style={styles.bottomGradient} />

      <View style={[styles.topControls, topControlsStyle]}>
        <View style={titleBlockStyle}>
          <Text style={[styles.eyebrow, eyebrowStyle]}>Now playing</Text>
          <Text numberOfLines={1} style={[styles.title, titleStyle]}>
            {title}
          </Text>
        </View>
      </View>

      {children}
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
    height: "30%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  topControls: {
    zIndex: 2,
  },
  eyebrow: {
    color: "rgba(248, 250, 252, 0.7)",
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  title: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.semibold,
  },
});
