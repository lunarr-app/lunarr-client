import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import { StyleSheet, Text } from "react-native";

type SectionFeedbackProps = {
  error?: string;
  message?: string;
};

export function PreferenceSectionFeedback({ error, message }: SectionFeedbackProps) {
  const { scale } = useTVScale();
  const textStyle = { fontSize: typography.fontSize.body * scale, lineHeight: typography.lineHeight.normal * scale };
  if (error) return <Text style={[styles.error, textStyle]}>{error}</Text>;
  if (message) return <Text style={[styles.success, textStyle]}>{message}</Text>;
  return null;
}

type SectionSaveButtonProps = {
  dirty?: boolean;
  saving?: boolean;
  onPress: () => void;
};

export function PreferenceSectionSaveButton({ dirty = false, saving = false, onPress }: SectionSaveButtonProps) {
  return (
    <Button mode="contained" onPress={() => void onPress()} loading={saving} disabled={!dirty || saving}>
      Save
    </Button>
  );
}

const styles = StyleSheet.create({
  error: {
    color: darkColors.error,
  },
  success: {
    color: darkColors.accent,
  },
});
