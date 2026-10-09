import { useQuery } from "@tanstack/react-query";
import { type SubmitEvent, useMemo, useState } from "react";
import { Alert, Button, Form, ListGroup } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { useOutletContext, useParams } from "react-router";

import api, { type SpeciesListSummary } from "#/api";
import { PageLoader } from "#/components";
import { useALA } from "#/helpers/context/useALA";
import { invalidateFilteredReads, QUERY_KEYS } from "#/helpers/queryClient";
import {
  clearSpeciesListFilter,
  useSpeciesListFilter,
  writeSpeciesListFilter,
} from "#/helpers/speciesListFilter";

import type { CollectionOutletContext } from "../Collection";

const LIST_STALE_TIME = 5 * 60 * 1000;

export function Component() {
  const intl = useIntl();
  const { slug } = useParams<{ slug: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const { userid, isAuthenticated } = useALA();
  const savedFilter = useSpeciesListFilter();
  const savedId = savedFilter?.listId ?? "";

  const [draftId, setDraftId] = useState(savedId);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [syncedSavedId, setSyncedSavedId] = useState(savedId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);

  if (savedId !== syncedSavedId) {
    setSyncedSavedId(savedId);
    setDraftId(savedId);
    setQuery("");
    setEditing(false);
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

  const draft = lists.find((list) => list.dataResourceUid === draftId);
  const draftLabel = draft?.title ?? draftId;
  const inputValue = editing ? query : draftLabel;

  const matches = useMemo(() => {
    const needle = (editing ? query : "").trim().toLowerCase();
    const source = needle
      ? lists.filter(
          (list) =>
            list.title.toLowerCase().includes(needle) ||
            list.dataResourceUid.toLowerCase().includes(needle),
        )
      : lists;
    return source.slice(0, 10);
  }, [editing, lists, query]);

  async function persist(listId: string) {
    if (!slug) return;
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      if (listId) {
        await api.lists.checkFlorulaList(listId);
        writeSpeciesListFilter({
          listId,
          opusUuid: collection.uuid,
          userId: isAuthenticated ? userid : "",
        });
      } else {
        clearSpeciesListFilter();
      }
      invalidateFilteredReads();
      setSaved(true);
    } catch (error) {
      setSaveError(error);
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftId) return;
    void persist(draftId);
  }

  function selectList(list: SpeciesListSummary) {
    setDraftId(list.dataResourceUid);
    setQuery("");
    setEditing(false);
    setSaved(false);
  }

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
      ) : listsError ? (
        savedId && (
          <div>
            <Button
              type="button"
              variant="outline-secondary"
              disabled={saving}
              onClick={() => {
                void persist("");
              }}
            >
              <FormattedMessage id="view.filter.clear" />
            </Button>
          </div>
        )
      ) : (
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="florulaListId">
            <Form.Label>
              <FormattedMessage id="view.filter.field.label" />
            </Form.Label>
            <Form.Control
              value={inputValue}
              autoComplete="off"
              placeholder={intl.formatMessage({
                id: "view.filter.field.placeholder",
              })}
              onChange={(event) => {
                setQuery(event.target.value);
                setEditing(true);
                setDraftId("");
                setSaved(false);
              }}
              onFocus={() => {
                if (!editing) {
                  setQuery(draftLabel);
                  setEditing(true);
                }
              }}
            />
            <Form.Text>
              <FormattedMessage id="view.filter.field.help" />
            </Form.Text>
            {editing && (
              <ListGroup className="mt-2">
                {matches.length === 0 ? (
                  <ListGroup.Item disabled>
                    <FormattedMessage id="view.filter.noMatches" />
                  </ListGroup.Item>
                ) : (
                  matches.map((list) => (
                    <ListGroup.Item
                      key={list.dataResourceUid}
                      action
                      active={list.dataResourceUid === draftId}
                      onClick={() => selectList(list)}
                    >
                      {list.title}
                    </ListGroup.Item>
                  ))
                )}
              </ListGroup>
            )}
          </Form.Group>

          {saveError != null && (
            <Alert variant="danger" className="mt-3 mb-0">
              <FormattedMessage id="view.filter.error.saveFailed" />
            </Alert>
          )}
          {saved && (
            <Alert variant="success" className="mt-3 mb-0">
              <FormattedMessage id="view.filter.saved" />
            </Alert>
          )}

          <div className="d-flex gap-2 mt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !draftId}
            >
              <FormattedMessage id="view.filter.submit" />
            </Button>
            <Button
              type="button"
              variant="outline-secondary"
              disabled={saving || !savedId}
              onClick={() => {
                setDraftId("");
                setQuery("");
                setEditing(false);
                void persist("");
              }}
            >
              <FormattedMessage id="view.filter.clear" />
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
