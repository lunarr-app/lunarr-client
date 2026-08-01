import type { PlaybackSegment, SegmentSkipPreferences } from "@lunarr/api";
import { PLAYER_OVERLAY_DISMISS_MS } from "@/src/lib/playback/controls";
import { activePlaybackSegment, playbackSegmentKey, SEGMENT_LABELS, segmentSkipTargetSeconds } from "@lunarr/core";
import { useEffect, useRef, useState } from "react";

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
    }, PLAYER_OVERLAY_DISMISS_MS);
  };

  const activeSegment = !segmentSkip.enabled
    ? null
    : activePlaybackSegment(segments, displayedSeconds, durationSeconds);

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

    autoSkippedSegmentKeysRef.current = new Set([...autoSkippedSegmentKeysRef.current, key]);
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
