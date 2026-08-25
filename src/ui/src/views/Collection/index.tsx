import Container from "react-bootstrap/Container";
import { useIntl } from "react-intl";
import {
  type LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useParams,
} from "react-router";

import api from "#/api";
import { ApiError } from "#/api/query";
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

export type CollectionLoaderData = {
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

export async function loader({
  params,
}: LoaderFunctionArgs): Promise<CollectionLoaderData> {
  const slug = params.slug;
  if (!slug) {
    throw new Response("error.collection.notFound", { status: 404 });
  }

  try {
    const collection = await api.opus.get(slug);
    cacheCollectionTheme(slug, collection.theme);
    return { collection };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Response(error.message || "error.collection.notFound", {
        status: error.status,
      });
    }
    throw error;
  }
}

export function HydrateFallback() {
  const { slug } = useParams<{ slug: string }>();
  const theme = slug ? readCachedCollectionTheme(slug) : null;

  return (
    <>
      {theme && <CollectionTheme theme={theme} />}
      <PageLoader fullPage />
    </>
  );
}

export function Component() {
  const intl = useIntl();
  const { collection } = useLoaderData<typeof loader>();

  return (
    <>
      <title>
        {intl.formatMessage(
          { id: "app.documentTitle" },
          { title: collection.title },
        )}
      </title>
      <CollectionTheme theme={collection.theme} />
      <Banner
        title={collection.title}
        bannerOverlay={collection.opusLayoutConfig.bannerOverlayText}
        imageUrls={bannerImagesFor(collection)}
        interval={collection.opusLayoutConfig?.duration}
      />
      <Container className="py-5">
        <Outlet context={{ collection } satisfies CollectionOutletContext} />
      </Container>
    </>
  );
}
