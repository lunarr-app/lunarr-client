import { useEffect, useRef, useState } from "react";

import type { AudioTrack } from "@lunarr/api";

type Options = {
  audioTracks: AudioTrack[];
  resetKey: string;
  showControls?: () => void;
  onApply: (trackId: number) => void;
};

export function useAudioSelection({ audioTracks, resetKey, showControls, onApply }: Options) {
  const [selectedAudioId, setSelectedAudioId] = useState<number | null>(null);
  const [audioMenuOpen, setAudioMenuOpen] = useState(false);
  const appliedRef = useRef(false);

  useEffect(() => {
    appliedRef.current = false;
    setSelectedAudioId(null);
    setAudioMenuOpen(false);
  }, [resetKey]);

  const applyDefaultAudioSelection = () => {
    if (appliedRef.current || audioTracks.length === 0) return;
    appliedRef.current = true;
    const initial = audioTracks.find((track) => track.default) ?? audioTracks[0];
    if (initial) {
      setSelectedAudioId(initial.id);
      onApply(initial.id);
    }
  };

  const handleAudioSelect = (trackId: number) => {
    setSelectedAudioId(trackId);
    setAudioMenuOpen(false);
    showControls?.();
    onApply(trackId);
  };

  return {
    selectedAudioId,
    audioMenuOpen,
    setAudioMenuOpen,
    handleAudioSelect,
    applyDefaultAudioSelection,
  };
}
