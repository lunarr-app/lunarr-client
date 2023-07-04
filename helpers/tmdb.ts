export type TMDBImageWidthPoster = 45 | 92 | 154 | 185 | 342 | 500 | 780 | 1280;

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";

const TMDBImageWidthPosterNumbers: TMDBImageWidthPoster[] = [45, 92, 154, 185, 342, 500, 780, 1280];

export const findClosestWidth = (width: number): TMDBImageWidthPoster => {
  return TMDBImageWidthPosterNumbers.reduce((prev, curr) => {
    if (curr >= width && curr < prev) {
      return curr;
    }
    return prev;
  }, 500);
};

export const getPosterURL = (path?: string, width: TMDBImageWidthPoster | "original" = "original") => {
  if (path) {
    if (width === "original") {
      return `${TMDB_IMAGE_BASE_URL}original${path}`;
    }

    return `${TMDB_IMAGE_BASE_URL}w${width}${path}`;
  }

  // Return a dummy image URL with specified width and aspect ratio
  const dummyWidth = width === "original" ? 500 : width;
  const dummyHeight = Math.round(dummyWidth / 1.5);

  return `https://dummyimage.com/${dummyWidth}x${dummyHeight}/ccc/000&text=No+Image`;
};
