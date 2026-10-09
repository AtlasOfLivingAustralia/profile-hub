import { Col, Placeholder, Row } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";

import type { ProfileImage } from "#/api";
import { RichText } from "#/components";
import { resolveMediaUrl } from "#/helpers/utils/resolveMediaUrl";

import styles from "./ProfileMedia.module.css";

export function ProfileMedia({
  mapSnapshot,
  primaryImage,
  imageAlt,
  imageLoading = false,
}: {
  mapSnapshot?: string | null;
  primaryImage: ProfileImage | null;
  imageAlt: string;
  imageLoading?: boolean;
}) {
  const intl = useIntl();
  const mapSnapshotUrl = resolveMediaUrl(mapSnapshot);
  const imageUrl = resolveMediaUrl(
    primaryImage?.largeImageUrl || primaryImage?.thumbnailUrl,
  );

  if (!mapSnapshotUrl && !imageUrl && !imageLoading) return null;

  return (
    <Row className="g-4">
      {mapSnapshotUrl && (
        <Col xs={12} md={6}>
          <figure className={styles.mediaCard}>
            <img
              src={mapSnapshotUrl}
              alt={intl.formatMessage({ id: "view.profile.map.alt" })}
              className={styles.mediaImage}
            />
            <figcaption className={styles.mediaCaption}>
              <FormattedMessage id="view.profile.map.caption" />
            </figcaption>
          </figure>
        </Col>
      )}
      {imageLoading && !imageUrl && (
        <Col xs={12} md={6}>
          <div
            className={styles.mediaPlaceholder}
            role="status"
            aria-label={intl.formatMessage({
              id: "component.pageLoader.ariaLabel",
            })}
          >
            <Placeholder animation="glow" className={styles.mediaSkeleton}>
              <Placeholder className={styles.mediaSkeletonBlock} />
            </Placeholder>
          </div>
        </Col>
      )}
      {imageUrl && (
        <Col xs={12} md={6}>
          <figure className={styles.mediaCard}>
            <img src={imageUrl} alt={imageAlt} className={styles.mediaImage} />
            {(primaryImage?.caption ||
              primaryImage?.dataResourceName ||
              primaryImage?.metadata?.creator) && (
              <figcaption className={styles.mediaCaption}>
                {primaryImage.caption && (
                  <RichText html={primaryImage.caption} />
                )}
                {primaryImage.dataResourceName && (
                  <div>{primaryImage.dataResourceName}</div>
                )}
                {primaryImage.metadata?.creator && (
                  <div>
                    <FormattedMessage
                      id="view.profile.image.by"
                      values={{ creator: primaryImage.metadata.creator }}
                    />
                  </div>
                )}
              </figcaption>
            )}
          </figure>
        </Col>
      )}
    </Row>
  );
}
