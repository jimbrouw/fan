type AppUrlEnv = {
  NEXT_PUBLIC_APP_URL?: string;
};

export function getAppUrl(env: AppUrlEnv = process.env as AppUrlEnv) {
  return (env.NEXT_PUBLIC_APP_URL ?? "https://app.kitface.app").replace(/\/+$/, "");
}

export function buildAppUrl(path = "/", appUrl = getAppUrl()) {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${appUrl.replace(/\/+$/, "")}${normalizedPath}`;
}

export function buildLoginRedirectUrl(nextPath: string, appUrl = getAppUrl()) {
  const safeNext = nextPath.startsWith("/") ? nextPath : "/";
  return `${appUrl.replace(/\/+$/, "")}/login?next=${encodeURIComponent(safeNext)}`;
}

export function buildAuthenticatedAppUrl(path = "/", appUrl = getAppUrl()) {
  if (/^https?:\/\//i.test(path)) return path;
  return buildLoginRedirectUrl(path, appUrl);
}
