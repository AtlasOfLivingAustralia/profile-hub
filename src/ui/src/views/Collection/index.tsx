import { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import { Outlet, useParams } from "react-router";

import api from "#/api";
import type { Collection } from "#/api/types";
import PageLoader from "#/components/PageLoader";

import { Banner } from "./components/Banner";

export type CollectionOutletContext = {
	collection: Collection;
};

export function Component() {
	const { slug } = useParams<{ slug: string }>();
	const [collection, setCollection] = useState<Collection | null>(null);

	useEffect(() => {
		if (!slug) return;
		const collectionSlug = slug;

		async function fetchCollection() {
			try {
				setCollection(await api.opus.get(collectionSlug));
			} catch (_) {
				setCollection(null);
			}
		}

		fetchCollection();
	}, [slug]);

	if (!collection) {
		return <PageLoader />;
	}

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

	return (
		<>
			<Banner
				title={collection.title}
				bannerOverlay={collection.opusLayoutConfig.bannerOverlayText}
				imageUrls={bannerImages}
				interval={collection.opusLayoutConfig?.duration}
			/>
			<Container className="py-5">
				<Outlet context={{ collection } satisfies CollectionOutletContext} />
			</Container>
		</>
	);
}
