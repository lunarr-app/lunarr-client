import { cancelPlaybackSession, heartbeatPlaybackSession } from "@lunarr/api";
import { useEffect } from "react";
import { isStreamRelativePlaybackMode, type PlaybackDecision } from "./service";

const HEARTBEAT_MS = 15_000;

export function usePlaybackSession(playback: PlaybackDecision | null) {
  const sessionId = playback?.playbackSessionId ?? null;
  const usesServerSession = isStreamRelativePlaybackMode(playback?.mode);

  useEffect(() => {
    if (!playback || !sessionId || !usesServerSession) return;
    if (playback.status !== "preparing" && playback.status !== "ready") return;
    const activeSessionId = sessionId;

    const interval = setInterval(() => {
      void heartbeatPlaybackSession({ path: { sessionId: activeSessionId } }).catch(() => undefined);
    }, HEARTBEAT_MS);

    return () => {
      clearInterval(interval);
      void cancelPlaybackSession({ path: { sessionId: activeSessionId } }).catch(() => undefined);
    };
  }, [sessionId, usesServerSession]);
}
