import Placeholder from "react-bootstrap/Placeholder";

import styles from "./TaxaSkeleton.module.css";

type TaxaSkeletonProps = {
  count: number;
};

export function TaxaSkeleton({ count }: TaxaSkeletonProps) {
  if (count <= 0) return null;

  return (
    <div className={styles.taxa} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Doesn't matter for skeleton loader
        <div key={index} className={styles.item}>
          <Placeholder animation="glow" className={styles.placeholders}>
            <Placeholder className={`rounded-pill ${styles.name}`} xs={7} />
            <Placeholder className={`rounded-pill ${styles.badge}`} />
          </Placeholder>
        </div>
      ))}
    </div>
  );
}
