import styles from "./RichText.module.css";

export function RichText({ html }: { html?: string | null }) {
  if (!html?.trim()) return null;

  return (
    <div
      className={styles.richText}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Needed for rich text HTML formatting
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
