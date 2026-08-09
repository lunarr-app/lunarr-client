import { MpvPlayerView, type MpvPlayerViewRef } from "@lunarr/player";
import { Ratio } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useTVEventHandler,
} from "react-native";

import { usePlaybackSession } from "@lunarr/core";
import { DEFAULT_SEGMENT_SKIP_PREFERENCES, resolvePlayableUri, type PlaybackDecision } from "@lunarr/core";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { tvSize, useTVScale } from "@/src/theme/tv-scale";
import { typography } from "@/src/theme/typography";
import type { PlaybackSegment, SegmentSkipPreferences } from "@lunarr/api";

import { ExternalSubtitleOverlay } from "./ExternalSubtitleOverlay";
import {
  CONTENT_FIT_LABELS,
  useAutoHideControls,
  useContentFit,
  usePlaybackSegments,
  useSeek,
  useSubtitleSelection,
  type ContentFit,
} from "./hooks";
import { TvPlayerControls } from "./TvPlayerControls";
import { TvPlayerOverlay } from "./TvPlayerOverlay";
import { TvSegmentSkipOverlay } from "./TvSegmentSkipOverlay";
import { TvSubtitleMenu } from "./TvSubtitleMenu";
import { absolutePlaybackSeconds, streamRelativePlaybackSeconds } from "./util";

const BUFFERING_UI_DELAY_MS = 300;

type Props = {
  title: string;
  playback: PlaybackDecision | null;
  startSeconds?: number;
  segments?: PlaybackSegment[];
  segmentSkip?: SegmentSkipPreferences;
  onProgress?: (
    positionSeconds: number,
    durationSeconds: number,
    options?: { flush?: boolean; completed?: boolean },
  ) => void;
};

