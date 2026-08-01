import { useEffect, useRef, useState } from "react";

import type { PlaybackSubtitleTrack } from "@lunarr/core";

type Options = {
  tracks: PlaybackSubtitleTrack[];
  showControls: () => void;
};

export function useSubtitleSelection({ tracks, showControls }: Options) {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [subtitleMenuOpen, setSubtitleMenuOpen] = useState(false);
  const hasSelectedDefaultTrackRef = useRef(false);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) ?? null;

  useEffect(() => {
    if (hasSelectedDefaultTrackRef.current || tracks.length === 0) return;
    const defaultTrack = tracks.find((t) => t.default);
    setSelectedTrackId(defaultTrack?.id ?? null);
    hasSelectedDefaultTrackRef.current = true;
  }, [tracks]);

  const handleSubtitleSelect = (id: string | null) => {
    setSelectedTrackId(id);
    setSubtitleMenuOpen(false);
    showControls();
  };

  return {
    selectedTrackId,
    selectedTrack,
    subtitleMenuOpen,
    setSubtitleMenuOpen,
    handleSubtitleSelect,
  };
}
