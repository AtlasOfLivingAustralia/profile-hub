import { useEffect, useState } from "react";

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import api from "#/api";
import type { Collection } from "#/api/types";

import { CollectionCard } from "./components/CollectionCard";
import { Search } from "./components/Search";

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

  return (
    <Container className="py-5">
      <div className="vstack gap-3">
        <h2>Profile Collections</h2>
        <h3 className="text-body-secondary">Search for profiles</h3>
        <Search />
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
  );
}

export default Home;
