import {
  faArrowUpRightFromSquare,
  faCheck,
  faList,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Button, Col, Form, Placeholder, Row } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext, useParams } from "react-router";

import api, { type SpeciesListSummary } from "#/api";
import { speciesListPageUrl } from "#/api/lists";
import { PageLoader, SearchableDropdown } from "#/components";
import { useALA } from "#/helpers/context/useALA";
import { invalidateFilteredReads, QUERY_KEYS } from "#/helpers/queryClient";
import {
  clearSpeciesListFilter,
  useSpeciesListFilter,
  writeSpeciesListFilter,
} from "#/helpers/speciesListFilter";

import type { CollectionOutletContext } from "../Collection";
import styles from "./index.module.css";

const LIST_STALE_TIME = 5 * 60 * 1000;

export function Component() {
  const intl = useIntl();
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const { userid, isAuthenticated } = useALA();
  const savedFilter = useSpeciesListFilter();
  const savedId = savedFilter?.listId ?? "";

  const [draftId, setDraftId] = useState(savedId);
  const [syncedSavedId, setSyncedSavedId] = useState(savedId);

  if (savedId !== syncedSavedId) {
    setSyncedSavedId(savedId);
    setDraftId(savedId);
  }

  const {
    data: lists = [],
    error: listsError,
    isPending: listsPending,
  } = useQuery({
    queryKey: [...QUERY_KEYS.profileLists, isAuthenticated ? userid : ""],
    queryFn: () => api.lists.profileLists(),
    staleTime: LIST_STALE_TIME,
  });

  const selected =
    lists.find((list) => list.dataResourceUid === draftId) ??
    (draftId ? { dataResourceUid: draftId, title: draftId } : null);

  const { data: detail, isPending: detailPending } = useQuery({
    queryKey: QUERY_KEYS.speciesList(draftId),
    queryFn: () => api.lists.speciesList(draftId),
    enabled: Boolean(draftId),
    staleTime: LIST_STALE_TIME,
  });

  function persist(listId: string) {
    if (!slug) return;
    if (listId) {
      writeSpeciesListFilter({
        listId,
        opusUuid: collection.uuid,
        userId: isAuthenticated ? userid : "",
      });
    } else {
      clearSpeciesListFilter();
    }
    invalidateFilteredReads();
  }

  function chooseList(list: SpeciesListSummary | null) {
    if (!list || list.dataResourceUid === draftId) return;
    const listId = list.dataResourceUid;
    setDraftId(listId);
    if (listId !== savedId) persist(listId);
  }

  const updated = detail?.lastUpdated ? new Date(detail.lastUpdated) : null;
  const updatedLabel =
    updated && !Number.isNaN(updated.getTime())
      ? intl.formatDate(updated, { dateStyle: "medium" })
      : detail?.lastUpdated;
  const cardTitle = detail?.title || selected?.title;

  return (
    <div className="vstack gap-4">
      <title>
        {intl.formatMessage(
          { id: "view.filter.documentTitle" },
          { name: collection.title },
        )}
      </title>
      <div>
        <h2>
          <FormattedMessage id="view.filter.title" />
        </h2>
      </div>

      {listsError && (
        <Alert variant="danger" className="mb-0">
          <FormattedMessage id="view.filter.error.loadFailed" />
        </Alert>
      )}

      {listsPending ? (
        <PageLoader />
      ) : (
        <Row className="g-4">
          <Col xs={12} lg={6}>
            {listsError ? (
              savedId && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  className={styles.clear}
                  onClick={() => {
                    persist("");
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                  <FormattedMessage id="view.filter.clear" />
                </Button>
              )
            ) : (
              <div>
                <Form.Group controlId="florulaListId">
                  <Form.Label>
                    <FormattedMessage id="view.filter.field.label" />
                  </Form.Label>
                  <div className={styles.picker}>
                    <SearchableDropdown
                      id="florulaListId"
                      options={lists}
                      value={selected}
                      onChange={chooseList}
                      getOptionKey={(list: SpeciesListSummary) =>
                        list.dataResourceUid
                      }
                      getOptionLabel={(list: SpeciesListSummary) =>
                        list.title || list.dataResourceUid
                      }
                      getOptionDescription={(list: SpeciesListSummary) =>
                        list.dataResourceUid
                      }
                      placeholder={intl.formatMessage({
                        id: "view.filter.field.placeholder",
                      })}
                      emptyMessage={
                        <FormattedMessage id="view.filter.noMatches" />
                      }
                    />
                    {selected && (
                      <Button
                        type="button"
                        variant="outline-secondary"
                        className={styles.clear}
                        onClick={() => {
                          setDraftId("");
                          persist("");
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                        <FormattedMessage id="view.filter.clear" />
                      </Button>
                    )}
                  </div>
                  <Form.Text className="d-block mt-2">
                    <FormattedMessage id="view.filter.field.help" />
                  </Form.Text>
                </Form.Group>
              </div>
            )}
          </Col>
          <Col xs={12} lg={6} className="d-flex">
            {selected ? (
              <article className={styles.card}>
                <p className={styles.status}>
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={styles.tick}
                    aria-hidden="true"
                  />
                  <FormattedMessage id="view.filter.status.selected" />
                </p>
                <h3 className={styles.title}>{cardTitle}</h3>
                <dl className={styles.meta}>
                  <div>
                    <dt>
                      <FormattedMessage id="view.filter.detail.author" />
                    </dt>
                    <dd>
                      {detailPending && !detail ? (
                        <Placeholder
                          animation="glow"
                          className={styles.skeleton}
                        >
                          <Placeholder xs={6} />
                        </Placeholder>
                      ) : (
                        detail?.author || "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>
                      <FormattedMessage id="view.filter.detail.updated" />
                    </dt>
                    <dd>
                      {detailPending && !detail ? (
                        <Placeholder
                          animation="glow"
                          className={styles.skeleton}
                        >
                          <Placeholder xs={4} />
                        </Placeholder>
                      ) : (
                        updatedLabel || "—"
                      )}
                    </dd>
                  </div>
                </dl>
                <div className={styles.footer}>
                  <a
                    className={styles.link}
                    href={speciesListPageUrl(selected.dataResourceUid)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage id="view.filter.detail.open" />{" "}
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  </a>
                </div>
              </article>
            ) : (
              <section className={styles.stage}>
                <div className={styles.emptyIcon} aria-hidden="true">
                  <FontAwesomeIcon icon={faList} />
                </div>
                <h3 className="h5">
                  <FormattedMessage id="view.filter.empty.title" />
                </h3>
                <p className="text-body-secondary mb-0">
                  <FormattedMessage id="view.filter.empty.description" />
                </p>
              </section>
            )}
          </Col>
        </Row>
      )}
    </div>
  );
}
