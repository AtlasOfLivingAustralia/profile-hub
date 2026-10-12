import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const userManager = new UserManager({
  authority: import.meta.env.VITE_AUTH_AUTHORITY,
  client_id: import.meta.env.VITE_AUTH_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_AUTH_REDIRECT_URI,
  scope: import.meta.env.VITE_AUTH_SCOPE,
  response_type: "code",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  // Cognito: custom refresh via refresh_token grant (see handleRefresh.ts)
  automaticSilentRenew: false,
});
