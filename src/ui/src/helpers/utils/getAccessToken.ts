import { userManager } from "#/helpers/auth";
import { refreshUserTokens } from "#/helpers/auth/handleRefresh";

const REFRESH_SKEW_MS = 60_000;

/**
 * Synchronous read of the access_token from oidc-client sessionStorage.
 * Returns undefined if missing or already expired (do not send a stale Bearer).
 */
export const getAccessToken = (): string | undefined => {
  const userRaw = sessionStorage.getItem(
    `oidc.user:${import.meta.env.VITE_AUTH_AUTHORITY}:${
      import.meta.env.VITE_AUTH_CLIENT_ID
    }`,
  );

  if (userRaw) {
    const user = JSON.parse(userRaw);
    if (user["expires_at"] * 1000 < Date.now()) return undefined;
    if (user["access_token"]) return user["access_token"];
  }

  return undefined;
};

/**
 * Resolve a usable access_token for API calls: refresh when expired/near-expiry
 * so hub JwtBearerAuthInterceptor gets a valid Bearer (not an id_token).
 */
export const ensureAccessToken = async (): Promise<string | undefined> => {
  const user = await userManager.getUser();
  if (!user?.access_token) {
    return undefined;
  }

  const expiresAtMs = (user.expires_at ?? 0) * 1000;
  if (expiresAtMs - Date.now() >= REFRESH_SKEW_MS) {
    return user.access_token;
  }

  const refreshed = await refreshUserTokens(user);
  return refreshed?.access_token;
};
