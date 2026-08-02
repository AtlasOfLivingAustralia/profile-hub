import { useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Col from "react-bootstrap/Col";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { useParams } from "react-router";

import api from "#/api";
import type { TaxonCounts } from "#/api/types";

import { Level } from "./components/Level";
import styles from "./index.module.css";

interface TaxonLevel {
  key: string;
  label: string;
  help?: string;
}

const TAXON_LEVELS = [
  { key: "kingdom", label: "Kingdom" },
  { key: "phylum", label: "Phylum" },
  { key: "class", label: "Class" },
  { key: "subclass", label: "Subclass" },
  { key: "order", label: "Order" },
  { key: "family", label: "Family" },
  { key: "genus", label: "Genus" },
  {
    key: "unknown",
    label: "Unknown rank",
    help: "Profiles that do not have a matched name",
  },
] as TaxonLevel[];

const numberFormatter = new Intl.NumberFormat();

export function Component() {
  const { slug } = useParams<{ slug: string }>();
  const [levels, setLevels] = useState<TaxonCounts | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLevels(null);
    setSelectedLevel(null);
    setError(null);

    api.search
      .taxonLevels(slug)
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLevels({});
          setError("The taxonomic categories could not be loaded.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const selected = TAXON_LEVELS.find(({ key }) => key === selectedLevel);

  return (
    <div className="vstack gap-4">
      <div>
        <h2>Browse by category</h2>
        <p className="text-body-secondary mb-0">
          Explore profiles through their taxonomic classification.
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          {error}
        </div>
      )}

      <Row className="g-4">
        <Col xs={12} md={4} lg={3}>
          <nav className={styles.panel} aria-label="Taxonomic categories">
            {!levels ? (
              <div className={styles.levels} aria-hidden="true">
                {TAXON_LEVELS.map(({ key }) => (
                  <div key={key} className={styles.levelButton}>
                    <Placeholder animation="glow" className="w-100">
                      <span
                        style={{ height: 24 }}
                        className="d-flex align-items-center justify-content-between gap-3"
                      >
                        <Placeholder
                          className="rounded-pill"
                          xs={key === "unknown" ? 7 : 5}
                        />
                        <Placeholder
                          className="rounded-pill"
                          style={{ width: "2.25rem" }}
                        />
                      </span>
                    </Placeholder>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.levels}>
                {TAXON_LEVELS.filter(({ key }) => (levels[key] ?? 0) > 0).map(
                  ({ key, label, help }) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.levelButton}
                      data-active={selectedLevel === key}
                      aria-pressed={selectedLevel === key}
                      title={help}
                      onClick={() => setSelectedLevel(key)}
                    >
                      <span>{label}</span>
                      <Badge bg="secondary" pill>
                        {numberFormatter.format(levels[key])}
                      </Badge>
                    </button>
                  ),
                )}
              </div>
            )}
          </nav>
        </Col>

        <Col xs={12} md={8} lg={9}>
          {!selectedLevel || !selected || !slug ? (
            <section className={styles.placeholder}>
              <div className={styles.emptyState}>
                <h3>Choose a category</h3>
                <p className="text-body-secondary mb-0">
                  Select a taxonomic rank to see the names available in this
                  collection.
                </p>
              </div>
            </section>
          ) : (
            <Level
              key={selectedLevel}
              slug={slug}
              level={selectedLevel}
              label={selected.label}
              totalCount={levels?.[selectedLevel] ?? 0}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