export function TvVideoPlayer({
  title,
  playback,
  startSeconds = 0,
  segments = [],
  segmentSkip = DEFAULT_SEGMENT_SKIP_PREFERENCES,
  onProgress,
}: Props) {
  const { scale } = useTVScale();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(Math.max(0, startSeconds));
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sliderFocused, setSliderFocused] = useState(false);
  const [requestSliderFocus, setRequestSliderFocus] = useState(false);
  const [focusPlayButton, setFocusPlayButton] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const progressRef = useRef({ currentTime: Math.max(0, startSeconds), duration: 0 });
  const currentTimeRef = useRef(Math.max(0, startSeconds));
  const durationRef = useRef(0);
  const endedRef = useRef(false);
  const pausedRef = useRef(false);
  const bufferingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusTrapRef = useRef<View>(null);

  const streamStartSeconds = playback?.streamStartSeconds ?? 0;

  const toAbsoluteTime = (relativeSeconds: number) => absolutePlaybackSeconds({ relativeSeconds, streamStartSeconds });

  const toRelativeTime = (absoluteSeconds: number) =>
    streamRelativePlaybackSeconds({ absoluteSeconds, streamStartSeconds });

  const uri = playback ? resolvePlayableUri(playback) : "";

  usePlaybackSession(playback);

  const subtitleTracks = playback?.tracks ?? [];

  const playerRef = useRef<MpvPlayerViewRef>(null);
  const isPlayingRef = useRef(true);

  const { controlsVisible, setControlsVisible, showControls } = useAutoHideControls({
    isPlayingRef,
    onHide: () => {
      setRequestSliderFocus(false);
      setFocusPlayButton(false);
    },
  });

  const applyContentFit = (fit: ContentFit) => {
    void playerRef.current?.setZoomedToFill(fit !== "contain");
  };

  const { contentFit, zoomLabel, cycleContentFit } = useContentFit({
    showControls,
    onApply: applyContentFit,
  });

  const { selectedTrackId, selectedTrack, subtitleMenuOpen, setSubtitleMenuOpen, handleSubtitleSelect } =
    useSubtitleSelection({ tracks: subtitleTracks, showControls });

  const seekToRelative = (relativeSeconds: number) => {
    void playerRef.current?.seekTo(relativeSeconds);
  };

  const { seekDelta, showTimePopup, seekToSeconds, accumulateSeek, consumeSeekSettle } = useSeek({
    seekToRelative,
    toRelativeTime,
    currentTimeRef,
    durationRef,
    endedRef,
    setCurrentTime,
    showControls,
  });

  useEffect(() => {
    if (playback?.durationSeconds != null && playback.durationSeconds > 0) {
      const absolute = toAbsoluteTime(playback.durationSeconds);
      setDuration(absolute);
      durationRef.current = absolute;
    }
  }, [playback?.durationSeconds, toAbsoluteTime]);

  const handlePlaybackStateChange = (event: {
    nativeEvent: { isPaused?: boolean; isPlaying?: boolean; isLoading?: boolean; isReadyToSeek?: boolean };
  }) => {
    const { isPaused, isPlaying, isLoading } = event.nativeEvent;
    if (isPaused === true) {
      isPlayingRef.current = false;
      setBuffering(false);
      setIsPlaying(false);
      onProgress?.(progressRef.current.currentTime, progressRef.current.duration, { flush: true });
    } else if (isPlaying === true) {
      isPlayingRef.current = true;
      endedRef.current = false;
      pausedRef.current = false;
      setBuffering(false);
      setIsPlaying(true);
      showControls();
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
    }
    if (isLoading === true) {
      if (!pausedRef.current && !bufferingTimeoutRef.current) {
        bufferingTimeoutRef.current = setTimeout(() => {
          bufferingTimeoutRef.current = null;
          if (!pausedRef.current) {
            setBuffering(true);
          }
        }, BUFFERING_UI_DELAY_MS);
      }
    } else if (isLoading === false) {
      // Loading finished — cancel any pending buffering timer and clear the
      // indicator. Without this, buffering only clears on an explicit
      // play/pause event, which a slow (e.g. software-decoded) stream may
      // never emit cleanly, leaving the spinner up forever.
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
        bufferingTimeoutRef.current = null;
      }
      setBuffering(false);
    }
  };

  const handleProgress = (event: { nativeEvent: { position: number; duration: number } }) => {
    const absolute = toAbsoluteTime(Math.floor(event.nativeEvent.position));
    currentTimeRef.current = absolute;

    // Position advancing means playback is live again — clear any buffering
    // indicator in case the native isLoading signal was missed.
    if (buffering) {
      setBuffering(false);
    }

    if (event.nativeEvent.duration > 0) {
      const absDuration = toAbsoluteTime(Math.floor(event.nativeEvent.duration));
      if (absDuration !== durationRef.current) {
        durationRef.current = absDuration;
        setDuration(absDuration);
      }
    }

    if (!consumeSeekSettle(absolute)) {
      return;
    }

    setCurrentTime(absolute);
    progressRef.current = { currentTime: absolute, duration: durationRef.current };
    onProgress?.(absolute, durationRef.current);
  };

  const handleLoad = () => {
    if (startSeconds > 0) {
      void playerRef.current?.seekTo(toRelativeTime(startSeconds));
    }
    isPlayingRef.current = true;
    setError(null);
    void playerRef.current?.play();
  };

  const handleError = (event: { nativeEvent: { error: string } }) => {
    setError(event.nativeEvent.error ?? "Playback error");
  };

  const handleEnd = () => {
    endedRef.current = true;
    pausedRef.current = true;
    isPlayingRef.current = false;
    setIsPlaying(false);
    setControlsVisible(true);
    onProgress?.(currentTimeRef.current, durationRef.current, { flush: true, completed: true });
  };

  const playerReady = duration > 0 || isPlaying;
  const { activeSegment, autoSkipNotice, skipActiveSegment } = usePlaybackSegments({
    segments,
    segmentSkip,
    displayedSeconds: currentTime,
    durationSeconds: duration,
    playerReady,
    mediaItemId: playback?.mediaFileId ?? "",
    seekToSeconds,
  });

  const segmentSkipLabel = activeSegment && !segmentSkip.automatic ? activeSegment.label : null;

  const bufferingOverlayStyle = { gap: spacing.md * scale };
  const bufferingTextStyle = { fontSize: typography.fontSize.title * scale };
  const errorTextStyle = { fontSize: typography.fontSize.title * scale, paddingHorizontal: spacing.md * scale };
  const zoomLabelOverlayStyle = { transform: [{ translateY: -22 * scale }] };
  const zoomLabelBadgeStyle = {
    gap: spacing.md * scale,
    paddingHorizontal: spacing.xl * scale,
    paddingVertical: spacing.md * scale,
    borderRadius: tvSize(999, scale),
  };
  const zoomLabelTextStyle = { fontSize: typography.fontSize.title * scale };
  const ratioIconSize = Math.round(28 * scale);

  useEffect(() => {
    if (requestSliderFocus && sliderFocused) {
      setRequestSliderFocus(false);
    }
  }, [requestSliderFocus, sliderFocused]);

  useEffect(() => {
    if (Platform.OS === "android" && !controlsVisible) {
      focusTrapRef.current?.focus();
    }
  }, [controlsVisible]);

  useEffect(() => {
    return () => {
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      void playerRef.current?.destroy();
    };
  }, []);

  const togglePlay = () => {
    if (endedRef.current) {
      endedRef.current = false;
      pausedRef.current = false;
      seekToSeconds(0);
      void playerRef.current?.play();
    } else if (isPlayingRef.current) {
      pausedRef.current = true;
      isPlayingRef.current = false;
      void playerRef.current?.pause();
    } else {
      pausedRef.current = false;
      isPlayingRef.current = true;
      void playerRef.current?.play();
    }
    showControls();
  };

  useTVEventHandler((event) => {
    if (subtitleMenuOpen) {
      if (event.eventType === "menu" || event.eventType === "back") {
        setSubtitleMenuOpen(false);
      }
      return;
    }

    if (event.eventType === "playPause") {
      togglePlay();
      return;
    }

    if (!controlsVisible) {
      if (segmentSkipLabel && event.eventType === "select") {
        skipActiveSegment();
        return;
      }
      showControls();
      if (event.eventType === "left" || event.eventType === "right") {
        setRequestSliderFocus(true);
        setFocusPlayButton(false);
      }
      if (event.eventType === "up" || event.eventType === "down") {
        setFocusPlayButton(true);
        setRequestSliderFocus(false);
      }
      return;
    }

    showControls();

    if (sliderFocused) {
      if (event.eventType === "left") {
        accumulateSeek(-10);
        return;
      }
      if (event.eventType === "right") {
        accumulateSeek(10);
        return;
      }
    }
  });

  if (!playback) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.center}>
          <ActivityIndicator color={darkColors.accent} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <MpvPlayerView
        ref={playerRef}
        style={styles.video}
        source={uri ? { url: uri, startPosition: toRelativeTime(startSeconds), autoplay: true } : undefined}
        onLoad={handleLoad}
        onPlaybackStateChange={handlePlaybackStateChange}
        onProgress={handleProgress}
        onError={handleError}
        onEnd={handleEnd}
      />

      {Platform.OS === "android" ? (
        <Pressable ref={focusTrapRef} focusable={!controlsVisible} pointerEvents="none" style={styles.focusTrap} />
      ) : null}

      {controlsVisible ? (
        <TvPlayerOverlay title={title}>
          <TvPlayerControls
            currentTime={currentTime}
            seekDelta={seekDelta}
            duration={duration}
            showTimePopup={showTimePopup}
            requestSliderFocus={requestSliderFocus}
            onSliderFocusChange={setSliderFocused}
            isPlaying={isPlaying}
            focusPlayButton={focusPlayButton}
            onTogglePlay={togglePlay}
            hasSubtitles={subtitleTracks.length > 0}
            subtitlesActive={selectedTrackId != null}
            onToggleSubtitleMenu={() => setSubtitleMenuOpen((prev) => !prev)}
            zoomLabel={CONTENT_FIT_LABELS[contentFit]}
            zoomActive={contentFit !== "contain"}
            onCycleZoom={cycleContentFit}
          />
        </TvPlayerOverlay>
      ) : null}

      {buffering ? (
        <View style={[styles.bufferingOverlay, bufferingOverlayStyle]} pointerEvents="none">
          <ActivityIndicator size="large" color={darkColors.accent} />
          <Text style={[styles.bufferingText, bufferingTextStyle]}>Buffering</Text>
        </View>
      ) : null}

      <TvSegmentSkipOverlay skipLabel={segmentSkipLabel} notice={autoSkipNotice} onSkip={skipActiveSegment} />

      {subtitleMenuOpen ? (
        <TvSubtitleMenu
          tracks={subtitleTracks}
          selectedTrackId={selectedTrackId}
          onSelect={handleSubtitleSelect}
          onClose={() => setSubtitleMenuOpen(false)}
        />
      ) : null}

      <ExternalSubtitleOverlay
        track={selectedTrack}
        currentTimeSeconds={currentTime}
        controlsVisible={controlsVisible}
      />

      {error ? (
        <View style={styles.errorOverlay} pointerEvents="none">
          <Text style={[styles.errorText, errorTextStyle]}>{error}</Text>
        </View>
      ) : null}

      {zoomLabel ? (
        <View style={[styles.zoomLabelOverlay, zoomLabelOverlayStyle]} pointerEvents="none">
          <View style={[styles.zoomLabelBadge, zoomLabelBadgeStyle]}>
            <Ratio color={darkColors.text} size={ratioIconSize} />
            <Text style={[styles.zoomLabelText, zoomLabelTextStyle]}>{zoomLabel}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  video: {
    flex: 1,
    backgroundColor: "#000",
  },
  focusTrap: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 4,
  },
  bufferingText: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.overlay,
    zIndex: 4,
  },
  errorText: {
    color: darkColors.error,
    fontWeight: typography.fontWeight.medium,
    textAlign: "center",
  },
  zoomLabelOverlay: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    zIndex: 6,
  },
  zoomLabelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
  zoomLabelText: {
    color: darkColors.text,
    fontWeight: typography.fontWeight.medium,
  },
});
