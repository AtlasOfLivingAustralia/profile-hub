import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { FormattedMessage, useIntl } from "react-intl";
import { Navigate, NavLink, useParams } from "react-router";

import api from "#/api";
import type { Glossary } from "#/api/types";
import PageLoader from "#/components/PageLoader";
import { RichText } from "#/components/RichText";

import styles from "./index.module.css";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export function Component() {
  const intl = useIntl();
  const { slug, letter: letterParam } = useParams<{
    slug: string;
    letter?: string;
  }>();
  const letter = letterParam?.toLowerCase();
  const [glossary, setGlossary] = useState<Glossary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !letter) return;

    const opusSlug = slug;
    const prefix = letter;
    let cancelled = false;

    async function fetchGlossary() {
      setLoading(true);
      try {
        const data = await api.opus.glossary(opusSlug, prefix);

        if (!cancelled) {
          setGlossary(data);
        }
      } catch (_) {
        if (!cancelled) setGlossary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGlossary();

    return () => {
      cancelled = true;
    };
  }, [slug, letter]);

  if (!slug || !letter || !LETTERS.includes(letter)) {
    return <Navigate to={`/opus/${slug}/glossary/a`} replace />;
  }

  return (
    <div className="vstack gap-4">
      <h2>
        <FormattedMessage id="view.glossary.title" />
      </h2>

      <Row className="g-4">
        <Col xs={12} md="auto">
          <nav
            aria-label={intl.formatMessage({
              id: "view.glossary.index.ariaLabel",
            })}
            className={styles.panel}
          >
            <Nav className={styles.index} variant="pills">
              {LETTERS.map((item) => (
                <Nav.Item key={item}>
                  <Nav.Link as={NavLink} to={`/opus/${slug}/glossary/${item}`}>
                    {item}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </nav>
        </Col>

        <Col xs={12} md>
          <div className={`${styles.panel} p-0`}>
            {loading ? (
              <div className="d-flex justify-content-center p-5">
                <PageLoader />
              </div>
            ) : !glossary || glossary.items.length === 0 ? (
              <p className="text-body-secondary mb-0 p-4">
                <FormattedMessage
                  id="view.glossary.empty"
                  values={{
                    letter: <b>{letter.toUpperCase()}</b>,
                  }}
                />
              </p>
            ) : (
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th className="p-3" scope="col">
                      <FormattedMessage id="view.glossary.table.name" />
                    </th>
                    <th className="p-3" scope="col">
                      <FormattedMessage id="view.glossary.table.details" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {glossary.items.map((item) => (
                    <tr key={item.uuid}>
                      <td className="px-3">
                        <b>{item.term}</b>
                      </td>
                      <td className="px-3">
                        <RichText as="span" html={item.description} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
