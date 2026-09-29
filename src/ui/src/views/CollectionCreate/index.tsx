import { type FormEvent, useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, Navigate, useNavigate } from "react-router";
import api from "#/api";
import type { Tag } from "#/api/types";
import PageLoader from "#/components/PageLoader";
import { getErrorMessage } from "#/helpers";
import { useALA } from "#/helpers/context/useALA";

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
  const [dataResourceQuery, setDataResourceQuery] = useState("");
  const [selectedResource, setSelectedResource] =
    useState<DataResourceOption | null>(null);
  const [resources, setResources] = useState<DataResourceOption[] | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [metaError, setMetaError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError(null);
      try {
        const [resourceMap, tagsResponse] = await Promise.all([
          api.opus.dataResources(),
          api.opus.tags(),
        ]);
        if (cancelled) return;
        const options = Object.entries(resourceMap ?? {}).map(([id, name]) => ({
          id,
          name: String(name).trim(),
        }));
        options.sort((a, b) => a.name.localeCompare(b.name));
        setResources(options);
        setAvailableTags(tagsResponse?.tags ?? []);
      } catch (err) {
        if (!cancelled) setMetaError(err);
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    }

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    const query = dataResourceQuery.trim().toLowerCase();
    if (!query) return resources.slice(0, 10);
    return resources
      .filter(
        (resource) =>
          resource.name.toLowerCase().includes(query) ||
          resource.id.toLowerCase().includes(query),
      )
      .slice(0, 10);
  }, [resources, dataResourceQuery]);

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

  async function onSubmit(event: FormEvent) {
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
                    <Form.Control
                      value={
                        selectedResource
                          ? selectedResource.name
                          : dataResourceQuery
                      }
                      onChange={(event) => {
                        setSelectedResource(null);
                        setDataResourceQuery(event.target.value);
                      }}
                      placeholder={intl.formatMessage({
                        id: "view.collectionCreate.field.dataResourcePlaceholder",
                      })}
                      autoComplete="off"
                      required={!selectedResource}
                    />
                    <Form.Text>
                      <FormattedMessage id="view.collectionCreate.field.dataResourceHelp" />
                    </Form.Text>
                    {!selectedResource && dataResourceQuery.trim() && (
                      <ListGroup className="mt-2">
                        {filteredResources.length === 0 ? (
                          <ListGroup.Item disabled>
                            <FormattedMessage id="view.collectionCreate.noDataResources" />
                          </ListGroup.Item>
                        ) : (
                          filteredResources.map((resource) => (
                            <ListGroup.Item
                              key={resource.id}
                              action
                              onClick={() => {
                                setSelectedResource(resource);
                                setDataResourceQuery(resource.name);
                              }}
                            >
                              {resource.name}{" "}
                              <span className="text-body-secondary">
                                ({resource.id})
                              </span>
                            </ListGroup.Item>
                          ))
                        )}
                      </ListGroup>
                    )}
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
