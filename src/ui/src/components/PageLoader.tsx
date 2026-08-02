import Spinner, { type SpinnerProps } from "react-bootstrap/Spinner";

import styles from "./PageLoader.module.css";

interface PageLoaderProps {
  fullPage?: boolean;
  size?: SpinnerProps["size"];
}

export default function PageLoader({
  fullPage = false,
  size,
}: PageLoaderProps) {
  return (
    <div
      className={`w-100 d-flex justify-content-center align-items-center ${
        fullPage ? styles.fullPage : styles.container
      }`}
      role="status"
      aria-label="Loading"
    >
      <Spinner
        size={size}
        style={{ color: "var(--bs-primary)" }}
        aria-hidden="true"
      />
    </div>
  );
}
