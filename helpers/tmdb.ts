export const getImageURL = (path: string, width: number) => {
  return "https://image.tmdb.org/t/p/w" + width + path;
};
