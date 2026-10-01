import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import api from "#/api";
import PageMessage from "#/components/PageMessage";
import { queryKeys, STALE } from "#/helpers/queryClient";
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
  const [page, setPage] = useState(1);

  const itemsQuery = useQuery({
    queryKey: queryKeys.taxonName(slug, level, scientificName, page),
    queryFn: () =>
      api.search.taxonName(slug, {
        scientificName,
        taxon: level,
        max: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    staleTime: STALE.reference,
  });

  const items = itemsQuery.isError ? [] : (itemsQuery.data ?? []);
  const loading = itemsQuery.isPending || itemsQuery.isFetching;
  const error = itemsQuery.isError;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const skeletonCount = estimatePageItemCount(totalCount, page, PAGE_SIZE);

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
      <PageMessage icon={faFolderOpen}>
        <FormattedMessage id="view.browse.level.children.empty" />
      </PageMessage>
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
