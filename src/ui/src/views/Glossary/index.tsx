import { useEffect, useState } from "react";
import Col from "react-bootstrap/Col";
import Nav from "react-bootstrap/Nav";
import Row from "react-bootstrap/Row";
import Table from "react-bootstrap/Table";
import { NavLink, Navigate, useParams } from "react-router";

import api from "#/api";
import type { Glossary } from "#/api/types";
import PageLoader from "#/components/PageLoader";

import styles from "./index.module.css";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

function GlossaryDescription({ html }: { html: string }) {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Glossary descriptions include inline HTML formatting from the API
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Component() {
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
      <h2>Glossary</h2>

      <Row className="g-4">
        <Col xs={12} md="auto">
          <nav aria-label="Glossary index" className={styles.panel}>
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
                No glossary entries for this letter.
              </p>
            ) : (
              <Table responsive striped hover className="mb-0">
                <thead>
                  <tr>
                    <th className="p-3" scope="col">
                      Name
                    </th>
                    <th className="p-3" scope="col">
                      Details
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
                        <GlossaryDescription html={item.description} />
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
