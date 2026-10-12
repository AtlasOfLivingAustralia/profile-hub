import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useMemo, useState } from "react";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from "react-bootstrap";

import { FormattedMessage, useIntl } from "react-intl";
import { Link, Navigate, useNavigate } from "react-router";

import api, { type Tag } from "#/api";
import { PageLoader, SearchableDropdown } from "#/components";
import { getErrorMessage } from "#/helpers";
import { useALA } from "#/helpers/context/useALA";
import { EXPIRY, QUERY_KEYS } from "#/helpers/queryClient";

import styles from "./index.module.css";

type DataResourceOption = {
  id: string;
  name: string;
};

const DESCRIPTION_MAX = 300;

export function Component() {
  const intl = useIntl();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated } = useALA();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedResource, setSelectedResource] =
    useState<DataResourceOption | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const queryClient = useQueryClient();

  const {
    data: resourcesData,
    error: resourcesError,
    isPending: resourcesPending,
  } = useQuery({
    queryKey: QUERY_KEYS.dataResources,
    queryFn: async () => {
      const resourceMap = await api.opus.dataResources();
      const options = Object.entries(resourceMap ?? {}).map(([id, name]) => ({
        id,
        name: String(name).trim(),
      }));
      options.sort((a, b) => a.name.localeCompare(b.name));
      return options;
    },
    staleTime: EXPIRY.meta,
    gcTime: EXPIRY.meta,
  });
  const {
    data: tagsData,
    error: tagsError,
    isPending: tagsPending,
  } = useQuery({
    queryKey: QUERY_KEYS.tags,
    queryFn: async () => {
      const tagsResponse = await api.opus.tags();
      return tagsResponse?.tags ?? [];
    },
    staleTime: EXPIRY.meta,
    gcTime: EXPIRY.meta,
  });

  const resources = resourcesData ?? null;
  const availableTags = tagsData ?? [];
  const metaError = resourcesError ?? tagsError;
  const loadingMeta = !metaError && (resourcesPending || tagsPending);

  const unusedTags = useMemo(
    () =>
      availableTags.filter(
        (tag) => !selectedTags.some((selected) => selected.uuid === tag.uuid),
      ),
    [availableTags, selectedTags],
  );

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedResource || !title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.opus.create({
        title: title.trim(),
        dataResourceUid: selectedResource.id,
        description: description.trim() || undefined,
        tags: selectedTags,
      });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.opusList });
      const slug = created.shortName || created.uuid;
      navigate(`/opus/${encodeURIComponent(slug)}`);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className={styles.title}>
            <FormattedMessage id="view.collectionCreate.title" />
          </h1>
          <p className="text-body-secondary mb-0">
            <FormattedMessage id="view.collectionCreate.lede" />
          </p>
        </div>
        <Link to="/" className="btn btn-outline-secondary">
          <FormattedMessage id="view.collectionCreate.cancel" />
        </Link>
      </div>

      {loadingMeta ? (
        <PageLoader />
      ) : metaError ? (
        <Alert variant="danger">{getErrorMessage(metaError, intl)}</Alert>
      ) : (
        <Card className={styles.card}>
          <Card.Header>
            <FormattedMessage id="view.collectionCreate.overviewHeading" />
          </Card.Header>
          <Card.Body>
            <Form onSubmit={onSubmit}>
              <Row className="g-4">
                <Col xs={12}>
                  <Form.Group controlId="collection-title">
                    <Form.Label>
                      <FormattedMessage id="view.collectionCreate.field.title" />
                    </Form.Label>
                    <Form.Control
                      required
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="collection-data-resource">
                    <Form.Label>
                      <FormattedMessage id="view.collectionCreate.field.dataResource" />
                    </Form.Label>
                    <SearchableDropdown
                      id="collection-data-resource"
                      options={resources ?? []}
                      value={selectedResource}
                      onChange={setSelectedResource}
                      getOptionKey={(resource) => resource.id}
                      getOptionLabel={(resource) => resource.name}
                      getOptionDescription={(resource) => resource.id}
                      renderOption={(resource) => (
                        <>
                          {resource.name}{" "}
                          <span className="text-body-secondary">
                            ({resource.id})
                          </span>
                        </>
                      )}
                      placeholder={intl.formatMessage({
                        id: "view.collectionCreate.field.dataResourcePlaceholder",
                      })}
                      emptyMessage={
                        <FormattedMessage id="view.collectionCreate.noDataResources" />
                      }
                      disabled={submitting}
                    />
                    <Form.Text>
                      <FormattedMessage id="view.collectionCreate.field.dataResourceHelp" />
                    </Form.Text>
                    {!selectedResource && (
                      <Alert variant="danger" className="mt-2 mb-0 py-2">
                        <FormattedMessage id="view.collectionCreate.dataResourceRequired" />
                      </Alert>
                    )}
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="collection-description">
                    <Form.Label>
                      <FormattedMessage id="view.collectionCreate.field.description" />
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      maxLength={DESCRIPTION_MAX}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                    <Form.Text>
                      {description.length}/{DESCRIPTION_MAX}
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col xs={12}>
                  <Form.Group controlId="collection-tags">
                    <Form.Label>
                      <FormattedMessage id="view.collectionCreate.field.tags" />
                    </Form.Label>
                    <Form.Select
                      value={selectedTagId}
                      onChange={(event) => {
                        const tag = unusedTags.find(
                          (item) => item.uuid === event.target.value,
                        );
                        if (tag) {
                          setSelectedTags((current) => [...current, tag]);
                        }
                        setSelectedTagId("");
                      }}
                    >
                      <option value="">
                        {intl.formatMessage({
                          id: "view.collectionCreate.field.tagsPlaceholder",
                        })}
                      </option>
                      {unusedTags
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((tag) => (
                          <option key={tag.uuid} value={tag.uuid}>
                            {tag.name}
                          </option>
                        ))}
                    </Form.Select>
                    {selectedTags.length > 0 && (
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {selectedTags.map((tag) => (
                          <Badge
                            key={tag.uuid}
                            bg="secondary"
                            className={styles.tag}
                            style={{ backgroundColor: tag.colour || undefined }}
                            as="button"
                            type="button"
                            onClick={() =>
                              setSelectedTags((current) =>
                                current.filter(
                                  (item) => item.uuid !== tag.uuid,
                                ),
                              )
                            }
                          >
                            {tag.name} ×
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {error != null && (
                <Alert variant="danger" className="mt-4 mb-0">
                  {getErrorMessage(error, intl)}
                </Alert>
              )}

              <div className="mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !selectedResource || !title.trim()}
                >
                  <FormattedMessage
                    id={
                      submitting
                        ? "view.collectionCreate.submitting"
                        : "view.collectionCreate.submit"
                    }
                  />
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
