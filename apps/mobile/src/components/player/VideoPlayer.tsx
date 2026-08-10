import { ExternalSubtitleOverlay } from "@/src/components/player/ExternalSubtitleOverlay";
import { PlayerControls } from "@/src/components/player/PlayerControls";
import { PlayerOverlay } from "@/src/components/player/PlayerOverlay";
import { PlayerTopControls } from "@/src/components/player/PlayerTopControls";
import { SegmentSkipOverlay } from "@/src/components/player/SegmentSkipOverlay";
import { SurfaceFeedbackOverlay } from "@/src/components/player/SurfaceFeedbackOverlay";
import { usePlayerOrientation } from "@/src/hooks/usePlayerOrientation";
import { usePlaybackSegments } from "@/src/hooks/usePlaybackSegments";
import type { PlaybackSegment, SegmentSkipPreferences } from "@lunarr/api";
import {
  SURFACE_FEEDBACK_DURATION_MS,
  SURFACE_SINGLE_CLICK_DELAY_MS,
  playerSurfaceClickAction,
  type SurfaceFeedback,
} from "@/src/lib/playback/controls";
import {
  BUFFERING_UI_DELAY_MS,
  CONTROLS_AUTO_HIDE_MS,
  DEFAULT_SEGMENT_SKIP_PREFERENCES,
  isStreamRelativePlaybackMode,
  playbackUiStateAfterProgress,
  playerStatusOverlayMessage,
  playerStatusOverlayState,
  primaryPlaybackButtonState,
  resolveMediaUri,
  shouldShowCustomControls,
  uiStateAfterSeek,
  usePlaybackSession,
  type PlaybackDecision,
  type PlayerControlUiState,
} from "@lunarr/core";
import { MpvPlayerView, type MpvPlayerViewRef } from "@lunarr/mpv-player";
import { darkColors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ActivityIndicator,
  AppState,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { absolutePlaybackDuration, absolutePlaybackSeconds, streamRelativePlaybackSeconds } from "./util";

const SKIP_BACK_SECONDS = 10;
const SKIP_FORWARD_SECONDS = 30;
const SEEK_SETTLE_TOLERANCE_SECONDS = 2;
const SEEK_BY_SETTLE_TOLERANCE_SECONDS = 5;
const SEEK_SETTLE_TIMEOUT_MS = 3000;

type ContentFit = "contain" | "cover";
const CONTENT_FIT_CYCLE: ContentFit[] = ["contain", "cover"];

type PlayerState = {
  play: boolean;
  controls: boolean;
  currentTime: number;
  slidingCurrentTime: number | null;
  duration: number;
  ended: boolean;
  error: string | null;
  uiState: PlayerControlUiState;
};

type Props = {
  title: string;
  playback: PlaybackDecision | null;
  startSeconds?: number;
  mediaItemId: string;
  segments?: PlaybackSegment[];
  segmentSkip?: SegmentSkipPreferences;
  onClose: () => void;
  onProgress?: (
    positionSeconds: number,
    durationSeconds: number,
    options?: { flush?: boolean; completed?: boolean; ended?: boolean },
  ) => void;
};

function getUiState(state: PlayerState): PlayerControlUiState {
  if (state.error) return "error";
  return state.uiState;
}

export function VideoPlayer({
  title,
  playback,
  startSeconds = 0,
  mediaItemId,
  segments = [],
  segmentSkip = DEFAULT_SEGMENT_SKIP_PREFERENCES,
  onClose,
  onProgress,
}: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const stateRef = useRef<PlayerState | null>(null);
  const onProgressRef = useRef(onProgress);
  const playerRef = useRef<MpvPlayerViewRef>(null);
  const pictureInPictureActiveRef = useRef(false);
  const initialSeekAppliedRef = useRef(false);
  const surfaceSingleClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const surfaceFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapTimeRef = useRef(0);
  const playbackRateRef = useRef(1);
  const bufferingUiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seekTargetRef = useRef<number | null>(null);
  const seekToleranceRef = useRef(SEEK_SETTLE_TOLERANCE_SECONDS);
  const seekSettleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [controlsActivityTick, setControlsActivityTick] = useState(0);
  const subtitleTracks = playback?.tracks ?? [];
  const [selectedSubtitleId, setSelectedSubtitleId] = useState(() =>
    subtitleTracks.length > 0 ? (subtitleTracks.find((track) => track.default)?.id ?? "off") : "off",
  );
  const [subtitleMenuOpen, setSubtitleMenuOpen] = useState(false);
  const [surfaceFeedback, setSurfaceFeedback] = useState<SurfaceFeedback | null>(null);
  const [contentFit, setContentFit] = useState<ContentFit>("contain");
  const [state, setState] = useReducer(
    (current: PlayerState, next: Partial<PlayerState>) => ({
      ...current,
      ...next,
    }),
    { startSeconds, playback },
    ({ startSeconds: resumeSeconds, playback: initialPlayback }): PlayerState => ({
      play: true,
      controls: true,
      currentTime: Math.max(0, Math.floor(resumeSeconds)),
      slidingCurrentTime: null,
      duration:
        initialPlayback?.durationSeconds != null && initialPlayback.durationSeconds > 0
          ? initialPlayback.durationSeconds
          : 0,
      ended: false,
      error: null,
      uiState: "playing",
    }),
  );

  useEffect(() => {
    stateRef.current = state;
    onProgressRef.current = onProgress;
  });

  const uiState = getUiState(state);
  const statusOverlay = playerStatusOverlayState(uiState);
  const customControlsVisible = shouldShowCustomControls({
    controlsVisible: state.controls,
    uiState,
    subtitleMenuOpen,
  });

  usePlaybackSession(playback);
  const { fullscreen, toggleFullscreen } = usePlayerOrientation();

  const streamStartSeconds = playback?.streamStartSeconds ?? 0;
  const usesStreamRelativeTimeline = isStreamRelativePlaybackMode(playback?.mode);
  const uri = playback?.streamUrl ? resolveMediaUri(playback.streamUrl) : "";

  const toAbsoluteTime = (relativeSeconds: number) =>
    usesStreamRelativeTimeline
      ? absolutePlaybackSeconds({
          relativeSeconds,
          streamStartSeconds,
        })
      : relativeSeconds;

  const toRelativeTime = (absoluteSecondsValue: number) =>
    usesStreamRelativeTimeline
      ? streamRelativePlaybackSeconds({
          absoluteSeconds: absoluteSecondsValue,
          streamStartSeconds,
        })
      : absoluteSecondsValue;

  const syncPlayStateFromPlayer = (isPlaying: boolean) => {
    const current = stateRef.current;
    if (!current || current.uiState === "error") return;
    if (current.play === isPlaying) return;

    if (current.uiState === "buffering" || current.uiState === "seeking") {
      return;
    }

    let nextUiState: PlayerControlUiState;
    if (isPlaying) {
      nextUiState = "playing";
    } else {
      nextUiState = "paused";
    }

    setState({
      play: isPlaying,
      uiState: nextUiState,
      ...(!isPlaying ? { controls: true } : {}),
      ...(isPlaying && current.ended ? { ended: false } : {}),
    });

    if (!isPlaying) {
      setControlsActivityTick((tick) => (Number.isFinite(tick) ? tick + 1 : 1));
      onProgressRef.current?.(current.slidingCurrentTime ?? current.currentTime, current.duration, { flush: true });
    }
  };

  const clearBufferingUiTimeout = () => {
    if (bufferingUiTimeoutRef.current) {
      clearTimeout(bufferingUiTimeoutRef.current);
      bufferingUiTimeoutRef.current = null;
    }
  };

  const clearBufferingUi = () => {
    clearBufferingUiTimeout();
    const current = stateRef.current;
    if (!current || current.uiState !== "buffering") return;
    setState({ uiState: current.play ? "playing" : "paused" });
  };

  const scheduleBufferingUi = () => {
    if (bufferingUiTimeoutRef.current) return;
    bufferingUiTimeoutRef.current = setTimeout(() => {
      bufferingUiTimeoutRef.current = null;
      const current = stateRef.current;
      if (!current) return;
      if (playbackRateRef.current > 0) return;
      if (current.slidingCurrentTime !== null || current.uiState === "seeking") {
        return;
      }
      if (current.play && !current.ended) {
        setState({ uiState: "buffering" });
      }
    }, BUFFERING_UI_DELAY_MS);
  };

  const clearSurfaceSingleClickTimeout = () => {
    if (surfaceSingleClickTimeoutRef.current) {
      clearTimeout(surfaceSingleClickTimeoutRef.current);
      surfaceSingleClickTimeoutRef.current = null;
    }
  };

  const scheduleSingleClickAction = (action: () => void) => {
    clearSurfaceSingleClickTimeout();
    surfaceSingleClickTimeoutRef.current = setTimeout(() => {
      surfaceSingleClickTimeoutRef.current = null;
      action();
    }, SURFACE_SINGLE_CLICK_DELAY_MS);
  };

  const showSurfaceFeedback = (action: SurfaceFeedback) => {
    setSurfaceFeedback(action);
    if (surfaceFeedbackTimeoutRef.current) {
      clearTimeout(surfaceFeedbackTimeoutRef.current);
    }
    surfaceFeedbackTimeoutRef.current = setTimeout(() => {
      setSurfaceFeedback(null);
      surfaceFeedbackTimeoutRef.current = null;
    }, SURFACE_FEEDBACK_DURATION_MS);
  };

  const showControls = () => {
    setState({ controls: true });
    setControlsActivityTick((tick) => (Number.isFinite(tick) ? tick + 1 : 1));
  };

  const toggleControlsVisibility = () => {
    const current = stateRef.current;
    if (!current) return;

    const uiState = getUiState(current);
    const chromeVisible = shouldShowCustomControls({
      controlsVisible: current.controls,
      uiState,
    });

    if (chromeVisible && uiState !== "seeking" && uiState !== "error") {
      setState({ controls: false });
      setSubtitleMenuOpen(false);
      return;
    }

    if (!current.controls) {
      showControls();
    }
  };

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

  const consumeSeekSettle = (absoluteSeconds: number) => {
    const target = seekTargetRef.current;
    if (target !== null) {
      if (Math.abs(absoluteSeconds - target) > seekToleranceRef.current) {
        return false;
      }
      clearSeekSettle();
    }
    return true;
  };

  const applySeek = (targetPosition: number, tolerance: number, keepControlsHidden: boolean) => {
    const current = stateRef.current;
    if (!current) return;
    const clamped = Math.max(0, Math.min(targetPosition, current.duration));
    const next = {
      currentTime: clamped,
      slidingCurrentTime: null,
      ended: false,
      uiState: "seeking" as const,
    };
    stateRef.current = { ...current, ...next };
    seekToleranceRef.current = tolerance;
    armSeekSettle(clamped);
    setState(next);
    if (!keepControlsHidden) {
      showControls();
    }
  };

  const seekTo = (position: number, options?: { keepControlsHidden?: boolean }) => {
    applySeek(position, SEEK_SETTLE_TOLERANCE_SECONDS, options?.keepControlsHidden ?? false);
    void playerRef.current?.seekTo(toRelativeTime(position));
  };

  const skipBy = (delta: number, options?: { keepControlsHidden?: boolean }) => {
    const current = stateRef.current;
    if (!current) return;
    applySeek(current.currentTime + delta, SEEK_BY_SETTLE_TOLERANCE_SECONDS, options?.keepControlsHidden ?? false);
    void playerRef.current?.seekBy(delta);
  };

  const togglePlay = (options?: { keepControlsHidden?: boolean }) => {
    const current = stateRef.current;
    if (!current) return;
    if (current.ended) {
      setState({ play: true, ended: false, uiState: "playing" });
      void playerRef.current?.seekTo(0);
      void playerRef.current?.play();
    } else if (current.play) {
      setState({ play: false, uiState: "paused" });
      void playerRef.current?.pause();
    } else {
      setState({ play: true, ended: false, error: null, uiState: "playing" });
      void playerRef.current?.play();
    }
    if (!options?.keepControlsHidden) {
      showControls();
    }
  };

  const applySurfaceControl = (locationX: number) => {
    const surfaceOptions = { keepControlsHidden: true as const };
    const action = playerSurfaceClickAction({
      clientX: locationX,
      left: 0,
      width,
    });
    if (action === "seek-backward") {
      showSurfaceFeedback("seek-backward");
      skipBy(-SKIP_BACK_SECONDS, surfaceOptions);
      return;
    }
    if (action === "seek-forward") {
      showSurfaceFeedback("seek-forward");
      skipBy(SKIP_FORWARD_SECONDS, surfaceOptions);
      return;
    }
    const currentUiState = getUiState(stateRef.current!);
    const playbackAction = primaryPlaybackButtonState({
      uiState: currentUiState,
    }).action;
    showSurfaceFeedback(playbackAction);
    togglePlay(surfaceOptions);
  };

  const handleSurfacePress = (locationX: number) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < SURFACE_SINGLE_CLICK_DELAY_MS) {
      clearSurfaceSingleClickTimeout();
      lastTapTimeRef.current = 0;
      if (!subtitleMenuOpen) {
        applySurfaceControl(locationX);
      }
      return;
    }
    lastTapTimeRef.current = now;
    if (subtitleMenuOpen) {
      scheduleSingleClickAction(() => setSubtitleMenuOpen(false));
      return;
    }
    scheduleSingleClickAction(toggleControlsVisibility);
  };

  const cycleContentFit = () => {
    setContentFit((fit) => {
      const index = CONTENT_FIT_CYCLE.indexOf(fit);
      const next = CONTENT_FIT_CYCLE[(index + 1) % CONTENT_FIT_CYCLE.length] ?? "contain";
      void playerRef.current?.setZoomedToFill(next !== "contain");
      return next;
    });
    showControls();
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" && !pictureInPictureActiveRef.current) {
        void playerRef.current?.startPictureInPicture();
      }
      if (nextState === "active" && !pictureInPictureActiveRef.current && !stateRef.current?.play) {
        showControls();
      }
    });
    return () => subscription.remove();
  }, [pictureInPictureActiveRef, showControls]);

  const applySubtitleTrack = (trackId: string) => {
    setSelectedSubtitleId(trackId);
    setSubtitleMenuOpen(false);
    showControls();
  };

  const toggleSubtitleMenu = () => {
    if (subtitleTracks.length === 0) return;
    setSubtitleMenuOpen((open) => !open);
    showControls();
  };

  useEffect(() => {
    if (uiState === "playing" && state.controls && !subtitleMenuOpen) {
      const timeout = setTimeout(() => {
        setState({ controls: false });
      }, CONTROLS_AUTO_HIDE_MS);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [controlsActivityTick, state.controls, uiState, subtitleMenuOpen]);

  useEffect(() => {
    initialSeekAppliedRef.current = false;
    setContentFit("contain");
  }, [uri]);

  useEffect(() => {
    setSelectedSubtitleId(
      subtitleTracks.length > 0 ? (subtitleTracks.find((track) => track.default)?.id ?? "off") : "off",
    );
    setSubtitleMenuOpen(false);
  }, [subtitleTracks]);

  const handleLoad = () => {
    const current = stateRef.current;
    if (!current) return;
    if (!initialSeekAppliedRef.current) {
      const resumeAt = toRelativeTime(startSeconds);
      if (resumeAt > 0) {
        void playerRef.current?.seekTo(resumeAt);
      }
      initialSeekAppliedRef.current = true;
    }
    setState({
      currentTime: current.currentTime,
    });
    if (current.play) {
      void playerRef.current?.play();
    }
  };

  const handlePlaybackStateChange = (event: {
    nativeEvent: { isPaused?: boolean; isPlaying?: boolean; isLoading?: boolean; isReadyToSeek?: boolean };
  }) => {
    const { isPaused, isPlaying, isLoading } = event.nativeEvent;
    if (isPaused === true) {
      syncPlayStateFromPlayer(false);
    } else if (isPlaying === true) {
      playbackRateRef.current = 1;
      clearBufferingUi();
      syncPlayStateFromPlayer(true);
    }
    if (isLoading === true) {
      playbackRateRef.current = 0;
      scheduleBufferingUi();
    }
  };

  const handleProgress = (event: { nativeEvent: { position: number; duration: number; cacheSeconds: number } }) => {
    const { position, duration, cacheSeconds } = event.nativeEvent;
    playbackRateRef.current = 1;
    const absoluteTime = toAbsoluteTime(Math.floor(position));
    const current = stateRef.current;
    if (!current) return;

    let nextDuration = current.duration;
    if (duration > 0) {
      nextDuration = absolutePlaybackDuration({
        relativeDurationSeconds: duration,
        streamStartSeconds,
        streamRelativeTimeline: usesStreamRelativeTimeline,
      });
    }

    if (current.slidingCurrentTime !== null || !consumeSeekSettle(absoluteTime)) {
      if (nextDuration !== current.duration) {
        stateRef.current = { ...current, duration: nextDuration };
        setState({ duration: nextDuration });
      }
      return;
    }

    if (current.uiState === "seeking") {
      const nextUiStateAfterSeek = uiStateAfterSeek({
        play: current.play,
        bufferingActive: playbackRateRef.current === 0,
      });
      setState({
        currentTime: absoluteTime,
        duration: nextDuration,
        uiState: nextUiStateAfterSeek,
      });
      onProgressRef.current?.(absoluteTime, nextDuration, { flush: true });
      return;
    }

    const nextUiState = playbackUiStateAfterProgress({
      uiState: current.uiState,
      play: current.play,
      ended: current.ended,
      bufferingActive: playbackRateRef.current === 0,
      timeAdvanced: absoluteTime > current.currentTime,
    });

    const timeChanged =
      absoluteTime > current.currentTime || (absoluteTime < 1 && nextDuration > 0 && current.duration === 0);
    const uiStateChanged = nextUiState !== null && nextUiState !== current.uiState;

    if (!timeChanged && !uiStateChanged) return;

    const next = {
      ...(timeChanged ? { currentTime: absoluteTime, duration: nextDuration } : {}),
      ...(uiStateChanged ? { uiState: nextUiState } : {}),
    };
    stateRef.current = { ...current, ...next };

    if (timeChanged || uiStateChanged) {
      setState(next);
    }
    if (timeChanged) {
      onProgressRef.current?.(absoluteTime, nextDuration, { ended: current.ended });
    }

    if (cacheSeconds > 1 && playbackRateRef.current === 0 && absoluteTime > 0) {
      clearBufferingUi();
    }
  };

  const handleError = (event: { nativeEvent: { error: string } }) => {
    setState({
      error: event.nativeEvent.error ?? "Playback failed",
      play: false,
      uiState: "error",
    });
  };

  const handleEnd = () => {
    const current = stateRef.current;
    setState({
      ended: true,
      play: false,
      controls: true,
      uiState: "paused",
    });
    if (current) {
      onProgressRef.current?.(current.currentTime, current.duration, {
        flush: true,
        completed: true,
      });
    }
  };

  useEffect(
    () => () => {
      clearSurfaceSingleClickTimeout();
      clearBufferingUiTimeout();
      clearSeekSettle();
      if (surfaceFeedbackTimeoutRef.current) {
        clearTimeout(surfaceFeedbackTimeoutRef.current);
      }
      void playerRef.current?.destroy();
    },
    [clearBufferingUiTimeout, clearSeekSettle, clearSurfaceSingleClickTimeout],
  );

  const selectedSubtitleTrack = (() => {
    if (selectedSubtitleId === "off") return null;
    return subtitleTracks.find((entry) => entry.id === selectedSubtitleId) ?? null;
  })();

  const displayedTime = state.slidingCurrentTime ?? state.currentTime;
  const relativeDisplayedTime = toRelativeTime(displayedTime);
  const playbackButton = primaryPlaybackButtonState({ uiState });
  const playerReady = state.duration > 0 || state.play;
  const seekToSeconds = (targetSeconds: number) => seekTo(targetSeconds, { keepControlsHidden: true });
  const { activeSegment, autoSkipNotice, skipActiveSegment } = usePlaybackSegments({
    segments,
    segmentSkip,
    displayedSeconds: displayedTime,
    durationSeconds: state.duration,
    playerReady,
    mediaItemId,
    seekToSeconds,
  });
  const segmentSkipLabel = activeSegment && !segmentSkip.automatic ? activeSegment.label : null;

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
        onEnd={() => {
          handleEnd();
        }}
        onPictureInPictureChange={(event) => {
          pictureInPictureActiveRef.current = event.nativeEvent.isActive;
          if (!event.nativeEvent.isActive && !stateRef.current?.play) {
            showControls();
          }
        }}
      />

      <ExternalSubtitleOverlay
        track={selectedSubtitleTrack}
        currentTimeSeconds={relativeDisplayedTime}
        controlsVisible={customControlsVisible}
      />

      <Pressable
        style={styles.surfaceTapTarget}
        onPress={(event) => handleSurfacePress(event.nativeEvent.locationX)}
        accessibilityRole="button"
        accessibilityLabel="Video surface"
      />

      <PlayerOverlay
        visible={customControlsVisible}
        title={title}
        onClose={onClose}
        insets={insets}
        topActions={
          <PlayerTopControls
            subtitleTracks={subtitleTracks}
            selectedSubtitleId={selectedSubtitleId}
            subtitleMenuOpen={subtitleMenuOpen}
            onToggleSubtitleMenu={toggleSubtitleMenu}
            onSubtitleSelect={applySubtitleTrack}
            contentFit={contentFit}
            contentFitLabel={({ contain: "Fit video", cover: "Fill screen" } as Record<ContentFit, string>)[contentFit]}
            onCycleContentFit={cycleContentFit}
          />
        }
      >
        <PlayerControls
          displayedSeconds={displayedTime}
          duration={state.duration}
          playbackButton={playbackButton}
          onTogglePlay={togglePlay}
          onSkipBack={() => skipBy(-SKIP_BACK_SECONDS)}
          onSkipForward={() => skipBy(SKIP_FORWARD_SECONDS)}
          onSeekStart={(value) => {
            setState({ slidingCurrentTime: value, uiState: "seeking" });
            showControls();
          }}
          onSeekChange={(value) => setState({ slidingCurrentTime: value })}
          onSeekComplete={seekTo}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </PlayerOverlay>

      <SegmentSkipOverlay
        skipLabel={segmentSkipLabel}
        noticeLabel={autoSkipNotice}
        bottomInset={insets.bottom}
        rightInset={insets.right}
        onSkip={skipActiveSegment}
      />

      <SurfaceFeedbackOverlay feedback={surfaceFeedback} />

      {statusOverlay === "busy" ? (
        <View style={styles.statusBadge} pointerEvents="none">
          <ActivityIndicator size="small" color={darkColors.text} />
          <Text style={styles.statusText}>{playerStatusOverlayMessage(uiState)}</Text>
        </View>
      ) : null}

      {statusOverlay === "error" ? (
        <View style={styles.statusOverlay} pointerEvents="none">
          <Text style={styles.errorText}>{state.error ?? playerStatusOverlayMessage("error")}</Text>
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
  surfaceTapTarget: {
    ...StyleSheet.absoluteFill,
    zIndex: 1,
  },
  statusOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: darkColors.overlay,
    gap: spacing.sm,
    zIndex: 2,
  },
  statusBadge: {
    position: "absolute",
    top: "50%",
    alignSelf: "center",
    marginTop: -22,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: "rgba(8, 12, 16, 0.72)",
    zIndex: 2,
  },
  statusText: {
    color: darkColors.text,
    fontSize: typography.fontSize.label,
    fontWeight: typography.fontWeight.semibold,
    paddingHorizontal: spacing.md,
    textAlign: "center",
  },
  errorText: {
    color: darkColors.error,
    fontSize: typography.fontSize.title,
    fontWeight: typography.fontWeight.semibold,
    paddingHorizontal: spacing.md,
    textAlign: "center",
  },
});
