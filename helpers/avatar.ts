import md5 from "crypto-js/md5";

export const getGravatarFromEmail = (email: string): string => {
  const hash = md5(email).toString();
  return `https://0.gravatar.com/avatar/${hash}?size=128`;
};
