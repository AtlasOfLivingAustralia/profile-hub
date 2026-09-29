import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import api from "#/api";
import type { ProfileSearchItem, ProfileSearchResult } from "#/api/types";
import PageLoader from "#/components/PageLoader";
import { getErrorMessage } from "#/helpers";
import {
  isSearchType,
  profilePath,
  searchOptionsForType,
  searchPath,
  SearchTypes,
  type SearchType,
} from "#/helpers/searchOptions";
import { PaginationBar } from "#/views/Browse/components/PaginationBar";
import { Search } from "#/views/Home/components/Search";

import styles from "./index.module.css";

const PAGE_SIZE = 25;

export function Component() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();

  const term = (searchParams.get("term") ?? "").trim();
  const typeParam = searchParams.get("type");
  const type: SearchType = isSearchType(typeParam)
    ? typeParam
    : SearchTypes.scientificName;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [result, setResult] = useState<ProfileSearchResult | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [matchAll, setMatchAll] = useState(true);
  const [hideStubs, setHideStubs] = useState(true);

  const options = useMemo(
    () =>
      searchOptionsForType(type, {
        matchAll,
        hideStubs,
        pageSize: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
    [type, matchAll, hideStubs, page],
  );

  useEffect(() => {
    if (!term) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.search.profiles(term, {
          ...options,
          opusId: slug,
        });
        if (cancelled) return;
        setResult({
          total: data?.total ?? 0,
          items: Array.isArray(data?.items) ? data.items : [],
        });
      } catch (err) {
        if (cancelled) return;
        setResult(null);
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [term, options, slug]);

  function navigateSearch(next: {
    term: string;
    type: SearchType;
    page?: number;
  }) {
    const path = searchPath({
      term: next.term,
      type: next.type,
      slug,
    });
    const params = new URLSearchParams(path.split("?")[1] ?? "");
    if (next.page && next.page > 1) {
      params.set("page", String(next.page));
    }
    navigate(`${path.split("?")[0]}?${params.toString()}`);
  }

  const totalPages = result
    ? Math.max(1, Math.ceil(result.total / PAGE_SIZE))
    : 1;
  const showCollectionColumn = !slug;

  const content = (
    <div className="vstack gap-4">
      <div>
        <h1 className={styles.title}>
          <FormattedMessage id="view.search.title" />
        </h1>
        <Search
          key={`${term}-${type}`}
          slug={slug}
          initialTerm={term}
          initialType={type}
          size="lg"
          onSearch={(nextTerm, nextType) =>
            navigateSearch({ term: nextTerm, type: nextType, page: 1 })
          }
        />
        <div className={`mt-3 ${styles.options}`}>
          {!options.nameOnly && (
            <Form.Check
              id="search-match-all"
              type="checkbox"
              checked={matchAll}
              onChange={(event) => {
                setMatchAll(event.target.checked);
                if (page > 1 && term) {
                  navigateSearch({ term, type, page: 1 });
                }
              }}
              label={intl.formatMessage({ id: "view.search.option.matchAll" })}
            />
          )}
          <Form.Check
            id="search-hide-stubs"
            type="checkbox"
            checked={hideStubs}
            onChange={(event) => {
              setHideStubs(event.target.checked);
              if (page > 1 && term) {
                navigateSearch({ term, type, page: 1 });
              }
            }}
            label={intl.formatMessage({ id: "view.search.option.hideStubs" })}
          />
        </div>
      </div>

      {loading && <PageLoader />}

      {error != null && (
        <Alert variant="danger" className="mb-0">
          {getErrorMessage(error, intl)}
        </Alert>
      )}

      {!loading && !error && term && result && result.items.length === 0 && (
        <p className="text-body-secondary mb-0">
          <FormattedMessage id="view.search.empty" />
        </p>
      )}

      {!loading && !error && result && result.items.length > 0 && (
        <>
          <p className="text-body-secondary mb-0">
            <FormattedMessage
              id="view.search.summary"
              values={{
                from: options.offset! + 1,
                to: options.offset! + result.items.length,
                total: result.total,
              }}
            />
          </p>
          <div className="vstack gap-0">
            {result.items.map((item) => (
              <SearchResultRow
                key={item.uuid}
                item={item}
                showCollection={showCollectionColumn}
              />
            ))}
          </div>
          <PaginationBar
            page={page}
            totalPages={totalPages}
            loading={loading}
            onPageChange={(nextPage) =>
              navigateSearch({ term, type, page: nextPage })
            }
          />
        </>
      )}
    </div>
  );

  // Collection-scoped search sits inside Collection's Container; global search needs its own.
  if (slug) {
    return content;
  }

  return <Container className="py-5">{content}</Container>;
}

function SearchResultRow({
  item,
  showCollection,
}: {
  item: ProfileSearchItem;
  showCollection: boolean;
}) {
  const to = profilePath(item);
  const otherNames = item.otherNames?.map((name) => name.text).filter(Boolean);
  const descriptions = item.description
    ?.map((description) => description.text)
    .filter(Boolean);

  return (
    <Row className={`g-3 py-3 ${styles.resultRow}`}>
      <Col
        md={showCollection ? 8 : 10}
        className="d-flex flex-column justify-content-center"
      >
        <h2 className={styles.resultTitle}>
          <Link to={to}>{item.scientificName}</Link>
          {item.nameAuthor ? (
            <span className={styles.author}> {item.nameAuthor}</span>
          ) : null}
        </h2>
        {item.rank && (
          <div className="small text-body-secondary">({item.rank})</div>
        )}
        {otherNames && otherNames.length > 0 && (
          <div className="small mt-1">{otherNames.join(", ")}</div>
        )}
        {descriptions && descriptions.length > 0 && (
          <div className={`small text-body-secondary mt-1 ${styles.snippet}`}>
            {descriptions.join(" ")}
          </div>
        )}
        {item.profileStatus === "Empty" && (
          <Alert variant="info" className="mt-2 mb-0 py-2">
            <FormattedMessage id="view.search.stub" />
          </Alert>
        )}
      </Col>
      {showCollection && (
        <Col md={4} className="d-flex align-items-center">
          <span className="text-body-secondary">{item.opusName}</span>
        </Col>
      )}
    </Row>
  );
}
