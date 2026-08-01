export type PlayerControlUiState = "playing" | "paused" | "buffering" | "seeking" | "error";

export function primaryPlaybackButtonState(input: { uiState: PlayerControlUiState }) {
  const action: "play" | "pause" =
    input.uiState === "playing" || input.uiState === "buffering" || input.uiState === "seeking" ? "pause" : "play";
  return {
    action,
    label: action === "pause" ? "Pause" : "Play",
  };
}

export function shouldShowCustomControls(input: {
  controlsVisible: boolean;
  uiState: PlayerControlUiState;
  subtitleMenuOpen?: boolean;
}) {
  if (input.uiState === "seeking" || input.uiState === "error") {
    return true;
  }
  if (input.subtitleMenuOpen) {
    return true;
  }
  return input.controlsVisible;
}

type PlayerSurfaceClickAction = "seek-backward" | "toggle-playback" | "seek-forward";

export function playerSurfaceClickAction(input: {
  clientX: number;
  left: number;
  width: number;
}): PlayerSurfaceClickAction {
  const width = Number.isFinite(input.width) && input.width > 0 ? input.width : 0;
  if (width === 0) return "toggle-playback";
  const relativeX = Number.isFinite(input.clientX) ? input.clientX - input.left : width / 2;
  const zone = Math.min(Math.max(relativeX / width, 0), 1);
  if (zone < 1 / 3) return "seek-backward";
  if (zone > 2 / 3) return "seek-forward";
  return "toggle-playback";
}

export type SurfaceFeedback = "seek-backward" | "play" | "pause" | "seek-forward";

export const SURFACE_SINGLE_CLICK_DELAY_MS = 300;
export const SURFACE_FEEDBACK_DURATION_MS = 620;
export const CONTROLS_AUTO_HIDE_MS = 3500;
export const PLAYER_OVERLAY_DISMISS_MS = 3500;
export const BUFFERING_UI_DELAY_MS = 300;
export const PLAYBACK_PROGRESS_SAVE_INTERVAL_MS = 10_000;

export function uiStateAfterSeek(input: { play: boolean; bufferingActive: boolean }): PlayerControlUiState {
  if (input.bufferingActive && input.play) return "buffering";
  return input.play ? "playing" : "paused";
}

export function playbackUiStateAfterProgress(input: {
  uiState: PlayerControlUiState;
  play: boolean;
  ended: boolean;
  bufferingActive: boolean;
  timeAdvanced: boolean;
}): PlayerControlUiState | null {
  if (input.ended || !input.play) return null;

  if (input.uiState === "buffering" && input.timeAdvanced && !input.bufferingActive) {
    return "playing";
  }

  return null;
}

type PlayerStatusOverlayState = "hidden" | "busy" | "error";

export function playerStatusOverlayState(uiState: PlayerControlUiState): PlayerStatusOverlayState {
  if (uiState === "error") return "error";
  if (uiState === "buffering" || uiState === "seeking") {
    return "busy";
  }
  return "hidden";
}

export function playerStatusOverlayMessage(uiState: PlayerControlUiState) {
  switch (uiState) {
    case "buffering":
      return "Buffering";
    case "seeking":
      return "Seeking";
    case "error":
      return "Playback error";
    default:
      return "";
  }
}
