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
export const PLAYER_OVERLAY_DISMISS_MS = 3500;
export const PLAYBACK_PROGRESS_SAVE_INTERVAL_MS = 10_000;
