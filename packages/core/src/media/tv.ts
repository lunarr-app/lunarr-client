export function seasonTabLabel(season: { title?: string | null; seasonNumber?: number | null }) {
  if (season.title?.trim()) return season.title;
  if (season.seasonNumber != null) return `Season ${season.seasonNumber}`;
  return "Season";
}

export function episodeCode(seasonNumber: number | null | undefined, episodeNumber: number | null | undefined): string {
  if (seasonNumber == null || episodeNumber == null) return "";
  return `S${String(seasonNumber).padStart(2, "0")}E${String(episodeNumber).padStart(2, "0")}`;
}

export type PlayableEpisode = {
  fileId: string | null;
  progressSeconds?: number | null;
  completed: boolean | number;
};

export function findNextEpisode<T extends PlayableEpisode>(episodes: T[]): T | undefined {
  return (
    episodes.find((episode) => !episode.completed && (episode.progressSeconds ?? 0) > 0 && episode.fileId) ??
    episodes.find((episode) => !episode.completed && episode.fileId) ??
    episodes.find((episode) => episode.fileId)
  );
}

export type ShowResumeEpisode = {
  id: string;
  title: string;
  seasonNumber: number | null;
  episodeNumber: number | null;
  fileId: string | null;
  progressSeconds: number;
  completed: boolean;
};

type ResumeEpisodeInput = PlayableEpisode & {
  id: string;
  title: string;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
};

export function pickShowResumeEpisode(episodes: ResumeEpisodeInput[]): ShowResumeEpisode | null {
  const next = findNextEpisode(episodes);
  if (!next) return null;

  return {
    id: next.id,
    title: next.title,
    seasonNumber: next.seasonNumber ?? null,
    episodeNumber: next.episodeNumber ?? null,
    fileId: next.fileId,
    progressSeconds: next.progressSeconds ?? 0,
    completed: Boolean(next.completed),
  };
}

export function pickShowResumeFromSeasons(
  seasons: Array<{ episodes: ResumeEpisodeInput[] }>,
): ShowResumeEpisode | null {
  return pickShowResumeEpisode(seasons.flatMap((season) => season.episodes));
}

function computeSeasonStats(total: number, playable: number, watched: number) {
  const missing = total - playable;
  return {
    total,
    playable,
    watched,
    missing,
    progress: total > 0 ? Math.round((watched / total) * 100) : 0,
  };
}

export function seasonStubStats(stub: { episodeCount: number; playableCount: number; watchedCount: number }) {
  return computeSeasonStats(stub.episodeCount, stub.playableCount, stub.watchedCount);
}

export function seasonStats(episodes: Array<{ fileId: string | null; completed: boolean | number }>) {
  const total = episodes.length;
  const playable = episodes.filter((episode) => episode.fileId).length;
  const watched = episodes.filter((episode) => Boolean(episode.completed)).length;
  return computeSeasonStats(total, playable, watched);
}
