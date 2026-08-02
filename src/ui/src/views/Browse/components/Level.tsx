import { useEffect, useRef, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import api from "#/api";
import type { TaxonCounts } from "#/api/types";
import PageLoader from "#/components/PageLoader";

import styles from "../index.module.css";

const PAGE_SIZE = 25;
const numberFormatter = new Intl.NumberFormat();

type LevelProps = {
  slug: string;
  level: string;
  label: string;
  totalCount: number;
};

export function Level({ slug, level, label, totalCount }: LevelProps) {
  const [taxa, setTaxa] = useState<TaxonCounts>({});
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const taxaCount = Object.keys(taxa).length;

  async function loadTaxa(
    options: { append?: boolean; filter?: string; offset?: number } = {},
  ) {
    const append = options.append ?? false;
    const activeFilter = options.filter ?? filter;
    const offset = options.offset ?? (append ? taxaCount : 0);
    const currentRequest = ++requestId.current;

    setLoading(true);
    setError(null);

    try {
      const data = await api.search.taxonLevel(slug, level, {
        filter: activeFilter.trim() || undefined,
        max: PAGE_SIZE,
        offset,
      });

      if (currentRequest !== requestId.current) return;

      setTaxa((current) => (append ? { ...current, ...data } : data));
      setHasMore(Object.keys(data).length === PAGE_SIZE);
    } catch (_) {
      if (currentRequest === requestId.current) {
        setError("The taxa for this category could not be loaded.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const currentRequest = ++requestId.current;

    setTaxa({});
    setFilter("");
    setHasMore(false);
    setError(null);
    setLoading(true);

    api.search
      .taxonLevel(slug, level, {
        max: PAGE_SIZE,
        offset: 0,
      })
      .then((data) => {
        if (cancelled || currentRequest !== requestId.current) return;
        setTaxa(data);
        setHasMore(Object.keys(data).length === PAGE_SIZE);
      })
      .catch(() => {
        if (cancelled || currentRequest !== requestId.current) return;
        setError("The taxa for this category could not be loaded.");
      })
      .finally(() => {
        if (!cancelled && currentRequest === requestId.current) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, level]);

  const taxaEntries = Object.entries(taxa);

  return (
    <section className="pt-3" aria-live="polite">
      <div className={styles.resultsHeader}>
        <div>
          <h3 className="mb-1">{label}</h3>
          <p className="text-body-secondary mb-0">
            {numberFormatter.format(totalCount)} names
          </p>
        </div>

        <Form
          className={styles.filter}
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            loadTaxa({ offset: 0 });
          }}
        >
          <Form.Label htmlFor={`taxon-filter-${level}`} visuallyHidden>
            Filter names
          </Form.Label>
          <Form.Control
            id={`taxon-filter-${level}`}
            type="search"
            value={filter}
            placeholder="Name starting with…"
            autoComplete="off"
            onChange={(event) => setFilter(event.target.value)}
          />
          <Button type="submit" variant="primary">
            Filter
          </Button>
        </Form>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading && taxaEntries.length === 0 ? (
        <div className="py-5">
          <PageLoader />
        </div>
      ) : taxaEntries.length === 0 ? (
        <p className="text-body-secondary mb-0 py-4">
          No names match this category and filter.
        </p>
      ) : (
        <>
          <ul className={styles.taxa}>
            {taxaEntries.map(([name, count]) => (
              <li key={name} className={styles.taxon}>
                <span>{name}</span>
                <Badge bg="secondary" pill>
                  {numberFormatter.format(count)}
                </Badge>
              </li>
            ))}
          </ul>

          {hasMore && (
            <Button
              variant="outline-primary"
              disabled={loading}
              onClick={() => loadTaxa({ append: true })}
            >
              {loading && (
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                  aria-hidden="true"
                />
              )}
              View more
            </Button>
          )}
        </>
      )}
    </section>
  );
}
