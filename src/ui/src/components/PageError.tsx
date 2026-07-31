import { isRouteErrorResponse, useLocation, useRouteError } from "react-router";
import { getErrorMessage } from "#/helpers";

export default function PageError() {
  const error = useRouteError();
  const location = useLocation();

  return isRouteErrorResponse(error) && error.status === 404 ? (
    <>The requested page {location.pathname} can't be found</>
  ) : (
    <>An error occurred {getErrorMessage(error as Error)}</>
  );
}
