export const DEFAULT_COUNTRY =
  process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "us";

export const getCountryPrefix = (path = ""): string =>
  `/${DEFAULT_COUNTRY}${path.startsWith("/") ? path : `/${path}`}`;
