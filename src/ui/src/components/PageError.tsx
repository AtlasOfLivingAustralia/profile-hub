import {
  faArrowRotateRight,
  faCompass,
  faHouse,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useRouteError,
} from "react-router";

import { getErrorMessage } from "#/helpers";

import styles from "./PageError.module.css";

function getStatus(error: unknown): number | undefined {
  if (isRouteErrorResponse(error)) return error.status;
  if (error instanceof Response) return error.status;

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return undefined;
}

export default function PageError() {
  const error = useRouteError();
  const location = useLocation();
  const status = getStatus(error);
  const notFound = status === 404;
  const title = notFound ? "Page not found" : "Something went wrong";
  const description = notFound
    ? "The page may have moved, the collection may no longer exist, or the address may be incorrect."
    : getErrorMessage(error);

  return (
    <main className={styles.page}>
      <title>{title} | Profile collections</title>

      <Container className={styles.container}>
        <section className="text-center" aria-labelledby="error-title">
          <div
            className={`${styles.icon} ${
              notFound ? styles.notFoundIcon : styles.errorIcon
            }`}
            aria-hidden="true"
          >
            <FontAwesomeIcon
              icon={notFound ? faCompass : faTriangleExclamation}
            />
          </div>

          <p className={styles.eyebrow}>
            {status ? `Error ${status}` : "Unexpected error"}
          </p>
          <h1 id="error-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>

          {notFound && <code className={styles.path}>{location.pathname}</code>}

          <div className={styles.actions}>
            <Link to="/" className="btn btn-primary">
              <FontAwesomeIcon icon={faHouse} className="me-2" />
              Back to homepage
            </Link>

            {!notFound && (
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => window.location.reload()}
              >
                <FontAwesomeIcon icon={faArrowRotateRight} className="me-2" />
                Try again
              </Button>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
