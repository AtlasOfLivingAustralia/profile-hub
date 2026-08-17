import { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";

import api from "#/api";
import type { Collection } from "#/api/types";
import { getErrorMessage } from "#/helpers";

import { CollectionCard } from "./components/CollectionCard";
import { Search } from "./components/Search";
import styles from "./index.module.css";

function Home() {
  const intl = useIntl();
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCollections() {
      setError(null);
      try {
        const data = await api.opus.list();
        if (cancelled) return;
        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        setCollections(null);
        setError(err);
      }
    }

    fetchCollections();

    return () => {
      cancelled = true;
    };
  }, []);

  const collectionCount = collections?.length;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <Container className={styles.heroInner}>
          <h1 id="home-title" className={styles.title}>
            <FormattedMessage id="view.home.title" />
          </h1>
          <p className={styles.lede}>
            <FormattedMessage id="view.home.lede" />
            {typeof collectionCount === "number" && (
              <span className={styles.count}>
                {" "}
                {intl.formatMessage(
                  { id: "view.home.collectionCount" },
                  { count: collectionCount },
                )}
              </span>
            )}
          </p>
          <div className="mt-5">
            <Search />
          </div>
        </Container>
      </section>

      <Container className="pb-5">
        <div className="vstack gap-3">
          <h2 className="text-body-secondary">
            <FormattedMessage id="view.home.browseByCollection" />
          </h2>
          {error ? (
            <Alert variant="danger" className="mb-0">
              {getErrorMessage(error, intl)}
            </Alert>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {collections
                ? collections.map((collection) => (
                    <Col key={collection.uuid}>
                      <CollectionCard collection={collection} />
                    </Col>
                  ))
                : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((tempKey) => (
                    <Col key={tempKey}>
                      <CollectionCard collection={null} />
                    </Col>
                  ))}
            </Row>
          )}
        </div>
      </Container>
    </>
  );
}

export default Home;
