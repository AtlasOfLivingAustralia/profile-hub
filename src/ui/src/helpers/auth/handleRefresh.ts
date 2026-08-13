import type { User } from "oidc-client-ts";
import type { AuthContextProps } from "react-oidc-context";
import { userManager } from ".";
import handleSignout from "./handleSignout";

interface TokenRefreshPayload {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  token_type: string;
}

/**
 * Refresh Cognito/OIDC tokens using the refresh_token grant and persist to sessionStorage.
 * Returns the updated user, or null if refresh failed.
 */
export async function refreshUserTokens(existing: User): Promise<User | null> {
  if (!existing.refresh_token) {
    return null;
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: import.meta.env.VITE_AUTH_CLIENT_ID,
    refresh_token: existing.refresh_token,
  });

  const tokenEndpoint = await userManager.metadataService.getTokenEndpoint();
  const resp = await fetch(tokenEndpoint || "", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    return null;
  }

  const { access_token, expires_in, refresh_token, id_token } =
    (await resp.json()) as TokenRefreshPayload;

  existing.access_token = access_token;
  existing.expires_in = expires_in;
  existing.expires_at = Math.floor(Date.now() / 1000) + expires_in;

  if (refresh_token) existing.refresh_token = refresh_token;
  if (id_token) existing.id_token = id_token;

  await userManager.storeUser(existing);
  return existing;
}

export default async function handleRefresh(auth: AuthContextProps) {
  const existing = auth.user;
  if (!existing) {
    await handleSignout(auth);
    return;
  }

  const refreshed = await refreshUserTokens(existing);
  if (!refreshed) {
    await handleSignout(auth);
    return;
  }

  // Propagate to react-oidc-context subscribers
  await auth.events.load(refreshed, true);
}
