import { useEffect, useRef, useState } from "react";

const CONTROLS_AUTO_HIDE_MS = 4000;

type Options = {
  isPlayingRef?: { current: boolean };
  onHide?: () => void;
};

export function useAutoHideControls({ isPlayingRef, onHide }: Options) {
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHideRef = useRef(onHide);

  useEffect(() => {
    onHideRef.current = onHide;
  });

  const showControls = () => {
    setControlsVisible(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      if (isPlayingRef?.current ?? true) {
        setControlsVisible(false);
        onHideRef.current?.();
      }
    }, CONTROLS_AUTO_HIDE_MS);
  };

  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  return { controlsVisible, setControlsVisible, showControls };
}
