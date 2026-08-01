import { Button } from "@/src/components/ui/Button";
import { darkColors } from "@/src/theme/colors";
import { StyleSheet, Text } from "react-native";

type SectionFeedbackProps = {
  error?: string;
  message?: string;
};

export function PreferenceSectionFeedback({ error, message }: SectionFeedbackProps) {
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (message) return <Text style={styles.success}>{message}</Text>;
  return null;
}

type SectionSaveButtonProps = {
  visible: boolean;
  saving: boolean;
  onPress: () => void;
};

export function PreferenceSectionSaveButton({ visible, saving, onPress }: SectionSaveButtonProps) {
  if (!visible) return null;
  return (
    <Button mode="contained" onPress={() => void onPress()} loading={saving} disabled={saving}>
      Save
    </Button>
  );
}

const styles = StyleSheet.create({
  error: { color: darkColors.error },
  success: { color: darkColors.accent },
});
