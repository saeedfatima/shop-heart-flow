const DEFAULT_API_PATH = "/api";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const stripQuotes = (value: string): string => value.replace(/^['"]|['"]$/g, "");

const isLoopbackHost = (hostname: string): boolean => {
  const normalizedHost = hostname.toLowerCase();
  return normalizedHost === "localhost" ||
    normalizedHost === "127.0.0.1" ||
    normalizedHost === "::1" ||
    normalizedHost === "[::1]";
};

const getBrowserLocation = (): Location | null => {
  return typeof window === "undefined" ? null : window.location;
};

const buildBrowserApiUrl = (path = DEFAULT_API_PATH): string => {
  const location = getBrowserLocation();
  if (!location) {
    return "";
  }

  return `${location.protocol}//${location.hostname}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getApiBaseUrl = (): string => {
  const configuredValue = stripQuotes(import.meta.env.VITE_API_URL || "").trim();
  const location = getBrowserLocation();

  if (!configuredValue) {
    return trimTrailingSlash(buildBrowserApiUrl());
  }

  try {
    const configuredUrl = new URL(configuredValue);

    if (location && isLoopbackHost(configuredUrl.hostname) && !isLoopbackHost(location.hostname)) {
      configuredUrl.hostname = location.hostname;
    }

    return trimTrailingSlash(configuredUrl.toString());
  } catch {
    return trimTrailingSlash(buildBrowserApiUrl());
  }
};

export const getMediaBaseUrl = (): string => {
  return getApiBaseUrl();
};

export const resolveApiAssetUrl = (path?: string | null): string | undefined => {
  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
};
