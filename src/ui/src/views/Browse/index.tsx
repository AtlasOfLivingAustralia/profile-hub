import { useEffect, useState } from "react";
import Badge from "react-bootstrap/Badge";
import Col from "react-bootstrap/Col";
import Placeholder from "react-bootstrap/Placeholder";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { useParams } from "react-router";

import api from "#/api";
import type { TaxonCounts } from "#/api/types";

import { Level } from "./components/Level";
import styles from "./index.module.css";

interface TaxonLevel {
  key: string;
  labelId: string;
  helpId?: string;
}

const TAXON_LEVELS: TaxonLevel[] = [
  { key: "kingdom", labelId: "classification.kingdom" },
  { key: "phylum", labelId: "classification.phylum" },
  { key: "class", labelId: "classification.classs" },
  { key: "subclass", labelId: "classification.subclass" },
  { key: "order", labelId: "classification.order" },
  { key: "family", labelId: "classification.family" },
  { key: "genus", labelId: "classification.genus" },
  {
    key: "unknown",
    labelId: "classification.unknownRank",
    helpId: "classification.unknownRank.help",
  },
];

const numberFormatter = new Intl.NumberFormat();

export function Component() {
  const intl = useIntl();
  const { slug } = useParams<{ slug: string }>();
  const [levels, setLevels] = useState<TaxonCounts | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLevels(null);
    setSelectedLevel(null);
    setError(false);

    api.search
      .taxonLevels(slug)
      .then((data) => {
        if (!cancelled) setLevels(data);
      })
      .catch(() => {
        if (!cancelled) {
          setLevels({});
          setError(true);
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
        <h2>
          <FormattedMessage id="view.browse.title" />
        </h2>
        <p className="text-body-secondary mb-0">
          <FormattedMessage id="view.browse.subtitle" />
        </p>
      </div>

      {error && (
        <div className="alert alert-danger mb-0" role="alert">
          <FormattedMessage id="view.browse.error.categoriesLoadFailed" />
        </div>
      )}

      <Row className="g-4">
        <Col xs={12} md={4} lg={3}>
          <nav
            className={styles.panel}
            aria-label={intl.formatMessage({
              id: "view.browse.categories.ariaLabel",
            })}
          >
            {!levels ? (
              <div className={styles.levels} aria-hidden="true">
                {TAXON_LEVELS.map(({ key }) => (
                  <div key={key} className={styles.levelButton}>
                    <Placeholder animation="glow" className="w-100">
                      <span className={styles.levelSkeleton}>
                        <Placeholder
                          className="rounded-pill"
                          xs={key === "unknown" ? 7 : 5}
                        />
                        <Placeholder
                          className={`rounded-pill ${styles.levelSkeletonBadge}`}
                        />
                      </span>
                    </Placeholder>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.levels}>
                {TAXON_LEVELS.filter(({ key }) => (levels[key] ?? 0) > 0).map(
                  ({ key, labelId, helpId }) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.levelButton}
                      data-active={selectedLevel === key}
                      aria-pressed={selectedLevel === key}
                      title={
                        helpId ? intl.formatMessage({ id: helpId }) : undefined
                      }
                      onClick={() => setSelectedLevel(key)}
                    >
                      <span>
                        <FormattedMessage id={labelId} />
                      </span>
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
                <h3>
                  <FormattedMessage id="view.browse.empty.title" />
                </h3>
                <p className="text-body-secondary mb-0">
                  <FormattedMessage id="view.browse.empty.description" />
                </p>
              </div>
            </section>
          ) : (
            <Level
              key={selectedLevel}
              slug={slug}
              level={selectedLevel}
              label={intl.formatMessage({ id: selected.labelId })}
              totalCount={levels?.[selectedLevel] ?? 0}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
