export type LoginRedirectTarget = {
  to: string;
  search?: Record<string, string>;
};

/**
 * Turns the `redirect` search param carried by the login screen into router
 * navigation options. Anything that could leave the app (absolute URLs,
 * protocol-relative paths, other schemes) is rejected.
 */
export function parseLoginRedirect(raw: string | undefined | null): LoginRedirectTarget | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("://")) {
    return null;
  }

  // `to` does not parse a query string, so hand the search params over separately.
  const [path, queryString] = raw.split("#")[0].split("?");
  if (!path.startsWith("/")) return null;

  return {
    to: path,
    search: queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined,
  };
}
