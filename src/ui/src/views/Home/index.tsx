import { useEffect, useState } from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import api from "#/api";
import type { Collection } from "#/api/types";

import { CollectionCard } from "./components/CollectionCard";
import { Search } from "./components/Search";
import styles from "./index.module.css";

function Home() {
  const [collections, setCollections] = useState<Collection[] | null>(null);

  useEffect(() => {
    async function fetchCollections() {
      try {
        setCollections(await api.opus.list());
      } catch (_) {}
    }

    fetchCollections();
  }, []);

  const collectionCount = collections?.length;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <Container className={styles.heroInner}>
          <h1 id="home-title" className={styles.title}>
            Profile Collections
          </h1>
          <p className={styles.lede}>
            Discover authoritative species profiles across curated flora and
            fauna.
            {typeof collectionCount === "number" && (
              <span className={styles.count}>
                {" "}
                {collectionCount}{" "}
                {collectionCount === 1 ? "collection" : "collections"} available
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
          <h3 className="text-body-secondary">Browse by collection</h3>
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
        </div>
      </Container>
    </>
  );
}

export default Home;
