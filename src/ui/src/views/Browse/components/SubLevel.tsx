import { useEffect, useRef, useState } from "react";
import Badge from "react-bootstrap/Badge";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import api from "#/api";
import type { TaxonNameResult } from "#/api/types";
import { estimatePageItemCount } from "#/helpers/utils/estimatePageItemCount";

import { PaginationBar } from "./PaginationBar";
import styles from "./SubLevel.module.css";
import { TaxaSkeleton } from "./TaxaSkeleton";

const PAGE_SIZE = 25;

type SubLevelProps = {
  slug: string;
  level: string;
  scientificName: string;
  totalCount: number;
};

export function SubLevel({
  slug,
  level,
  scientificName,
  totalCount,
}: SubLevelProps) {
  const [items, setItems] = useState<TaxonNameResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const skeletonCount = estimatePageItemCount(totalCount, page, PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestId.current;
    const offset = (page - 1) * PAGE_SIZE;

    setLoading(true);
    setError(false);

    async function load() {
      try {
        const data = await api.search.taxonName(slug, {
          scientificName,
          taxon: level,
          max: PAGE_SIZE,
          offset,
        });
        if (cancelled || currentRequest !== requestId.current) return;
        setItems(data);
      } catch (_) {
        if (cancelled || currentRequest !== requestId.current) return;
        setError(true);
        setItems([]);
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, level, scientificName, page]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset page when the selected taxon changes
  useEffect(() => {
    setPage(1);
  }, [slug, level, scientificName]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <FormattedMessage id="view.browse.level.children.error.loadFailed" />
      </div>
    );
  }

  if (loading && items.length === 0) {
    return <TaxaSkeleton count={skeletonCount} />;
  }

  if (items.length === 0) {
    return (
      <p className="text-body-secondary mb-0 py-4">
        <FormattedMessage id="view.browse.level.children.empty" />
      </p>
    );
  }

  return (
    <>
      <div className={styles.taxa} aria-busy={loading}>
        {items.map((item) => {
          const profileTarget =
            item.profileId || item.scientificName || item.name;
          return (
            <Link
              key={item.profileId || item.guid || item.name}
              to={`/opus/${slug}/profile/${encodeURIComponent(profileTarget)}`}
              className={styles.taxonResult}
            >
              <span className={styles.taxonResultName}>
                {item.scientificName || item.name}
              </span>
              {item.rank && (
                <Badge bg="secondary" pill>
                  {item.rank}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      <PaginationBar
        page={page}
        totalPages={totalPages}
        loading={loading}
        onPageChange={setPage}
      />
    </>
  );
}
