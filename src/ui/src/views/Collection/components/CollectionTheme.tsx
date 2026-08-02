import type { Theme } from "#/api/types";
import { buildCollectionThemeCss } from "#/helpers/collectionTheme";

type CollectionThemeProps = {
  theme: Theme;
};

/** Injects collection branding as a document stylesheet for this route tree. */
export function CollectionTheme({ theme }: CollectionThemeProps) {
  const css = buildCollectionThemeCss(theme);
  if (!css) return null;

  return <style>{css}</style>;
}
