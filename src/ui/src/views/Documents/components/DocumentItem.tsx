import {
  faArrowUpRightFromSquare,
  faDownload,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormattedMessage, useIntl } from "react-intl";

import type { Attachment } from "#/api/types";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";

import styles from "./DocumentItem.module.css";

function formatCreatedDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function attachmentHref(attachment: Attachment, slug: string): string | null {
  if (attachment.url?.trim()) return attachment.url.trim();

  if (attachment.downloadUrl?.trim()) {
    return resolveMediaUrl(attachment.downloadUrl) ?? attachment.downloadUrl;
  }

  if (!attachment.uuid) return null;

  return (
    resolveMediaUrl(
      `/opus/${encodeURIComponent(slug)}/attachment/${encodeURIComponent(attachment.uuid)}/download`,
    ) ?? null
  );
}

export function DocumentItem({
  attachment,
  slug,
}: {
  attachment: Attachment;
  slug: string;
}) {
  const intl = useIntl();
  const href = attachmentHref(attachment, slug);
  const isExternal = Boolean(attachment.url?.trim());
  const createdDate = formatCreatedDate(attachment.createdDate);
  const licenceIcon = resolveMediaUrl(attachment.licenceIcon);
  const downloadHref =
    !isExternal && href
      ? href
      : attachment.downloadUrl
        ? (resolveMediaUrl(attachment.downloadUrl) ?? attachment.downloadUrl)
        : null;

  return (
    <article className={styles.item}>
      <div className={styles.main}>
        <div className={styles.icon} aria-hidden="true">
          <FontAwesomeIcon
            icon={isExternal ? faArrowUpRightFromSquare : faFilePdf}
          />
        </div>

        <div className={styles.body}>
          <h3 className={styles.title}>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer">
                {attachment.title}
              </a>
            ) : (
              attachment.title
            )}
          </h3>

          {attachment.description && (
            <p className={styles.description}>{attachment.description}</p>
          )}

          {(attachment.creator || attachment.rightsHolder || createdDate) && (
            <p className={styles.citation}>
              {attachment.creator && <span>{attachment.creator}</span>}
              {createdDate && (
                <span>
                  {attachment.creator ? ", " : ""}
                  {createdDate}
                </span>
              )}
              {attachment.rightsHolder && (
                <span> (&copy; {attachment.rightsHolder})</span>
              )}
            </p>
          )}
        </div>
      </div>

      {(downloadHref || licenceIcon) && (
        <div className={styles.actions}>
          {downloadHref && (
            <a
              href={downloadHref}
              target="_blank"
              rel="noreferrer"
              className={styles.download}
            >
              <FontAwesomeIcon icon={faDownload} />
              <FormattedMessage id="view.documents.action.download" />
            </a>
          )}
          {licenceIcon && (
            <img
              src={licenceIcon}
              alt={
                attachment.licence ||
                intl.formatMessage({ id: "view.documents.licence.alt" })
              }
              title={attachment.licence || undefined}
              className={styles.licenceIcon}
            />
          )}
        </div>
      )}
    </article>
  );
}
