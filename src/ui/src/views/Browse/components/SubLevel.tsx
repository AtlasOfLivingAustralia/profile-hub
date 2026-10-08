import {
  faFolderOpen,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { Link } from "react-router";

import api, { type TaxonNameResult } from "#/api";
import { PageMessage, PaginationBar } from "#/components";
import { EXPIRY, QUERY_KEYS } from "#/helpers/queryClient";
import { estimatePageItemCount } from "#/helpers/utils/estimatePageItemCount";

import styles from "./SubLevel.module.css";
import { TaxaSkeleton } from "./TaxaSkeleton";

const PAGE_SIZE = 25;

type SubLevelProps = {
  slug: string;
  level: string;
  scientificName: string;
  totalCount: number;
  filter?: string;
};

type BrowseProfile = {
  key: string;
  name: string;
  rank?: string;
  profileId?: string | null;
};

function toBrowseProfile(item: TaxonNameResult): BrowseProfile {
  return {
    key: item.profileId || item.guid || item.name,
    name: item.scientificName || item.name,
    rank: item.rank,
    profileId: item.profileId,
  };
}

type BrowsePage = {
  items: BrowseProfile[];
  total: number;
};

export function SubLevel({
  slug,
  level,
  scientificName,
  totalCount,
  filter = "",
}: SubLevelProps) {
  const [page, setPage] = useState(1);
  const [trackedFilter, setTrackedFilter] = useState(filter);
  if (filter !== trackedFilter) {
    setTrackedFilter(filter);
    setPage(1);
  }

  const searching = filter.length > 0;

  const {
    data: itemsData,
    isError: error,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: QUERY_KEYS.taxonName(slug, level, scientificName, page, filter),
    queryFn: async (): Promise<BrowsePage> => {
      const profiles = await api.search.taxonName(slug, {
        scientificName,
        taxon: level,
        immediateChildrenOnly: false,
        max: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        filter: searching ? filter : undefined,
      });
      return {
        total: searching ? profiles.length : totalCount,
        items: profiles.map(toBrowseProfile),
      };
    },
    placeholderData: keepPreviousData,
    staleTime: EXPIRY.reference,
  });

  const pageResult = error
    ? { items: [], total: 0 }
    : (itemsData ?? { items: [], total: 0 });
  const items = pageResult.items;
  const loading = isPending || isFetching;
  const pageIsFull = items.length === PAGE_SIZE;
  const totalPages = searching
    ? Math.max(1, pageIsFull ? page + 1 : page)
    : Math.max(1, Math.ceil(pageResult.total / PAGE_SIZE));
  const skeletonCount = searching
    ? PAGE_SIZE
    : estimatePageItemCount(totalCount, page, PAGE_SIZE);

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
      <PageMessage icon={searching ? faMagnifyingGlass : faFolderOpen}>
        <FormattedMessage
          id={
            searching
              ? "view.browse.level.empty"
              : "view.browse.level.children.empty"
          }
        />
      </PageMessage>
    );
  }

  return (
    <>
      <div className={styles.taxa} aria-busy={loading}>
        {items.map((item) => {
          const profileTarget = item.profileId || item.name;
          return (
            <Link
              key={item.key}
              to={`/opus/${slug}/profile/${encodeURIComponent(profileTarget)}`}
              className={styles.taxonResult}
            >
              <span className={styles.taxonResultName}>{item.name}</span>
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
        disableLast={searching}
        onPageChange={setPage}
      />
    </>
  );
}
