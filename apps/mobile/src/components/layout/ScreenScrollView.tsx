import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { KeyboardAvoidingView, Platform, RefreshControl, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets, type Edge } from "react-native-safe-area-context";

import { Screen } from "./Screen";

type Props = {
  children: ReactNode;
  edges?: Edge[];
  wrapScreen?: boolean;
  reserveBottomInset?: boolean;
  avoidKeyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ScreenScrollView({
  children,
  edges,
  wrapScreen = true,
  reserveBottomInset = false,
  avoidKeyboard = false,
  contentContainerStyle,
  refreshing,
  onRefresh,
}: Props) {
  const insets = useSafeAreaInsets();
  const refreshControl =
    onRefresh != null ? (
      <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} tintColor={darkColors.accent} />
    ) : undefined;

  const scroll = (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        reserveBottomInset
          ? { paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.lg }
          : { paddingBottom: spacing.lg },
        contentContainerStyle,
      ]}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={avoidKeyboard ? "interactive" : "none"}
      automaticallyAdjustKeyboardInsets={avoidKeyboard}
      showsVerticalScrollIndicator
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  );

  const body =
    avoidKeyboard && Platform.OS === "android" ? (
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {scroll}
      </KeyboardAvoidingView>
    ) : (
      scroll
    );

  if (!wrapScreen) return body;

  return (
    <Screen edges={edges} style={styles.screen}>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flex: 1 },
});
