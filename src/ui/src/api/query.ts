import { userManager } from "#/helpers/auth";
import { ensureAccessToken } from "#/helpers/utils/getAccessToken";
// CSRF is not required for Bearer JWT API calls; left disabled.

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function redirectToSpaLogin(): Promise<void> {
  await userManager.removeUser();
  await userManager.signinRedirect({
    state: {
      targetUrl: `${window.location.pathname}${window.location.search}`,
    },
  });
}

export const request = async <T>(
  input: RequestInfo | URL,
  method?: "GET" | "PUT" | "POST" | "DELETE",
  body?: BodyInit | null,
  additionalHeaders?: HeadersInit,
): Promise<T> => {
  const headerMap: Record<string, string> = {
    "Accept-Version": "1.0",
    ...((additionalHeaders as Record<string, string>) || {}),
  };

  // Access token (not id_token) — matches ala-ws-security / JwtBearerAuthInterceptor
  const token = await ensureAccessToken();
  if (token && token.trim() !== "") {
    headerMap["Authorization"] = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;
  if (body && !isFormData && !headerMap["Content-Type"]) {
    headerMap["Content-Type"] = "application/json";
  }

  // credentials:include is not required for JWT; kept for any cookie-based
  // ancillary behavior. Hub no longer forces interactive OIDC from cookies.
  const resp = await fetch(import.meta.env.VITE_API_BASE + input, {
    method,
    body:
      body && !isFormData && typeof body === "object"
        ? JSON.stringify(body)
        : body,
    headers: headerMap as HeadersInit,
    credentials: "include",
    signal: AbortSignal.timeout(1000 * 60 * 10),
  });

  const text = await resp.text();
  if (resp.ok) {
    try {
      return JSON.parse(text) as T;
    } catch (_) {
      return text as T;
    }
  }

  // Invalid/expired Bearer → hub 401 (not Cognito 302). Re-auth via SPA OIDC.
  if (resp.status === 401) {
    await redirectToSpaLogin();
  }

  throw new ApiError(
    text || resp.statusText || `Request failed with status ${resp.status}`,
    resp.status,
  );
};
