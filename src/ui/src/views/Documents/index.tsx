import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext, useParams } from "react-router";

import api from "#/api";
import type { Attachment } from "#/api/types";
import PageLoader from "#/components/PageLoader";

import type { CollectionOutletContext } from "../Collection";
import { DocumentItem } from "./components/DocumentItem";
import styles from "./index.module.css";

function groupByCategory(attachments: Attachment[]): {
  category: string | null;
  items: Attachment[];
}[] {
  const groups = new Map<string | null, Attachment[]>();

  for (const attachment of attachments) {
    const category = attachment.category?.trim() || null;
    const existing = groups.get(category);
    if (existing) {
      existing.push(attachment);
    } else {
      groups.set(category, [attachment]);
    }
  }

  return [...groups.entries()].map(([category, items]) => ({
    category,
    items,
  }));
}

export function Component() {
  const intl = useIntl();
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const opusSlug = slug;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const data = await api.opus.attachments(opusSlug);
        if (!cancelled) {
          setAttachments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) {
          setAttachments(null);
          setError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const groups = useMemo(
    () => groupByCategory(attachments ?? []),
    [attachments],
  );

  const documentTitle = intl.formatMessage(
    { id: "view.documents.documentTitle" },
    { name: collection.title },
  );

  return (
    <div className="vstack gap-4">
      <title>{documentTitle}</title>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <FormattedMessage id="view.documents.title" />
        </h1>
        <p className={styles.lede}>
          <FormattedMessage id="view.documents.lede" />
        </p>
      </header>

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <PageLoader />
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-0">
          <FormattedMessage id="view.documents.error.loadFailed" />
        </Alert>
      ) : !attachments || attachments.length === 0 ? (
        <div className={`${styles.panel} py-4`}>
          <p className="text-body-secondary mb-0">
            <FormattedMessage id="view.documents.empty" />
          </p>
        </div>
      ) : (
        <div className="vstack gap-4">
          {groups.map(({ category, items }) => (
            <section
              key={category ?? "uncategorised"}
              className={styles.panel}
              aria-labelledby={
                category
                  ? `documents-category-${category}`
                  : "documents-uncategorised"
              }
            >
              {category ? (
                <h2
                  id={`documents-category-${category}`}
                  className={styles.categoryTitle}
                >
                  {category}
                </h2>
              ) : groups.length > 1 ? (
                <h2
                  id="documents-uncategorised"
                  className={styles.categoryTitle}
                >
                  <FormattedMessage id="view.documents.category.other" />
                </h2>
              ) : null}

              <div className={styles.list}>
                {items.map((attachment) => (
                  <DocumentItem
                    key={attachment.uuid}
                    attachment={attachment}
                    slug={slug!}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
