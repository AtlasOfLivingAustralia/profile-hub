import { type ReactNode, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";

import {
  type AppLocale,
  getPreferredLocale,
  LOCALE_MESSAGES,
  setStoredLocale,
} from "#/helpers/locale";

import { LocaleContext } from "./LocaleContext";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(() =>
    typeof window === "undefined" ? "en" : getPreferredLocale(),
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: AppLocale) {
    setStoredLocale(next);
    setLocaleState(next);
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider
        locale={locale}
        defaultLocale="en"
        messages={LOCALE_MESSAGES[locale]}
      >
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}
