import { faBook } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";
import { Col, Nav, Row, Table } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Navigate, NavLink, useParams } from "react-router";

import api from "#/api";
import { PageLoader, PageMessage, RichText } from "#/components";
import { EXPIRY, QUERY_KEYS } from "#/helpers/queryClient";

import styles from "./index.module.css";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

export function Component() {
  const intl = useIntl();
  const { slug, letter: letterParam } = useParams<{
    slug: string;
    letter?: string;
  }>();
  const letter = letterParam?.toLowerCase();
  const letterIsValid = Boolean(letter && LETTERS.includes(letter));

  const {
    data: glossaryData,
    isError: glossaryFailed,
    isPending: loading,
  } = useQuery({
    queryKey: QUERY_KEYS.glossary(slug ?? "", letter ?? ""),
    queryFn: () => api.opus.glossary(slug!, letter!),
    enabled: Boolean(slug) && letterIsValid,
    staleTime: EXPIRY.reference,
  });

  const glossary = glossaryFailed ? null : glossaryData;

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
          {loading ? (
            <div className={`${styles.panel} p-0`}>
              <div className="d-flex justify-content-center p-5">
                <PageLoader />
              </div>
            </div>
          ) : !glossary || glossary.items.length === 0 ? (
            <PageMessage icon={faBook}>
              <FormattedMessage
                id="view.glossary.empty"
                values={{
                  letter: <b>{letter.toUpperCase()}</b>,
                }}
              />
            </PageMessage>
          ) : (
            <div className={`${styles.panel} p-0`}>
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
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}
