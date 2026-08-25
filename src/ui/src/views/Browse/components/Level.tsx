import { type FormEvent, useEffect, useRef, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FormattedMessage, useIntl } from "react-intl";

import api from "#/api";
import type { TaxonCounts } from "#/api/types";
import { estimatePageItemCount } from "#/helpers/utils/estimatePageItemCount";

import styles from "./Level.module.css";
import { PaginationBar } from "./PaginationBar";
import { SubLevel } from "./SubLevel";
import { TaxaSkeleton } from "./TaxaSkeleton";

const PAGE_SIZE = 25;
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
  const [taxa, setTaxa] = useState<TaxonCounts>({});
  const [filter, setFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<SelectedTaxon | null>(null);
  const [pageIsFull, setPageIsFull] = useState(false);
  const requestId = useRef(0);

  const filtered = appliedFilter.length > 0;
  const totalPages = filtered
    ? Math.max(1, pageIsFull ? page + 1 : page)
    : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const skeletonCount = filtered
    ? PAGE_SIZE
    : estimatePageItemCount(totalCount, page, PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestId.current;
    const offset = (page - 1) * PAGE_SIZE;

    setLoading(true);
    setError(false);

    async function load() {
      try {
        const data = await api.search.taxonLevel(slug, level, {
          filter: appliedFilter || undefined,
          max: PAGE_SIZE,
          offset,
        });
        if (cancelled || currentRequest !== requestId.current) return;
        setTaxa(data);
        setPageIsFull(Object.keys(data).length === PAGE_SIZE);
      } catch (_) {
        if (cancelled || currentRequest !== requestId.current) return;
        setError(true);
        setTaxa({});
        setPageIsFull(false);
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
  }, [slug, level, page, appliedFilter]);

  // Reset list state when switching taxonomic level or collection.
  // biome-ignore lint/correctness/useExhaustiveDependencies: slug/level are intentional reset triggers
  useEffect(() => {
    setFilter("");
    setAppliedFilter("");
    setPage(1);
    setSelected(null);
    setPageIsFull(false);
  }, [slug, level]);

  function applyFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFilter = filter.trim();
    setSelected(null);
    setPage(1);
    setAppliedFilter(nextFilter);
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
                  onClick={() => setSelected(null)}
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

        {!showingChildren && (
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
        />
      ) : loading && taxaEntries.length === 0 ? (
        <TaxaSkeleton count={skeletonCount} />
      ) : taxaEntries.length === 0 ? (
        <p className="text-body-secondary mb-0 py-4">
          <FormattedMessage id="view.browse.level.empty" />
        </p>
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
