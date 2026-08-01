export function readApiError(error: unknown, fallback: string): string {
  if (typeof error === "object" && error) {
    const e = error as Record<string, unknown>;
    if (typeof e.detail === "string" && e.detail) return e.detail;
    if (typeof e.title === "string" && e.title) return e.title;
  }
  return fallback;
}

export function isAuthFailure(response?: Response | null) {
  return response?.status === 401 || response?.status === 403;
}
