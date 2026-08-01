export type SubtitleCue = {
  start: number;
  end: number;
  text: string;
};

function parseTimestamp(value: string): number {
  const parts = value.trim().split(":");
  const [secondsRaw, millisRaw = "0"] = parts.pop()!.split(/[.,]/);
  const hours = parts.length === 2 ? Number(parts[0]) : 0;
  const minutes = parts.length === 2 ? Number(parts[1]) : Number(parts[0] ?? "0");
  const seconds = Number(secondsRaw);
  const millis = Number(millisRaw.padEnd(3, "0").slice(0, 3)) / 1000;
  return hours * 3600 + minutes * 60 + seconds + millis;
}

function parseTimedTextBlocks(content: string, options?: { skipHeader?: boolean }): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.replace(/\r/g, "").split(/\n\n+/);
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    if (options?.skipHeader && lines[0].includes("WEBVTT")) continue;
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

export function parseSubtitleDocument(content: string): SubtitleCue[] {
  if (content.includes("WEBVTT")) {
    return parseTimedTextBlocks(content, { skipHeader: true });
  }
  return parseTimedTextBlocks(content);
}

export function subtitleTextAtTime(cues: SubtitleCue[], seconds: number) {
  const cue = cues.find((entry) => seconds >= entry.start && seconds < entry.end);
  return cue?.text ?? null;
}
