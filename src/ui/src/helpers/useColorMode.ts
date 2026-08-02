import { useEffect, useState } from "react";

import {
  applyTheme,
  getPreferredTheme,
  setStoredTheme,
  type ThemePreference,
} from "./theme";

export function useColorMode() {
  const [theme, setThemeState] = useState<ThemePreference>(() =>
    typeof window === "undefined" ? "auto" : getPreferredTheme(),
  );

  useEffect(() => {
    applyTheme(theme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (getPreferredTheme() === "auto") {
        applyTheme("auto");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function setTheme(next: ThemePreference) {
    setStoredTheme(next);
    setThemeState(next);
  }

  return { theme, setTheme };
}
