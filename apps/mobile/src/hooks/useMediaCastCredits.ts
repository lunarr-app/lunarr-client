import { useQuery } from "@tanstack/react-query";
import { type CastMember } from "@/src/components/catalog/CastRail";
import { getMovieCredits, getShowCredits } from "@/src/lib/api/generated";
import { queryKeys } from "@/src/lib/api/query-keys";

const STALE_TIME = 30 * 60_000;

type Kind = "movie" | "show";

export type CastCreditsResponse = { cast: CastMember[] };

export function useMediaCastCredits(kind: Kind, id: string | undefined) {
  return useQuery<CastCreditsResponse>({
    queryKey: kind === "movie" ? queryKeys.movies.credits(id ?? "") : queryKeys.shows.credits(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Missing id");
      const { data, error } = await (kind === "movie" ? getMovieCredits : getShowCredits)({ path: { id } });
      if (error) throw error;
      const cast: CastMember[] = (data?.cast ?? []).map((person) => ({
        name: person.name,
        character: person.character ?? null,
        profilePath: person.profilePath ?? null,
        provider: person.provider ?? null,
        providerId: person.providerId ?? null,
      }));
      return { cast };
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}
