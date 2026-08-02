import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { Outlet, useParams } from "react-router";

import api from "#/api";
import type { Collection } from "#/api/types";
import PageLoader from "#/components/PageLoader";
import {
  cacheCollectionTheme,
  readCachedCollectionTheme,
} from "#/helpers/collectionTheme";

import { Banner } from "./components/Banner";
import { CollectionTheme } from "./components/CollectionTheme";

export type CollectionOutletContext = {
  collection: Collection;
};

function bannerImagesFor(collection: Collection): string[] {
  const bannerImages =
    collection.opusLayoutConfig?.images
      ?.map((image) => image.imageUrl)
      .filter((url): url is string => Boolean(url)) ?? [];

  if (bannerImages.length === 0) {
    const fallback =
      collection.brandingConfig.opusBannerUrl ??
      collection.brandingConfig.profileBannerUrl;
    if (fallback) bannerImages.push(fallback);
  }

  return bannerImages;
}

export function Component() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const theme =
    collection?.theme ?? (slug ? readCachedCollectionTheme(slug) : null);

  useEffect(() => {
    if (!slug) return;
    const collectionSlug = slug;

    async function fetchCollection() {
      try {
        const next = await api.opus.get(collectionSlug);
        setCollection(next);
        cacheCollectionTheme(collectionSlug, next.theme);
      } catch (_) {
        setCollection(null);
      }
    }

    fetchCollection();
  }, [slug]);

  return (
    <>
      {theme && <CollectionTheme theme={theme} />}
      {!collection ? (
        <PageLoader />
      ) : (
        <>
          <Banner
            title={collection.title}
            bannerOverlay={collection.opusLayoutConfig.bannerOverlayText}
            imageUrls={bannerImagesFor(collection)}
            interval={collection.opusLayoutConfig?.duration}
          />
          <Container className="py-5">
            <Outlet
              context={{ collection } satisfies CollectionOutletContext}
            />
          </Container>
        </>
      )}
    </>
  );
}
