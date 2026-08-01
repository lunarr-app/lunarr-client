export const MIN_SUPPORTED_SERVER_VERSION = "0.8.0";

function parseVersion(version: string): number[] | null {
  const cleaned = version.trim().replace(/^v/i, "");
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return [Number(match[1]) || 0, Number(match[2]) || 0, Number(match[3]) || 0];
}

function compareVersions(a: number[], b: number[]): number {
  for (let i = 0; i < 3; i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}

export function isServerVersionSupported(version: string | undefined | null): boolean {
  if (!version) return false;
  const trimmed = version.trim().replace(/^v/i, "");
  if (/^edge-/i.test(trimmed)) return true;
  const parsed = parseVersion(trimmed);
  const min = parseVersion(MIN_SUPPORTED_SERVER_VERSION);
  if (!parsed || !min) return false;
  return compareVersions(parsed, min) >= 0;
}
