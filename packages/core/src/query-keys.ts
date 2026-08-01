export const queryKeys = {
  continueWatching: {
    all: ["continueWatching"] as const,
    movies: () => [...queryKeys.continueWatching.all, "movies"] as const,
    episodes: () => [...queryKeys.continueWatching.all, "episodes"] as const,
  },
  movies: {
    all: ["movies"] as const,
    browse: (rails: string) => [...queryKeys.movies.all, "browse", rails] as const,
    list: (sort: string, status?: string, search?: string) =>
      [...queryKeys.movies.all, "list", sort, { status: status ?? "all", search: search ?? "" }] as const,
    detail: (id: string) => [...queryKeys.movies.all, "detail", id] as const,
    similar: (id: string) => [...queryKeys.movies.all, "similar", id] as const,
    credits: (id: string) => [...queryKeys.movies.all, "credits", id] as const,
  },
  shows: {
    all: ["shows"] as const,
    browse: (rails: string) => [...queryKeys.shows.all, "browse", rails] as const,
    list: (sort: string, search?: string) =>
      [...queryKeys.shows.all, "list", sort, ...(search ? [search] : [])] as const,
    detail: (id: string) => [...queryKeys.shows.all, "detail", id] as const,
    season: (showId: string, seasonId: string) => [...queryKeys.shows.all, "season", showId, seasonId] as const,
    similar: (id: string) => [...queryKeys.shows.all, "similar", id] as const,
    credits: (id: string) => [...queryKeys.shows.all, "credits", id] as const,
  },
  episodes: {
    all: ["episodes"] as const,
    detail: (id: string) => [...queryKeys.episodes.all, "detail", id] as const,
  },
  people: {
    all: ["people"] as const,
    detail: (provider: string, id: string) => [...queryKeys.people.all, provider, id] as const,
  },
  discover: {
    all: ["discover"] as const,
    rail: (kind: "movies" | "shows") => [...queryKeys.discover.all, "rail", kind] as const,
    movies: () => [...queryKeys.discover.all, "movies"] as const,
    shows: () => [...queryKeys.discover.all, "shows"] as const,
  },
  watchlist: {
    all: ["watchlist"] as const,
  },
  search: {
    all: ["search"] as const,
    movies: (query: string) => [...queryKeys.search.all, "movies", query] as const,
    shows: (query: string) => [...queryKeys.search.all, "shows", query] as const,
  },
  health: {
    all: ["health"] as const,
  },
} as const;
