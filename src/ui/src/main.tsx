// Authentication
import type { User } from "oidc-client-ts";
import { AuthProvider } from "react-oidc-context";
import { ALAProvider } from "./helpers/context/ALAProvider";

// Internationalization
import { IntlProvider } from "react-intl";
import en from "./locale/en.json";

// Application
import App from "./App";
import router from "./Router";
import { userManager } from "./helpers/auth";

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
      <IntlProvider messages={en} locale="en">
        <ALAProvider>
          <App />
        </ALAProvider>
      </IntlProvider>
    </AuthProvider>
  );
}

export default Main;
