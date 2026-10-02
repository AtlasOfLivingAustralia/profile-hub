import { useQuery } from "@tanstack/react-query";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { Link } from "react-router";

import api from "#/api";
import { getErrorMessage } from "#/helpers";
import { useALA } from "#/helpers/context/useALA";
import { queryKeys, STALE } from "#/helpers/queryClient";

import { CollectionCard } from "./components/CollectionCard";
import { Search } from "./components/Search";
import styles from "./index.module.css";

function Home() {
  const intl = useIntl();
  const { isAdmin } = useALA();
  const collectionsQuery = useQuery({
    queryKey: queryKeys.opusList,
    queryFn: async () => {
      const data = await api.opus.list();
      return Array.isArray(data) ? data : [];
    },
    staleTime: STALE.reference,
  });

  const collections = collectionsQuery.data;
  const error = collectionsQuery.error;
  const collectionCount = collections?.length;

  return (
    <>
      <section className={styles.hero} aria-labelledby="home-title">
        <Container className={styles.heroInner}>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
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
            </div>
            {isAdmin && (
              <Link to="/opus/create" className="btn btn-secondary">
                <FormattedMessage id="view.home.createCollection" />
              </Link>
            )}
          </div>
          <div className="mt-5">
            <Search slug={null} size="lg" />
          </div>
        </Container>
      </section>

      <Container className="pb-5">
        <div className="vstack gap-4">
          <h2 className="text-body-secondary">
            <FormattedMessage id="view.home.browseByCollection" />
          </h2>
          {error && !collections ? (
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
