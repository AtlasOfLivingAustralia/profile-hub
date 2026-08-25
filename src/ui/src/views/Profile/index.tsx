import { useEffect, useMemo, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useOutletContext, useParams } from "react-router";

import api from "#/api";
import { ApiError } from "#/api/query";
import type { Profile, ProfileImage } from "#/api/types";
import PageLoader from "#/components/PageLoader";

import type { CollectionOutletContext } from "../Collection";

// Profiles page components
import { Attributes } from "./components/Attributes";
import { BhlList } from "./components/BhlList";
import { Bibliography } from "./components/Bibliography";
import { ClassificationList } from "./components/ClassificationList";
import { LinkList } from "./components/LinkList";
import { ProfileFooter } from "./components/ProfileFooter";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileMedia } from "./components/ProfileMedia";

import {
  formatProfileName,
  otherNamesFromAttributes,
  sortByOrder,
} from "./helpers";

export function Component() {
  const intl = useIntl();
  const { slug, nameOrId } = useParams<{ slug: string; nameOrId: string }>();
  const { collection } = useOutletContext<CollectionOutletContext>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [primaryImage, setPrimaryImage] = useState<ProfileImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<"notFound" | "generic" | null>(null);

  useEffect(() => {
    if (!slug || !nameOrId) return;

    const opusId = slug;
    const profileId = nameOrId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setProfile(null);
      setPrimaryImage(null);

      try {
        const data = await api.profile.get(opusId, profileId, {
          fullClassification: true,
        });
        if (cancelled) return;

        setProfile(data.profile);

        if (data.profile.guid && !data.profile.archivedDate) {
          try {
            const images = await api.profile.images(opusId, data.profile.uuid, {
              searchIdentifier: `lsid:${data.profile.guid}`,
              pageSize: 1,
              startIndex: 0,
            });
            if (!cancelled) {
              setPrimaryImage(
                images.primaryImage ?? images.images?.[0] ?? null,
              );
            }
          } catch {
            if (!cancelled) setPrimaryImage(null);
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (
          err instanceof ApiError &&
          (err.status === 404 || err.status === 400)
        ) {
          setError("notFound");
        } else {
          setError("generic");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [slug, nameOrId]);

  const otherNames = useMemo(
    () => otherNamesFromAttributes(profile?.attributes),
    [profile?.attributes],
  );

  const attributes = useMemo(
    () =>
      sortByOrder(profile?.attributes ?? []).filter(
        (attribute) => !attribute.containsName,
      ),
    [profile?.attributes],
  );

  const bibliography = useMemo(
    () => sortByOrder(profile?.bibliography ?? []),
    [profile?.bibliography],
  );

  const classification = profile?.classification ?? [];
  const links = profile?.links ?? [];
  const bhl = profile?.bhl ?? [];
  const authorship = profile?.authorship ?? [];

  const documentTitle = profile
    ? intl.formatMessage(
        { id: "app.documentTitle" },
        { title: formatProfileName(profile) },
      )
    : intl.formatMessage(
        { id: "app.documentTitle" },
        { title: collection.title },
      );

  if (loading) {
    return (
      <div className="py-5">
        <title>{documentTitle}</title>
        <PageLoader />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="vstack gap-3">
        <title>{documentTitle}</title>
        <Alert variant="danger" className="mb-0">
          <FormattedMessage
            id={
              error === "notFound"
                ? "view.profile.error.notFound"
                : "view.profile.error.loadFailed"
            }
          />
        </Alert>
        <Link
          to={`/opus/${slug}`}
          className="btn btn-outline-primary align-self-start"
        >
          <FormattedMessage id="view.profile.action.backToCollection" />
        </Link>
      </div>
    );
  }

  const title = formatProfileName(profile);
  const archived = Boolean(profile.archivedDate);

  return (
    <article className="vstack gap-4">
      <title>{documentTitle}</title>

      <ProfileHeader
        profile={profile}
        classification={classification}
        otherNames={otherNames}
        slug={slug!}
      />

      {archived && profile.archiveComment && (
        <Alert variant="warning" className="mb-0">
          {profile.archiveComment}
        </Alert>
      )}

      {!archived && (
        <ProfileMedia
          mapSnapshot={profile.mapSnapshot}
          primaryImage={primaryImage}
          imageAlt={title}
        />
      )}

      <Attributes attributes={attributes} />

      {!archived && <ClassificationList nodes={classification} slug={slug!} />}

      <LinkList links={links} />
      <BhlList items={bhl} />
      <Bibliography entries={bibliography} />

      <ProfileFooter
        profile={profile}
        authorship={authorship}
        copyrightText={collection.copyrightText}
      />
    </article>
  );
}
