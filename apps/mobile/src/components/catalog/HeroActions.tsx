import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { scaleNum } from "@/src/theme/scale";
import { compactControlHeight, spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

export type HeroAction = {
  key: string;
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  mode?: "contained" | "outlined";
};

type Props = {
  primary?: HeroAction;
  secondary?: HeroAction[];
};

const iconColor = (mode: "contained" | "outlined") => (mode === "contained" ? darkColors.buttonText : darkColors.text);

const SECONDARY_ICON_SIZE = scaleNum(16);

function renderIcon(Icon: LucideIcon | undefined, mode: "contained" | "outlined", size: number) {
  if (!Icon) return undefined;
  return () => <Icon color={iconColor(mode)} size={size} strokeWidth={2.25} />;
}

export function HeroActions({ primary, secondary = [] }: Props) {
  if (!primary && secondary.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {primary ? (
        <Button
          block
          mode="contained"
          onPress={primary.onPress}
          icon={renderIcon(primary.icon, "contained", scaleNum(20))}
          style={styles.primary}
        >
          {primary.label}
        </Button>
      ) : null}
      {secondary.length > 0 ? (
        <View style={styles.secondaryRow}>
          {secondary.map((action) => (
            <Button
              key={action.key}
              compact
              block
              mode={action.mode ?? "outlined"}
              onPress={action.onPress}
              icon={renderIcon(action.icon, action.mode ?? "outlined", SECONDARY_ICON_SIZE)}
              style={styles.secondary}
              labelStyle={styles.secondaryLabel}
            >
              {action.label}
            </Button>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  primary: {
    minHeight: compactControlHeight + 6,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondary: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
  },
  secondaryLabel: {
    fontSize: typography.fontSize.meta,
  },
});
