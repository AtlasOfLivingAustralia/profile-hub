import Spinner, { type SpinnerProps } from "react-bootstrap/Spinner";
import { useIntl } from "react-intl";

import styles from "./PageLoader.module.css";

interface PageLoaderProps {
  fullPage?: boolean;
  size?: SpinnerProps["size"];
}

export default function PageLoader({
  fullPage = false,
  size,
}: PageLoaderProps) {
  const intl = useIntl();

  return (
    <div
      className={`w-100 d-flex justify-content-center align-items-center ${
        fullPage ? styles.fullPage : styles.container
      }`}
      role="status"
      aria-label={intl.formatMessage({ id: "component.pageLoader.ariaLabel" })}
    >
      <Spinner
        size={size}
        style={{ color: "var(--bs-primary)" }}
        aria-hidden="true"
      />
    </div>
  );
}
