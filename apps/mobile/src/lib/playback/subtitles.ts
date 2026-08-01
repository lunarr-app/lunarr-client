type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

export type SubtitleCueIndex = {
  cues: SubtitleCue[];
  lastIndex: number;
};

function parseTimestamp(value: string): number {
  const parts = value.trim().split(":");
  const last = parts.pop();
  if (!last) return 0;
  const [secondsRaw, millisRaw = "0"] = last.split(/[.,]/);
  const hours = parts.length === 2 ? Number(parts[0]) : 0;
  const minutes = parts.length === 2 ? Number(parts[1]) : Number(parts[0] ?? "0");
  const seconds = Number(secondsRaw);
  const millis = Number(millisRaw.padEnd(3, "0").slice(0, 3)) / 1000;
  return hours * 3600 + minutes * 60 + seconds + millis;
}

export function parseSubtitleDocument(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.replace(/\r/g, "").split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    if (lines[0].includes("WEBVTT")) continue;
    const timingIndex = lines[0].includes("-->") ? 0 : 1;
    const timing = lines[timingIndex];
    if (!timing?.includes("-->")) continue;
    const [startRaw, endRaw] = timing.split("-->");
    const text = lines
      .slice(timingIndex + 1)
      .join("\n")
      .trim();
    if (!text) continue;
    cues.push({
      start: parseTimestamp(startRaw),
      end: parseTimestamp(endRaw),
      text,
    });
  }
  return cues;
}

export function createSubtitleIndex(cues: SubtitleCue[]): SubtitleCueIndex {
  return { cues, lastIndex: 0 };
}

function binarySearchCue(cues: SubtitleCue[], seconds: number): number {
  let lo = 0;
  let hi = cues.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cue = cues[mid];
    if (seconds < cue.start) {
      hi = mid - 1;
    } else if (seconds >= cue.end) {
      lo = mid + 1;
    } else {
      return mid;
    }
  }
  return -1;
}

export function subtitleTextAtTime(cues: SubtitleCue[], seconds: number, index?: SubtitleCueIndex): string | null {
  if (cues.length === 0) return null;

  const i = index ?? { cues, lastIndex: 0 };

  // Check last matched cue first (O(1) for sequential playback)
  const last = i.cues[i.lastIndex];
  if (last && seconds >= last.start && seconds < last.end) {
    return last.text;
  }

  // Check next cue (common case: playback advanced to next subtitle)
  const next = i.lastIndex + 1;
  if (next < i.cues.length) {
    const nextCue = i.cues[next];
    if (seconds >= nextCue.start && seconds < nextCue.end) {
      i.lastIndex = next;
      return nextCue.text;
    }
  }

  // Check previous cue (playback paused or slight overlap)
  const prev = i.lastIndex - 1;
  if (prev >= 0) {
    const prevCue = i.cues[prev];
    if (seconds >= prevCue.start && seconds < prevCue.end) {
      i.lastIndex = prev;
      return prevCue.text;
    }
  }

  // Fallback: binary search (for seeks)
  const found = binarySearchCue(cues, seconds);
  if (found >= 0) {
    i.lastIndex = found;
    return cues[found].text;
  }

  return null;
}
