import type { VideoPlayer } from "expo-video";
import { useEffect, useRef, useState } from "react";

const SEEK_DEBOUNCE_MS = 600;
const SEEK_SETTLE_TOLERANCE_SECONDS = 2;
const SEEK_SETTLE_TIMEOUT_MS = 3000;

type Options = {
  player: VideoPlayer;
  toRelativeTime: (absoluteSeconds: number) => number;
  currentTimeRef: { current: number };
  durationRef: { current: number };
  endedRef: { current: boolean };
  setCurrentTime: (value: number) => void;
  showControls: () => void;
};

export function useSeek({
  player,
  toRelativeTime,
  currentTimeRef,
  durationRef,
  endedRef,
  setCurrentTime,
  showControls,
}: Options) {
  const [seekDelta, setSeekDelta] = useState(0);
  const [showTimePopup, setShowTimePopup] = useState(false);
  const seekDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekAccumulatorRef = useRef(0);
  const seekTargetRef = useRef<number | null>(null);
  const seekSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef(player);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const armSeekSettle = (targetSeconds: number) => {
    seekTargetRef.current = targetSeconds;
    if (seekSettleTimeoutRef.current) {
      clearTimeout(seekSettleTimeoutRef.current);
    }
    seekSettleTimeoutRef.current = setTimeout(() => {
      seekTargetRef.current = null;
      seekSettleTimeoutRef.current = null;
    }, SEEK_SETTLE_TIMEOUT_MS);
  };

  const clearSeekSettle = () => {
    seekTargetRef.current = null;
    if (seekSettleTimeoutRef.current) {
      clearTimeout(seekSettleTimeoutRef.current);
      seekSettleTimeoutRef.current = null;
    }
  };

  const seekToSeconds = (targetSeconds: number) => {
    const relativeSeconds = toRelativeTime(targetSeconds);
    playerRef.current.currentTime = relativeSeconds;
    armSeekSettle(targetSeconds);
    setCurrentTime(targetSeconds);
    currentTimeRef.current = targetSeconds;
  };

  const commitSeek = (delta: number) => {
    if (delta === 0) return;
    const nextAbsolute = Math.max(
      0,
      Math.min(currentTimeRef.current + delta, durationRef.current || Number.MAX_SAFE_INTEGER),
    );
    playerRef.current.currentTime = toRelativeTime(nextAbsolute);
    armSeekSettle(nextAbsolute);
    setCurrentTime(nextAbsolute);
    currentTimeRef.current = nextAbsolute;
    endedRef.current = false;
    seekAccumulatorRef.current = 0;
    setSeekDelta(0);
    setShowTimePopup(false);
    showControls();
  };

  const scheduleCommitSeek = (delta: number) => {
    if (seekDebounceRef.current) {
      clearTimeout(seekDebounceRef.current);
    }
    seekDebounceRef.current = setTimeout(() => {
      commitSeek(delta);
    }, SEEK_DEBOUNCE_MS);
  };

  const accumulateSeek = (step: number) => {
    seekAccumulatorRef.current += step;
    setSeekDelta(seekAccumulatorRef.current);
    scheduleCommitSeek(seekAccumulatorRef.current);
    setShowTimePopup(true);
  };

  const consumeSeekSettle = (absoluteSeconds: number) => {
    const target = seekTargetRef.current;
    if (target !== null) {
      if (Math.abs(absoluteSeconds - target) > SEEK_SETTLE_TOLERANCE_SECONDS) {
        return false;
      }
      clearSeekSettle();
    }
    return true;
  };

  useEffect(() => {
    return () => {
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }
      if (seekSettleTimeoutRef.current) {
        clearTimeout(seekSettleTimeoutRef.current);
      }
    };
  }, []);

  return { seekDelta, showTimePopup, seekToSeconds, accumulateSeek, consumeSeekSettle };
}
