import { faImage, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Container from "react-bootstrap/Container";
import Placeholder from "react-bootstrap/Placeholder";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";

import api from "#/api";
import type { ProfileSearchItem, ProfileSearchResult } from "#/api/types";
import PageMessage from "#/components/PageMessage";
import { getErrorMessage } from "#/helpers";
import {
  isSearchType,
  profilePath,
  type SearchType,
  SearchTypes,
  searchOptionsForType,
  searchPath,
} from "#/helpers/searchOptions";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";
import { PaginationBar } from "#/views/Browse/components/PaginationBar";
import { Search } from "#/views/Home/components/Search";

import styles from "./index.module.css";

const PAGE_SIZE = 25;
const RESULT_SKELETON_COUNT = 6;
const SKELETON_TITLE_WIDTHS = ["48%", "36%", "55%", "32%", "44%", "40%"];

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
  const [loading, setLoading] = useState(true);
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
          slug={slug}
          size={slug ? undefined : "lg"}
          initialTerm={term}
          initialType={type}
          onSearch={(nextTerm, nextType) =>
            navigateSearch({ term: nextTerm, type: nextType, page: 1 })
          }
        />
        <div className={`mt-3 ${styles.options}`}>
          {!options.nameOnly && (
            <SearchOption
              id="search-match-all"
              checked={matchAll}
              label={intl.formatMessage({ id: "view.search.option.matchAll" })}
              onChange={(checked) => {
                setMatchAll(checked);
                if (page > 1) {
                  navigateSearch({ term, type, page: 1 });
                }
              }}
            />
          )}
          <SearchOption
            id="search-hide-stubs"
            checked={hideStubs}
            label={intl.formatMessage({ id: "view.search.option.hideStubs" })}
            onChange={(checked) => {
              setHideStubs(checked);
              if (page > 1) {
                navigateSearch({ term, type, page: 1 });
              }
            }}
          />
        </div>
      </div>

      {((loading && error == null) ||
        (!loading && error == null && result && result.items.length > 0)) && (
        <p className="text-body-secondary mb-0">
          <FormattedMessage
            id="view.search.summary"
            values={{
              from: (
                <SummaryFigure
                  value={loading || !result ? undefined : options.offset! + 1}
                />
              ),
              to: (
                <SummaryFigure
                  value={
                    loading || !result
                      ? undefined
                      : options.offset! + result.items.length
                  }
                />
              ),
              total: (
                <SummaryFigure
                  value={loading || !result ? undefined : result.total}
                />
              ),
            }}
          />
        </p>
      )}

      {loading && !error && (
        <SearchResultsSkeleton
          count={RESULT_SKELETON_COUNT}
          showCollection={showCollectionColumn}
        />
      )}

      {error != null && (
        <Alert variant="danger" className="mb-0">
          {getErrorMessage(error, intl)}
        </Alert>
      )}

      {!loading && !error && result && result.items.length === 0 && (
        <PageMessage icon={faSearch}>
          <FormattedMessage id="view.search.empty" />
        </PageMessage>
      )}

      {!loading && !error && result && result.items.length > 0 && (
        <>
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

function SearchOption({
  id,
  checked,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={styles.option} data-checked={checked}>
      <input
        id={id}
        className={styles.optionInput}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryFigure({ value }: { value?: number }) {
  if (value == null) {
    return (
      <Placeholder animation="glow" className={styles.summaryFigure}>
        <Placeholder className={`rounded-pill ${styles.summaryNumber}`} />
      </Placeholder>
    );
  }

  return value;
}

function SearchResultsSkeleton({
  count,
  showCollection,
}: {
  count: number;
  showCollection: boolean;
}) {
  return (
    <div className="vstack gap-0" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={styles.resultRow}>
          <div className={styles.thumbFrame}>
            <div className={styles.thumb}>
              <Placeholder animation="glow" className={styles.thumbSkeleton}>
                <Placeholder className={styles.thumbSkeletonBlock} />
              </Placeholder>
            </div>
          </div>
          <div className={styles.resultMain}>
            <Placeholder animation="glow" className={styles.skeletonLines}>
              <Placeholder
                className={`rounded-pill ${styles.skeletonTitle}`}
                style={{
                  width:
                    SKELETON_TITLE_WIDTHS[index % SKELETON_TITLE_WIDTHS.length],
                }}
              />
              <Placeholder className={`rounded-pill ${styles.skeletonMeta}`} />
            </Placeholder>
          </div>
          {showCollection && (
            <div className={styles.resultOpus}>
              <Placeholder animation="glow">
                <Placeholder className={`rounded-pill ${styles.skeletonOpus}`} />
              </Placeholder>
            </div>
          )}
        </div>
      ))}
    </div>
  );
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
    <article className={styles.resultRow}>
      <SearchResultImage
        opusId={item.opusId}
        profileId={item.uuid}
        to={to}
        name={item.scientificName}
      />
      <div className={styles.resultMain}>
        <h2 className={styles.resultTitle}>
          <Link to={to} style={{ fontStyle: "italic" }}>
            {item.scientificName}
          </Link>
          {item.nameAuthor ? (
            <span className={styles.author}> {item.nameAuthor}</span>
          ) : null}
        </h2>
        {item.rank && (
          <div className="small text-body-secondary">{item.rank}</div>
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
      </div>
      {showCollection && (
        <div className={styles.resultOpus}>{item.opusName}</div>
      )}
    </article>
  );
}

function SearchResultImage({
  opusId,
  profileId,
  to,
  name,
}: {
  opusId: string;
  profileId: string;
  to: string;
  name: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"pending" | "loading" | "done">(
    "pending",
  );
  const [src, setSrc] = useState<string | undefined>();

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => setStatus("loading"), 100);
      },
      { rootMargin: "200px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (status !== "loading") return;

    let cancelled = false;

    async function load() {
      try {
        const image = await api.profile.primaryImage(opusId, profileId);
        if (cancelled) return;
        setSrc(resolveMediaUrl(image?.thumbnailUrl));
      } catch {
        if (!cancelled) setSrc(undefined);
      } finally {
        if (!cancelled) setStatus("done");
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [status, opusId, profileId]);

  return (
    <div ref={frameRef} className={styles.thumbFrame}>
      <Link to={to} className={styles.thumb} aria-label={name}>
        {src ? (
          <img src={src} alt="" onError={() => setSrc(undefined)} />
        ) : status === "done" ? (
          <FontAwesomeIcon icon={faImage} />
        ) : (
          <Placeholder animation="glow" className={styles.thumbSkeleton}>
            <Placeholder className={styles.thumbSkeletonBlock} />
          </Placeholder>
        )}
      </Link>
    </div>
  );
}
