import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/**
 * Simple cross-platform hook that reports whether the soft keyboard is
 * currently visible. Useful for TV auth forms where the Android TV keyboard
 * can cover the focused input; consumers can lift the form when open.
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}
