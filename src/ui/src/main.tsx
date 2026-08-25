// Authentication
import type { User } from "oidc-client-ts";
import { AuthProvider } from "react-oidc-context";
// Application
import App from "./App";
import { userManager } from "./helpers/auth";
import { ALAProvider } from "./helpers/context/ALAProvider";
import { LocaleProvider } from "./helpers/context/LocaleProvider";
import router from "./Router";

function Main() {
  async function handleCallback(user: User | void) {
    // If there's a user, it's a sign-in callback
    if (user) {
      const targetUrl =
        (user?.state as { targetUrl: string })?.targetUrl || "/";
      await router.navigate(targetUrl, { replace: true });
    } else {
      window.history.replaceState({}, document.title, "/");
    }
  }

  return (
    <AuthProvider userManager={userManager} onSigninCallback={handleCallback}>
      <LocaleProvider>
        <ALAProvider>
          <App />
        </ALAProvider>
      </LocaleProvider>
    </AuthProvider>
  );
}

export default Main;
