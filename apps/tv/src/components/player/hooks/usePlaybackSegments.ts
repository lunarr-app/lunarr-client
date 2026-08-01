import type { PlaybackSegment, SegmentSkipPreferences } from "@lunarr/api";
import {
  activePlaybackSegment,
  playbackSegmentKey,
  SEGMENT_LABELS,
  segmentSkipTargetSeconds,
} from "@/src/lib/playback/segments";
import { useEffect, useRef, useState } from "react";

const OVERLAY_DISMISS_MS = 3500;

type UsePlaybackSegmentsInput = {
  segments: PlaybackSegment[];
  segmentSkip: SegmentSkipPreferences;
  displayedSeconds: number;
  durationSeconds: number;
  playerReady: boolean;
  mediaItemId: string;
  seekToSeconds: (targetSeconds: number) => void;
};

export function usePlaybackSegments({
  segments,
  segmentSkip,
  displayedSeconds,
  durationSeconds,
  playerReady,
  mediaItemId,
  seekToSeconds,
}: UsePlaybackSegmentsInput) {
  const autoSkippedSegmentKeysRef = useRef(new Set<string>());
  const autoSkipNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [autoSkipNotice, setAutoSkipNotice] = useState<string | null>(null);

  const clearAutoSkipNotice = () => {
    setAutoSkipNotice(null);
    if (autoSkipNoticeTimeoutRef.current) {
      clearTimeout(autoSkipNoticeTimeoutRef.current);
      autoSkipNoticeTimeoutRef.current = null;
    }
  };

  const showAutoSkipNotice = (message: string) => {
    setAutoSkipNotice(message);
    if (autoSkipNoticeTimeoutRef.current) {
      clearTimeout(autoSkipNoticeTimeoutRef.current);
    }
    autoSkipNoticeTimeoutRef.current = setTimeout(() => {
      setAutoSkipNotice(null);
      autoSkipNoticeTimeoutRef.current = null;
    }, OVERLAY_DISMISS_MS);
  };

  const activeSegment = segmentSkip.enabled ? activePlaybackSegment(segments, displayedSeconds, durationSeconds) : null;

  const skipActiveSegment = () => {
    if (!activeSegment) return;
    seekToSeconds(segmentSkipTargetSeconds(activeSegment, durationSeconds));
  };

  useEffect(() => {
    autoSkippedSegmentKeysRef.current = new Set();
    clearAutoSkipNotice();
  }, [clearAutoSkipNotice, mediaItemId]);

  useEffect(() => {
    if (!segmentSkip.enabled || !segmentSkip.automatic || !playerReady || !activeSegment) return;

    const key = playbackSegmentKey(activeSegment);
    if (autoSkippedSegmentKeysRef.current.has(key)) return;

    autoSkippedSegmentKeysRef.current.add(key);
    showAutoSkipNotice(SEGMENT_LABELS[activeSegment.type].skipped);
    seekToSeconds(segmentSkipTargetSeconds(activeSegment, durationSeconds));
  }, [
    activeSegment,
    durationSeconds,
    playerReady,
    seekToSeconds,
    segmentSkip.automatic,
    segmentSkip.enabled,
    showAutoSkipNotice,
  ]);

  useEffect(() => () => clearAutoSkipNotice(), [clearAutoSkipNotice]);

  return {
    activeSegment,
    autoSkipNotice,
    skipActiveSegment,
  };
}
