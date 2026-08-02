import {
	faBinoculars,
	faBookOpen,
	faChevronRight,
	faFilter,
	faFingerprint,
	faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useOutletContext } from "react-router";

import type { CollectionOutletContext } from "../Collection";

import styles from "./index.module.css";

function RichText({ html }: { html?: string }) {
	if (!html) {
		return <p className="text-body-secondary mb-0">No information available.</p>;
	}

	return (
		<div
			className={styles.richText}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: Collection content is stored as rich HTML by the API
			dangerouslySetInnerHTML={{ __html: html }}
		/>
	);
}

export function Component() {
	const { collection } = useOutletContext<CollectionOutletContext>();
	const actions = [
		{
			label: "Search",
			icon: faSearch,
			helpText: collection.opusLayoutConfig.helpTextSearch,
		},
		{
			label: "Browse",
			icon: faBinoculars,
			helpText: collection.opusLayoutConfig.helpTextBrowse,
		},
		...(collection.keybaseProjectId
			? [
				{
					label: "Identify",
					icon: faFingerprint,
					helpText: collection.opusLayoutConfig.helpTextIdentify,
				},
			]
			: []),
		{
			label: "Filter",
			icon: faFilter,
			helpText: collection.opusLayoutConfig.helpTextFilter,
		},
		{
			label: "Library",
			icon: faBookOpen,
			helpText: collection.opusLayoutConfig.helpTextDocuments,
		},
	];

	return (
		<Row className="g-4">
			<Col md={12} lg="auto">
				<div className={styles.panel}>
					<h2 className={styles.heading}>Explore this collection</h2>
					<div className="vstack gap-2">
						{actions.map(({ label, icon, helpText }) => (
							<Button
								key={label}
								variant="light"
								className={styles.actionButton}
								title={helpText}
							>
								<span className={styles.actionIcon}>
									<FontAwesomeIcon icon={icon} />
								</span>
								<span>{label}</span>
								<FontAwesomeIcon
									icon={faChevronRight}
									className={styles.actionArrow}
								/>
							</Button>
						))}
					</div>
				</div>
			</Col>
			<Col md={12} lg={8}>
				<section className="px-2 px-md-4 pt-2">
					<h2 className="mb-4 text-body-secondary">About</h2>
					<RichText html={collection.aboutHtml} />
					<h2 className="my-4 text-body-secondary">Collection information</h2>
					<RichText html={collection.opusLayoutConfig.explanatoryText} />
				</section>
			</Col>
		</Row>
	);
}
