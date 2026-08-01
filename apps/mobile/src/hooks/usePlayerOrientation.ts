import * as Orientation from "expo-screen-orientation";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";

export function usePlayerOrientation() {
  const { width, height } = useWindowDimensions();
  const [fullscreen, setFullscreen] = useState(width > height);

  useEffect(() => {
    setFullscreen(width > height);
  }, [width, height]);

  const toggleFullscreen = async () => {
    if (fullscreen) {
      await Orientation.unlockAsync();
      setFullscreen(false);
    } else {
      await Orientation.lockAsync(Orientation.OrientationLock.LANDSCAPE);
      setFullscreen(true);
    }
  };

  useEffect(() => {
    return () => {
      void Orientation.unlockAsync().catch(() => undefined);
    };
  }, []);

  return { fullscreen, toggleFullscreen };
}
