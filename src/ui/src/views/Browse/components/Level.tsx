import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { Badge, Button, Form } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";

import api from "#/api";
import { PageMessage, PaginationBar } from "#/components";
import { queryKeys, STALE } from "#/helpers/queryClient";
import { estimatePageItemCount } from "#/helpers/utils/estimatePageItemCount";

import styles from "./Level.module.css";
import { SubLevel } from "./SubLevel";
import { TaxaSkeleton } from "./TaxaSkeleton";

const PAGE_SIZE = 25;
const FILTER_DEBOUNCE_MS = 300;
const numberFormatter = new Intl.NumberFormat();

type LevelProps = {
  slug: string;
  level: string;
  label: string;
  totalCount: number;
};

type SelectedTaxon = {
  name: string;
  count: number;
};

export function Level({ slug, level, label, totalCount }: LevelProps) {
  const intl = useIntl();
  const [filter, setFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [childFilter, setChildFilter] = useState("");
  const [appliedChildFilter, setAppliedChildFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SelectedTaxon | null>(null);

  const taxaQuery = useQuery({
    queryKey: queryKeys.taxonLevel(slug, level, appliedFilter, page),
    queryFn: () =>
      api.search.taxonLevel(slug, level, {
        filter: appliedFilter || undefined,
        max: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    placeholderData: keepPreviousData,
    staleTime: STALE.reference,
  });

  const taxa = taxaQuery.isError ? {} : (taxaQuery.data ?? {});
  const loading = taxaQuery.isPending || taxaQuery.isFetching;
  const error = taxaQuery.isError;
  const pageIsFull = Object.keys(taxa).length === PAGE_SIZE;
  const filtered = appliedFilter.length > 0;

  const totalPages = filtered
    ? Math.max(1, pageIsFull ? page + 1 : page)
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const skeletonCount = filtered
    ? PAGE_SIZE
    : estimatePageItemCount(totalCount, page, PAGE_SIZE);

  // Reset list state when switching taxonomic level or collection.
  // biome-ignore lint/correctness/useExhaustiveDependencies: slug/level are intentional reset triggers
  useEffect(() => {
    setFilter("");
    setAppliedFilter("");
    setChildFilter("");
    setAppliedChildFilter("");
    setPage(1);
    setSelected(null);
  }, [slug, level]);

  // Apply the taxon filter as the user types. The list request already
  // depends on appliedFilter, so debouncing that value avoids one request
  // per keystroke. Skip while a taxon is open so a pending timer cannot
  // clear the child view.
  useEffect(() => {
    if (selected) return;

    const nextFilter = filter.trim();
    if (nextFilter === appliedFilter) return;

    const timer = window.setTimeout(() => {
      setPage(1);
      setAppliedFilter(nextFilter);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [filter, appliedFilter, selected]);

  function applyFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilter = filter.trim();
    setSelected(null);
    setPage(1);
    setAppliedFilter(nextFilter);
  }

  // A new taxon should start with an empty profile search.
  // biome-ignore lint/correctness/useExhaustiveDependencies: selected name is the reset trigger
  useEffect(() => {
    setChildFilter("");
    setAppliedChildFilter("");
  }, [selected?.name]);

  // Search the profiles under the open taxon without clearing that selection.
  useEffect(() => {
    if (!selected) return;

    const nextFilter = childFilter.trim();
    if (nextFilter === appliedChildFilter) return;

    const timer = window.setTimeout(() => {
      setAppliedChildFilter(nextFilter);
    }, FILTER_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [childFilter, appliedChildFilter, selected]);

  function applyChildFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedChildFilter(childFilter.trim());
  }

  const taxaEntries = Object.entries(taxa);
  const showingChildren = selected !== null;

  return (
    <section className="pt-3" aria-live="polite">
      <div className={styles.resultsHeader}>
        <div>
          <h3 className="mb-1">
            {selected ? (
              <nav
                className={styles.breadcrumb}
                aria-label={intl.formatMessage({
                  id: "view.browse.level.breadcrumb.ariaLabel",
                })}
              >
                <button
                  type="button"
                  className={styles.breadcrumbLink}
                  onClick={() => {
                    setSelected(null);
                    setChildFilter("");
                    setAppliedChildFilter("");
                  }}
                >
                  {label}
                </button>
                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                  &gt;
                </span>
                <span className={styles.breadcrumbCurrent}>
                  {selected.name}
                </span>
              </nav>
            ) : (
              label
            )}
          </h3>
          <p className="text-body-secondary mb-0">
            {intl.formatMessage(
              { id: "view.browse.level.namesCount" },
              {
                count: showingChildren ? selected.count : totalCount,
              },
            )}
          </p>
        </div>

        {showingChildren ? (
          <Form
            className={styles.filter}
            role="search"
            onSubmit={applyChildFilter}
          >
            <Form.Label htmlFor={`taxon-child-filter-${level}`} visuallyHidden>
              <FormattedMessage id="view.browse.level.filter.label" />
            </Form.Label>
            <Form.Control
              id={`taxon-child-filter-${level}`}
              type="search"
              value={childFilter}
              placeholder={intl.formatMessage({
                id: "view.browse.level.filter.placeholder",
              })}
              autoComplete="off"
              onChange={(event) => setChildFilter(event.target.value)}
            />
            <Button type="submit" variant="primary">
              <FormattedMessage id="view.browse.level.filter.submit" />
            </Button>
          </Form>
        ) : (
          <Form className={styles.filter} role="search" onSubmit={applyFilter}>
            <Form.Label htmlFor={`taxon-filter-${level}`} visuallyHidden>
              <FormattedMessage id="view.browse.level.filter.label" />
            </Form.Label>
            <Form.Control
              id={`taxon-filter-${level}`}
              type="search"
              value={filter}
              placeholder={intl.formatMessage({
                id: "view.browse.level.filter.placeholder",
              })}
              autoComplete="off"
              onChange={(event) => setFilter(event.target.value)}
            />
            <Button type="submit" variant="primary">
              <FormattedMessage id="view.browse.level.filter.submit" />
            </Button>
          </Form>
        )}
      </div>

      {error && !showingChildren && (
        <div className="alert alert-danger" role="alert">
          <FormattedMessage id="view.browse.level.error.loadFailed" />
        </div>
      )}

      {showingChildren ? (
        <SubLevel
          key={selected.name}
          slug={slug}
          level={level}
          scientificName={selected.name}
          totalCount={selected.count}
          filter={appliedChildFilter}
        />
      ) : loading && taxaEntries.length === 0 ? (
        <TaxaSkeleton count={skeletonCount} />
      ) : taxaEntries.length === 0 ? (
        <PageMessage icon={faMagnifyingGlass}>
          <FormattedMessage id="view.browse.level.empty" />
        </PageMessage>
      ) : (
        <>
          <div className={styles.taxa} aria-busy={loading}>
            {taxaEntries.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={styles.taxon}
                onClick={() => setSelected({ name, count })}
              >
                <span>{name}</span>
                <Badge bg="secondary" pill>
                  {numberFormatter.format(count)}
                </Badge>
              </button>
            ))}
          </div>

          <PaginationBar
            page={page}
            totalPages={totalPages}
            loading={loading}
            disableLast={filtered}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
