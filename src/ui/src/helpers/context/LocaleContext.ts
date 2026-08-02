import { createContext } from "react";

import type { AppLocale } from "#/helpers/locale";

export type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const LocaleContext = createContext<LocaleContextValue | null>(null);
