import { useEffect, useRef, useState } from "react";

export type ContentFit = "contain" | "cover";

const CONTENT_FIT_CYCLE: ContentFit[] = ["contain", "cover"];

export const CONTENT_FIT_LABELS: Record<ContentFit, string> = {
  contain: "Fit",
  cover: "Fill",
};

type Options = {
  showControls: () => void;
  onApply?: (fit: ContentFit) => void;
};

export function useContentFit({ showControls, onApply }: Options) {
  const [contentFit, setContentFit] = useState<ContentFit>("contain");
  const [zoomLabel, setZoomLabel] = useState<string | null>(null);
  const zoomLabelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onApplyRef = useRef(onApply);

  useEffect(() => {
    onApplyRef.current = onApply;
  });

  const cycleContentFit = () => {
    const index = CONTENT_FIT_CYCLE.indexOf(contentFit);
    const nextFit = CONTENT_FIT_CYCLE[(index + 1) % CONTENT_FIT_CYCLE.length] ?? "contain";
    setContentFit(nextFit);
    onApplyRef.current?.(nextFit);
    setZoomLabel(CONTENT_FIT_LABELS[nextFit]);
    if (zoomLabelTimeoutRef.current) {
      clearTimeout(zoomLabelTimeoutRef.current);
    }
    zoomLabelTimeoutRef.current = setTimeout(() => {
      setZoomLabel(null);
      zoomLabelTimeoutRef.current = null;
    }, 2000);
    showControls();
  };

  useEffect(() => {
    return () => {
      if (zoomLabelTimeoutRef.current) {
        clearTimeout(zoomLabelTimeoutRef.current);
      }
    };
  }, []);

  return { contentFit, zoomLabel, cycleContentFit };
}
