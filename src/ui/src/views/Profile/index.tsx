import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Alert } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useOutletContext, useParams } from "react-router";

import api from "#/api";
import { ApiError } from "#/api/query";
import { PageLoader } from "#/components";
import { EXPIRY, QUERY_KEYS } from "#/helpers/queryClient";

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

  const {
    data: profileData,
    isPending: loading,
    isError: profileFailed,
    error: profileError,
  } = useQuery({
    queryKey: QUERY_KEYS.profile(slug ?? "", nameOrId ?? ""),
    queryFn: () =>
      api.profile.get(slug!, nameOrId!, { fullClassification: true }),
    enabled: Boolean(slug && nameOrId),
    staleTime: EXPIRY.profile,
    gcTime: EXPIRY.profile,
  });

  const profile = profileData?.profile;
  const imageEnabled = Boolean(
    slug && profile?.uuid && profile.guid && !profile.archivedDate,
  );
  const searchIdentifier = profile?.guid ? `lsid:${profile.guid}` : "";

  const {
    data: imageData,
    isPending: imageIsPending,
    isError: imageFailed,
  } = useQuery({
    queryKey: QUERY_KEYS.profileImages(
      slug ?? "",
      profile?.uuid ?? "",
      searchIdentifier,
    ),
    queryFn: async () => {
      const images = await api.profile.images(slug!, profile!.uuid, {
        searchIdentifier,
        pageSize: 1,
        startIndex: 0,
      });
      return images.primaryImage ?? images.images?.[0] ?? null;
    },
    enabled: imageEnabled,
    staleTime: EXPIRY.primaryImage,
  });

  const imageLoading = imageEnabled && imageIsPending;
  const error = profileFailed
    ? profileError instanceof ApiError &&
      (profileError.status === 404 || profileError.status === 400)
      ? "notFound"
      : "generic"
    : null;
  const primaryImage =
    !imageEnabled || imageFailed ? null : (imageData ?? null);

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
          imageLoading={imageLoading}
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
