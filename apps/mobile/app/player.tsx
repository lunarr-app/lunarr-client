import { ErrorView } from "@/src/components/layout/ErrorView";
import { LoadingView } from "@/src/components/layout/LoadingView";
import { VideoPlayer } from "@/src/components/player/VideoPlayer";
import { savePlaybackProgress } from "@lunarr/api";
import { PLAYBACK_PROGRESS_SAVE_INTERVAL_MS } from "@/src/lib/playback/controls";
import { pollPlaybackUntilReady, readPlaybackPreference, type PlaybackData } from "@lunarr/core";
import { useAuth } from "@/src/store/auth";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";

export default function PlayerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    mediaItemId: string;
    title: string;
    fileId?: string;
    startSeconds?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playbackData, setPlaybackData] = useState<PlaybackData | null>(null);
  const mediaFileIdRef = useRef(params.fileId ?? "");
  const lastSaveAtRef = useRef(0);
  const latestProgressRef = useRef({ positionSeconds: 0, durationSeconds: 0 });
  const forceTranscodeRef = useRef(readPlaybackPreference(user?.transcodePolicy) === "prefer_transcode");

  useEffect(() => {
    forceTranscodeRef.current = readPlaybackPreference(user?.transcodePolicy) === "prefer_transcode";
  }, [user?.transcodePolicy]);

  const load = async (signal?: AbortSignal) => {
    if (!params.mediaItemId) {
      setError("Missing media item");
      setLoading(false);
      return;
    }

    const startSeconds = Number(params.startSeconds ?? 0);
    const fileId = params.fileId || undefined;
    const effectiveStartSeconds = Number.isFinite(startSeconds) ? startSeconds : 0;

    try {
      const data = await pollPlaybackUntilReady(params.mediaItemId, {
        fileId,
        startSeconds: effectiveStartSeconds,
        forceTranscode: forceTranscodeRef.current,
        signal,
      });
      if (signal != null) {
        if (signal.aborted) return;
      }
      let resolvedFileId = "";
      if (params.fileId) {
        resolvedFileId = params.fileId;
      } else if (data.playback.mediaFileId) {
        resolvedFileId = data.playback.mediaFileId;
      }
      mediaFileIdRef.current = resolvedFileId;
      let durationSeconds = 0;
      if (data.playback.durationSeconds != null) durationSeconds = data.playback.durationSeconds;
      latestProgressRef.current = {
        positionSeconds: data.startSeconds,
        durationSeconds,
      };
      setPlaybackData(data);
    } catch (err) {
      if (signal != null) {
        if (signal.aborted) return;
      }
      if (!(err instanceof Error && err.message === "Playback cancelled")) {
        let message = "Playback failed";
        if (err instanceof Error) message = err.message;
        setError(message);
      }
    }
    if (!signal?.aborted) setLoading(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const persistProgress = (positionSeconds: number, durationSeconds: number, completed = false) => {
    if (!params.mediaItemId || !mediaFileIdRef.current) return;
    void savePlaybackProgress({
      path: { id: params.mediaItemId },
      body: {
        mediaFileId: mediaFileIdRef.current,
        positionSeconds: Math.floor(positionSeconds),
        durationSeconds: durationSeconds > 0 ? Math.floor(durationSeconds) : null,
        completed,
      },
    }).catch(() => undefined);
    lastSaveAtRef.current = Date.now();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      const { positionSeconds, durationSeconds } = latestProgressRef.current;
      persistProgress(positionSeconds, durationSeconds);
    });
    return unsubscribe;
  }, [navigation, persistProgress]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") return;
      const { positionSeconds, durationSeconds } = latestProgressRef.current;
      persistProgress(positionSeconds, durationSeconds);
    });
    return () => subscription.remove();
  }, [persistProgress]);

  const handleProgress = (
    positionSeconds: number,
    durationSeconds: number,
    options?: { flush?: boolean; completed?: boolean; ended?: boolean },
  ) => {
    latestProgressRef.current = { positionSeconds, durationSeconds };

    if (options?.flush) {
      persistProgress(positionSeconds, durationSeconds, options.completed ?? options.ended);
      return;
    }

    if (Date.now() - lastSaveAtRef.current >= PLAYBACK_PROGRESS_SAVE_INTERVAL_MS) {
      persistProgress(positionSeconds, durationSeconds, options?.ended);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <LoadingView size="large" />
      </View>
    );
  }

  if (error || !playbackData) {
    return (
      <View style={styles.centered}>
        <ErrorView
          layout="centered"
          message={error || "Unable to start playback"}
          retryLabel="Reload"
          onRetry={() => {
            setError("");
            setLoading(true);
            void load();
          }}
        />
      </View>
    );
  }

  return (
    <VideoPlayer
      title={params.title ?? playbackData.item.title}
      playback={playbackData.playback}
      startSeconds={playbackData.startSeconds}
      mediaItemId={playbackData.item.id}
      segments={playbackData.segments}
      segmentSkip={playbackData.segmentSkip}
      onClose={() => router.back()}
      onProgress={handleProgress}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
});
