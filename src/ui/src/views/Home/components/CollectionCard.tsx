import Card from "react-bootstrap/Card";
import Placeholder from "react-bootstrap/Placeholder";
import { Link } from "react-router";

import type { Collection } from "#/api/types";
import styles from "./CollectionCard.module.css";

export function CollectionCard({
	collection,
}: {
	collection: Collection | null;
}) {
	if (!collection) {
		return (
			<Card className={`${styles.card} h-100 rounded-4 shadow-sm`}>
				<Placeholder as="div" animation="glow">
					<Placeholder
						className={`${styles.skeletonImage} rounded-top-4`}
					/>
				</Placeholder>
				<Card.Body className="mt-2">
					<Placeholder as={Card.Title} animation="wave">
						<Placeholder xs={8} />
					</Placeholder>
					<Placeholder as={Card.Text} animation="wave">
						<Placeholder xs={12} size="sm" />
						<Placeholder xs={10} size="sm" />
						<Placeholder xs={7} size="sm" />
					</Placeholder>
				</Card.Body>
			</Card>
		);
	}

	const slug = collection.shortName ?? collection.uuid;

	return (
		<Link to={`/opus/${slug}`} className={styles.link}>
			<Card className={`${styles.card} h-100 rounded-4 shadow-sm`}>
				{collection.brandingConfig.thumbnailUrl ? (
					<Card.Img
						variant="top"
						src={collection.brandingConfig.thumbnailUrl}
						className={`${styles.thumbnail} rounded-top-4`}
					/>
				) : (
					<div className={`${styles.placeholder} rounded-top-4`}>
						<img
							src="/favicon.svg"
							alt=""
							className={styles.placeholderLogo}
						/>
					</div>
				)}
				<Card.Body className="mt-2">
					<Card.Title>{collection.title}</Card.Title>
					<Card.Text className={`${styles.description} small text-muted`}>
						{collection.description || "No description provided"}
					</Card.Text>
				</Card.Body>
			</Card>
		</Link>
	);
}
